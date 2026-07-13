const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { sendPasswordResetEmail } = require('../email');

const router = express.Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NAME_CHANGE_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const PASSWORD_CHANGE_COOLDOWN_MS = 5 * 60 * 1000;
const RESET_REQUEST_COOLDOWN_MS = 60 * 1000;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

const VALID_LOCALES = ['en', 'fr', 'es', 'de', 'hu', 'zh'];
const VALID_THEME_MODES = ['light', 'dark', 'system'];

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

const cooldownRemainingMs = (lastChangedAt, cooldownMs) => {
  if (!lastChangedAt) return 0;
  const elapsed = Date.now() - new Date(lastChangedAt).getTime();
  return Math.max(0, cooldownMs - elapsed);
};

const formatDuration = (ms) => {
  const totalMinutes = Math.ceil(ms / 60000);
  if (totalMinutes < 60) return `${totalMinutes} minute${totalMinutes === 1 ? '' : 's'}`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} hour${hours === 1 ? '' : 's'}${minutes ? ` ${minutes} minute${minutes === 1 ? '' : 's'}` : ''}`;
};

const getProfile = (userId) => {
  const user = db
    .prepare(
      'SELECT id, email, display_name, name_changed_at, password_changed_at, preferred_locale, preferred_theme_mode FROM users WHERE id = ?'
    )
    .get(userId);
  const stats = db
    .prepare(
      `SELECT
         SUM(CASE WHEN mode = 'freeform' THEN 1 ELSE 0 END) AS life_story_count,
         SUM(CASE WHEN mode = 'questions' THEN 1 ELSE 0 END) AS lesson_count,
         COALESCE(SUM(view_count), 0) AS total_views
       FROM stories WHERE user_id = ?`
    )
    .get(userId);
  return {
    ...user,
    life_story_count: stats.life_story_count || 0,
    lesson_count: stats.lesson_count || 0,
    total_views: stats.total_views,
    name_change_cooldown_ms: cooldownRemainingMs(user.name_changed_at, NAME_CHANGE_COOLDOWN_MS),
    password_change_cooldown_ms: cooldownRemainingMs(
      user.password_changed_at,
      PASSWORD_CHANGE_COOLDOWN_MS
    ),
  };
};

router.post('/signup', async (req, res) => {
  const { email, password, display_name } = req.body;
  if (!email || !password || !display_name) {
    return res.status(400).json({ error: 'email, password, and display_name are required' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let userId;
  try {
    const result = db
      .prepare('INSERT INTO users (email, password_hash, display_name) VALUES (?, ?, ?)')
      .run(email.toLowerCase(), passwordHash, display_name);
    userId = result.lastInsertRowid;
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }
    throw err;
  }

  res.cookie('lr_token', signToken(userId), COOKIE_OPTIONS);
  res.status(201).json(getProfile(userId));
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const row = db
    .prepare('SELECT id, email, display_name, password_hash FROM users WHERE email = ?')
    .get(email.toLowerCase());
  const valid = row && (await bcrypt.compare(password, row.password_hash));
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.cookie('lr_token', signToken(row.id), COOKIE_OPTIONS);
  res.json(getProfile(row.id));
});

router.post('/logout', (req, res) => {
  res.clearCookie('lr_token', COOKIE_OPTIONS);
  res.status(204).end();
});

router.get('/me', requireAuth, (req, res) => {
  res.json(getProfile(req.user.id));
});

router.patch('/me', requireAuth, (req, res) => {
  const { display_name } = req.body;
  if (!display_name || !display_name.trim()) {
    return res.status(400).json({ error: 'display_name is required' });
  }

  const current = db
    .prepare('SELECT name_changed_at FROM users WHERE id = ?')
    .get(req.user.id);
  const remaining = cooldownRemainingMs(current.name_changed_at, NAME_CHANGE_COOLDOWN_MS);
  if (remaining > 0) {
    return res.status(429).json({
      error: `You can change your name again in ${formatDuration(remaining)}.`,
    });
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE users SET display_name = ?, name_changed_at = ? WHERE id = ?').run(
    display_name.trim(),
    now,
    req.user.id
  );
  res.json(getProfile(req.user.id));
});

router.patch('/preferences', requireAuth, (req, res) => {
  const { locale, theme_mode } = req.body;
  if (locale !== undefined && locale !== null && !VALID_LOCALES.includes(locale)) {
    return res.status(400).json({ error: 'Invalid locale' });
  }
  if (theme_mode !== undefined && theme_mode !== null && !VALID_THEME_MODES.includes(theme_mode)) {
    return res.status(400).json({ error: 'Invalid theme_mode' });
  }

  db.prepare(
    'UPDATE users SET preferred_locale = COALESCE(?, preferred_locale), preferred_theme_mode = COALESCE(?, preferred_theme_mode) WHERE id = ?'
  ).run(locale ?? null, theme_mode ?? null, req.user.id);
  res.json(getProfile(req.user.id));
});

router.post('/change-password', requireAuth, async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'current_password and new_password are required' });
  }
  if (new_password.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  const row = db
    .prepare('SELECT password_hash, password_changed_at FROM users WHERE id = ?')
    .get(req.user.id);
  const valid = await bcrypt.compare(current_password, row.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const remaining = cooldownRemainingMs(row.password_changed_at, PASSWORD_CHANGE_COOLDOWN_MS);
  if (remaining > 0) {
    return res.status(429).json({
      error: `You can change your password again in ${formatDuration(remaining)}.`,
    });
  }

  const newHash = await bcrypt.hash(new_password, 12);
  const now = new Date().toISOString();
  db.prepare('UPDATE users SET password_hash = ?, password_changed_at = ? WHERE id = ?').run(
    newHash,
    now,
    req.user.id
  );
  res.status(204).end();
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const genericResponse = () =>
    res.json({ message: "If an account exists for that email, we've sent a reset link." });

  if (!email || !EMAIL_RE.test(email)) {
    return genericResponse();
  }

  const row = db
    .prepare('SELECT id, email, reset_requested_at FROM users WHERE email = ?')
    .get(email.toLowerCase());
  if (!row) {
    return genericResponse();
  }

  const remaining = cooldownRemainingMs(row.reset_requested_at, RESET_REQUEST_COOLDOWN_MS);
  if (remaining > 0) {
    return genericResponse();
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + RESET_TOKEN_TTL_MS).toISOString();
  db.prepare(
    'UPDATE users SET reset_token_hash = ?, reset_token_expires_at = ?, reset_requested_at = ? WHERE id = ?'
  ).run(hashToken(rawToken), expiresAt, now.toISOString(), row.id);

  const resetUrl = `${process.env.FRONTEND_ORIGIN}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(row.email, resetUrl);

  genericResponse();
});

router.post('/reset-password', async (req, res) => {
  const { token, new_password } = req.body;
  if (!token || !new_password) {
    return res.status(400).json({ error: 'token and new_password are required' });
  }
  if (new_password.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  const row = db
    .prepare('SELECT id, reset_token_expires_at FROM users WHERE reset_token_hash = ?')
    .get(hashToken(token));
  if (!row || !row.reset_token_expires_at || new Date(row.reset_token_expires_at) < new Date()) {
    return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
  }

  const newHash = await bcrypt.hash(new_password, 12);
  const now = new Date().toISOString();
  db.prepare(
    'UPDATE users SET password_hash = ?, password_changed_at = ?, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?'
  ).run(newHash, now, row.id);

  res.status(204).end();
});

module.exports = router;
