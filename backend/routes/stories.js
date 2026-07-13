const express = require('express');
const db = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { generateStoryPdf, generateStoriesPdf } = require('../pdf');
const { translateStoryFields, translatePrompt } = require('../translate');
const { getWritingAssistance, reorderStoryContent, cleanupTranscript } = require('../ai');

const router = express.Router();

const MODES = ['freeform', 'questions'];
const VISIBILITIES = ['public', 'private'];
const LANGUAGES = ['en', 'fr', 'es', 'de', 'zh', 'hu'];

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'story';

const sendPdf = (res, doc, filename) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);
};

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

const attachAnswersBatch = (stories) => {
  const questionStoryIds = stories.filter((s) => s.mode === 'questions').map((s) => s.id);
  if (questionStoryIds.length === 0) return stories;
  const placeholders = questionStoryIds.map(() => '?').join(',');
  const rows = db
    .prepare(
      `SELECT a.story_id, q.id AS question_id, q.prompt, a.answer
       FROM story_answers a
       JOIN questions q ON q.id = a.question_id
       WHERE a.story_id IN (${placeholders})
       ORDER BY q.sort_order`
    )
    .all(...questionStoryIds);
  const answersByStory = new Map();
  for (const { story_id, ...answer } of rows) {
    if (!answersByStory.has(story_id)) answersByStory.set(story_id, []);
    answersByStory.get(story_id).push(answer);
  }
  return stories.map((story) =>
    story.mode === 'questions' ? { ...story, answers: answersByStory.get(story.id) || [] } : story
  );
};

const shapeStory = (story, viewerId) => {
  const isOwner = viewerId != null && viewerId === story.user_id;
  const isAnonymous = !!story.is_anonymous;
  return {
    ...story,
    is_anonymous: isAnonymous,
    author_display_name: isAnonymous && !isOwner ? null : story.author_display_name,
  };
};

const modeFilterClause = (mode) => {
  if (!mode) return '';
  if (!MODES.includes(mode)) return null;
  return ` AND mode = '${mode}'`;
};

const getViewableStory = (id, viewerId) => {
  const story = db
    .prepare(
      `SELECT s.*, u.display_name AS author_display_name
       FROM stories s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
    )
    .get(id);
  if (!story) return null;
  const isOwner = viewerId != null && viewerId === story.user_id;
  if (story.visibility !== 'public' && !isOwner) return null;
  return story;
};

const attachTranslatedAnswers = (translationId, targetLang) =>
  db
    .prepare(
      `SELECT sta.question_id, COALESCE(qt.prompt, q.prompt) AS prompt, sta.answer
       FROM story_translation_answers sta
       JOIN questions q ON q.id = sta.question_id
       LEFT JOIN question_translations qt ON qt.question_id = sta.question_id AND qt.language = ?
       WHERE sta.story_translation_id = ?
       ORDER BY q.sort_order`
    )
    .all(targetLang, translationId);

const shapeTranslation = (translation) => ({
  language: translation.language,
  title: translation.title,
  content: translation.content,
  answers: attachTranslatedAnswers(translation.id, translation.language),
});

const storeTranslation = db.transaction((storyId, targetLang, result, mode) => {
  const info = db
    .prepare('INSERT INTO story_translations (story_id, language, title, content) VALUES (?, ?, ?, ?)')
    .run(storyId, targetLang, result.title, result.content);
  if (mode === 'questions') {
    const insertAnswer = db.prepare(
      'INSERT INTO story_translation_answers (story_translation_id, question_id, answer) VALUES (?, ?, ?)'
    );
    result.answers.forEach((a) => insertAnswer.run(info.lastInsertRowid, a.question_id, a.answer));
  }
  return info.lastInsertRowid;
});

router.get('/questions', (req, res) => {
  const questions = db
    .prepare('SELECT id, prompt, sort_order FROM questions WHERE is_active = 1 ORDER BY sort_order')
    .all();
  res.json(questions);
});

router.get('/stories/mine', requireAuth, (req, res) => {
  const clause = modeFilterClause(req.query.mode);
  if (clause === null) {
    return res.status(400).json({ error: `mode must be one of: ${MODES.join(', ')}` });
  }
  const stories = attachAnswersBatch(
    db
      .prepare(
        `SELECT s.*, u.display_name AS author_display_name
         FROM stories s
         JOIN users u ON u.id = s.user_id
         WHERE s.user_id = ?${clause}
         ORDER BY s.created_at DESC`
      )
      .all(req.user.id)
  ).map((story) => shapeStory(story, req.user.id));
  res.json(stories);
});

router.get('/stories', optionalAuth, (req, res) => {
  const clause = modeFilterClause(req.query.mode);
  if (clause === null) {
    return res.status(400).json({ error: `mode must be one of: ${MODES.join(', ')}` });
  }
  const stories = attachAnswersBatch(
    db
      .prepare(
        `SELECT s.*, u.display_name AS author_display_name
         FROM stories s
         JOIN users u ON u.id = s.user_id
         WHERE s.visibility = 'public'${clause}
         ORDER BY s.created_at DESC`
      )
      .all()
  ).map((story) => shapeStory(story, req.user && req.user.id));
  res.json(stories);
});

router.get('/stories/export/all', requireAuth, (req, res) => {
  const stories = attachAnswersBatch(
    db.prepare('SELECT * FROM stories WHERE user_id = ? ORDER BY created_at ASC').all(req.user.id)
  );
  const doc = generateStoriesPdf(stories, req.user.display_name);
  sendPdf(res, doc, `${slugify(req.user.display_name)}-life-stories.pdf`);
});

router.get('/stories/:id', optionalAuth, (req, res) => {
  const story = getViewableStory(req.params.id, req.user && req.user.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });
  const isOwner = req.user && req.user.id === story.user_id;
  if (!isOwner) {
    db.prepare('UPDATE stories SET view_count = view_count + 1 WHERE id = ?').run(story.id);
    story.view_count += 1;
  }
  res.json(shapeStory(attachAnswers(story), req.user && req.user.id));
});

router.post('/stories/:id/translate', optionalAuth, async (req, res) => {
  const targetLang = req.body.target_language;
  if (!LANGUAGES.includes(targetLang)) {
    return res.status(400).json({ error: `target_language must be one of: ${LANGUAGES.join(', ')}` });
  }

  const story = getViewableStory(req.params.id, req.user && req.user.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });
  if (story.visibility !== 'public') {
    return res.status(403).json({ error: 'Only public stories can be translated' });
  }

  const storyWithAnswers = attachAnswers(story);

  if (targetLang === story.language) {
    return res.json({
      language: story.language,
      title: story.title,
      content: story.content,
      answers: storyWithAnswers.answers,
    });
  }

  const cached = db
    .prepare('SELECT * FROM story_translations WHERE story_id = ? AND language = ?')
    .get(story.id, targetLang);
  if (cached) {
    return res.json(shapeTranslation(cached));
  }

  if (!translateStoryFields) {
    return res.status(503).json({ error: 'Translation is not available right now' });
  }

  try {
    const answersInput = story.mode === 'questions' ? storyWithAnswers.answers : [];
    const result = await translateStoryFields(story, answersInput, targetLang);

    if (story.mode === 'questions') {
      const missingPrompts = answersInput.filter(
        (a) =>
          !db
            .prepare('SELECT 1 FROM question_translations WHERE question_id = ? AND language = ?')
            .get(a.question_id, targetLang)
      );
      const translatedPrompts = await Promise.all(
        missingPrompts.map(async (a) => ({
          question_id: a.question_id,
          prompt: await translatePrompt(a.prompt, targetLang),
        }))
      );
      const insertPrompt = db.prepare(
        'INSERT OR IGNORE INTO question_translations (question_id, language, prompt) VALUES (?, ?, ?)'
      );
      translatedPrompts.forEach((p) => insertPrompt.run(p.question_id, targetLang, p.prompt));
    }

    const translationId = storeTranslation(story.id, targetLang, result, story.mode);
    const stored = db.prepare('SELECT * FROM story_translations WHERE id = ?').get(translationId);
    res.status(201).json(shapeTranslation(stored));
  } catch (err) {
    console.error(`[translate] DeepL failed for story ${story.id} -> ${targetLang}:`, err);
    res.status(502).json({ error: 'Translation failed, please try again later' });
  }
});

router.post('/stories/assist', requireAuth, async (req, res) => {
  const { draft } = req.body;
  if (!draft || !draft.trim()) {
    return res.status(400).json({ error: 'draft is required' });
  }
  if (!getWritingAssistance) {
    return res.status(503).json({ error: 'Writing assistance is not available right now' });
  }
  try {
    const suggestion = await getWritingAssistance(draft);
    res.json({ suggestion });
  } catch (err) {
    console.error('[ai] writing assistance failed:', err);
    res.status(502).json({ error: 'Writing assistance failed, please try again later' });
  }
});

router.post('/stories/reorder-content', requireAuth, async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'content is required' });
  }
  if (!reorderStoryContent) {
    return res.status(503).json({ error: 'AI reordering is not available right now' });
  }
  try {
    const reordered = await reorderStoryContent(content);
    res.json({ content: reordered });
  } catch (err) {
    console.error('[ai] chronological reorder failed:', err);
    res.status(502).json({ error: 'Reordering failed, please try again later' });
  }
});

router.post('/stories/cleanup-voice', requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'text is required' });
  }
  if (!cleanupTranscript) {
    return res.status(503).json({ error: 'Voice cleanup is not available right now' });
  }
  try {
    const cleaned = await cleanupTranscript(text);
    res.json({ text: cleaned });
  } catch (err) {
    console.error('[ai] voice cleanup failed:', err);
    res.status(502).json({ error: 'Voice cleanup failed, please try again later' });
  }
});

router.get('/stories/:id/export', requireAuth, (req, res) => {
  const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(req.params.id);
  if (!story || story.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Story not found' });
  }
  const doc = generateStoryPdf(attachAnswers(story));
  sendPdf(res, doc, `${slugify(story.title)}.pdf`);
});

router.post('/stories', requireAuth, (req, res) => {
  const { mode, visibility = 'private', title, content, answers, is_anonymous = false, language = 'en' } = req.body;

  if (!MODES.includes(mode)) {
    return res.status(400).json({ error: `mode must be one of: ${MODES.join(', ')}` });
  }
  if (!VISIBILITIES.includes(visibility)) {
    return res.status(400).json({ error: `visibility must be one of: ${VISIBILITIES.join(', ')}` });
  }
  if (!LANGUAGES.includes(language)) {
    return res.status(400).json({ error: `language must be one of: ${LANGUAGES.join(', ')}` });
  }
  if (!title) {
    return res.status(400).json({ error: 'title is required' });
  }
  if (mode === 'freeform' && !content) {
    return res.status(400).json({ error: 'content is required for freeform stories' });
  }

  const insertStory = db.prepare(
    'INSERT INTO stories (user_id, mode, visibility, title, content, is_anonymous, language) VALUES (?, ?, ?, ?, ?, ?, ?)'
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
      mode === 'freeform' ? content : null,
      is_anonymous ? 1 : 0,
      language
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

  const story = db
    .prepare(
      `SELECT s.*, u.display_name AS author_display_name
       FROM stories s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
    )
    .get(storyId);
  res.status(201).json(shapeStory(attachAnswers(story), req.user.id));
});

router.patch('/stories/:id', requireAuth, (req, res) => {
  const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(req.params.id);
  if (!story || story.user_id !== req.user.id) {
    return res.status(404).json({ error: 'Story not found' });
  }

  const { title, content, visibility, answers, is_anonymous } = req.body;
  if (visibility !== undefined && !VISIBILITIES.includes(visibility)) {
    return res.status(400).json({ error: `visibility must be one of: ${VISIBILITIES.join(', ')}` });
  }

  db.prepare(
    `UPDATE stories SET
       title = COALESCE(?, title),
       content = COALESCE(?, content),
       visibility = COALESCE(?, visibility),
       is_anonymous = COALESCE(?, is_anonymous),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(
    title ?? null,
    content ?? null,
    visibility ?? null,
    is_anonymous === undefined ? null : is_anonymous ? 1 : 0,
    story.id
  );

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

  if (title !== undefined || content !== undefined || (story.mode === 'questions' && Array.isArray(answers))) {
    db.prepare('DELETE FROM story_translations WHERE story_id = ?').run(story.id);
  }

  const updated = db
    .prepare(
      `SELECT s.*, u.display_name AS author_display_name
       FROM stories s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
    )
    .get(story.id);
  res.json(shapeStory(attachAnswers(updated), req.user.id));
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
