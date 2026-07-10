const express = require('express');
const db = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const MODES = ['freeform', 'questions'];
const VISIBILITIES = ['public', 'private'];

const attachAnswers = (story) => {
  if (story.mode !== 'questions') return story;
  const answers = db
    .prepare(
      `SELECT q.id AS question_id, q.prompt, a.answer
       FROM story_answers a
       JOIN questions q ON q.id = a.question_id
       WHERE a.story_id = ?
       ORDER BY q.sort_order`
    )
    .all(story.id);
  return { ...story, answers };
};

router.get('/questions', (req, res) => {
  const questions = db
    .prepare('SELECT id, prompt, sort_order FROM questions WHERE is_active = 1 ORDER BY sort_order')
    .all();
  res.json(questions);
});

router.get('/stories/mine', requireAuth, (req, res) => {
  const stories = db
    .prepare('SELECT * FROM stories WHERE user_id = ? ORDER BY created_at DESC')
    .all(req.user.id)
    .map(attachAnswers);
  res.json(stories);
});

router.get('/stories', (req, res) => {
  const stories = db
    .prepare("SELECT * FROM stories WHERE visibility = 'public' ORDER BY created_at DESC")
    .all()
    .map(attachAnswers);
  res.json(stories);
});

router.get('/stories/:id', optionalAuth, (req, res) => {
  const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });
  const isOwner = req.user && req.user.id === story.user_id;
  if (story.visibility !== 'public' && !isOwner) {
    return res.status(404).json({ error: 'Story not found' });
  }
  if (!isOwner) {
    db.prepare('UPDATE stories SET view_count = view_count + 1 WHERE id = ?').run(story.id);
    story.view_count += 1;
  }
  res.json(attachAnswers(story));
});

router.post('/stories', requireAuth, (req, res) => {
  const { mode, visibility = 'private', title, content, answers } = req.body;

  if (!MODES.includes(mode)) {
    return res.status(400).json({ error: `mode must be one of: ${MODES.join(', ')}` });
  }
  if (!VISIBILITIES.includes(visibility)) {
    return res.status(400).json({ error: `visibility must be one of: ${VISIBILITIES.join(', ')}` });
  }
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  if (mode === 'freeform' && !content) {
    return res.status(400).json({ error: 'content is required for freeform stories' });
  }

  const insertStory = db.prepare(
    'INSERT INTO stories (user_id, mode, visibility, title, content) VALUES (?, ?, ?, ?, ?)'
  );
  const insertAnswer = db.prepare(
    'INSERT INTO story_answers (story_id, question_id, answer) VALUES (?, ?, ?)'
  );

  const storyId = db.transaction(() => {
    const result = insertStory.run(
      req.user.id,
      mode,
      visibility,
      title,
      mode === 'freeform' ? content : null
    );
    if (mode === 'questions' && Array.isArray(answers)) {
      for (const a of answers) {
        if (a && a.question_id && a.answer && a.answer.trim()) {
          insertAnswer.run(result.lastInsertRowid, a.question_id, a.answer);
        }
      }
    }
    return result.lastInsertRowid;
  })();

  const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(storyId);
  res.status(201).json(attachAnswers(story));
});

router.patch('/stories/:id', requireAuth, (req, res) => {
  const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(req.params.id);
  if (!story || story.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Story not found' });
  }

  const { title, content, visibility, answers } = req.body;
  if (visibility !== undefined && !VISIBILITIES.includes(visibility)) {
    return res.status(400).json({ error: `visibility must be one of: ${VISIBILITIES.join(', ')}` });
  }

  db.prepare(
    `UPDATE stories SET
       title = COALESCE(?, title),
       content = COALESCE(?, content),
       visibility = COALESCE(?, visibility),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(title ?? null, content ?? null, visibility ?? null, story.id);

  if (story.mode === 'questions' && Array.isArray(answers)) {
    const upsertAnswer = db.prepare(
      `INSERT INTO story_answers (story_id, question_id, answer) VALUES (?, ?, ?)
       ON CONFLICT(story_id, question_id) DO UPDATE SET answer = excluded.answer`
    );
    const tx = db.transaction(() => {
      for (const a of answers) {
        if (a && a.question_id && a.answer && a.answer.trim()) {
          upsertAnswer.run(story.id, a.question_id, a.answer);
        }
      }
    });
    tx();
  }

  const updated = db.prepare('SELECT * FROM stories WHERE id = ?').get(story.id);
  res.json(attachAnswers(updated));
});

router.delete('/stories/:id', requireAuth, (req, res) => {
  const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(req.params.id);
  if (!story || story.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Story not found' });
  }
  db.prepare('DELETE FROM stories WHERE id = ?').run(story.id);
  res.status(204).end();
});

module.exports = router;
