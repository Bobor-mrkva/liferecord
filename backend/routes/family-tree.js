const express = require('express');
const db = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { generateFamilyTreePdf } = require('../pdf');

const router = express.Router();

const VISIBILITIES = ['public', 'private'];
const HANDLES = ['top', 'right', 'bottom', 'left'];

const getOrCreateTree = (userId) => {
  let tree = db.prepare('SELECT * FROM family_trees WHERE user_id = ?').get(userId);
  if (!tree) {
    const result = db.prepare('INSERT INTO family_trees (user_id) VALUES (?)').run(userId);
    tree = db.prepare('SELECT * FROM family_trees WHERE id = ?').get(result.lastInsertRowid);
  }
  return tree;
};

const attachTreeContents = (tree) => {
  const bubbles = db
    .prepare('SELECT * FROM tree_bubbles WHERE tree_id = ? ORDER BY id')
    .all(tree.id);
  const connections = db
    .prepare('SELECT * FROM tree_connections WHERE tree_id = ? ORDER BY id')
    .all(tree.id);
  return { ...tree, bubbles, connections };
};

router.get('/family-tree/mine', requireAuth, (req, res) => {
  const tree = getOrCreateTree(req.user.id);
  res.json(attachTreeContents(tree));
});

router.get('/family-tree/mine/matches', requireAuth, (req, res) => {
  const tree = getOrCreateTree(req.user.id);
  if (tree.visibility !== 'public') {
    return res.json({ eligible: false, matches: [] });
  }

  const matches = db
    .prepare(
      `SELECT b.id AS bubble_id, b.name, b.birth_year, b.location,
              t.id AS tree_id, t.user_id AS tree_owner_id, u.display_name AS tree_owner_display_name
       FROM tree_bubbles b
       JOIN family_trees t ON t.id = b.tree_id
       JOIN users u ON u.id = t.user_id
       WHERE t.visibility = 'public'
         AND t.user_id != ?
         AND LOWER(TRIM(b.name)) IN (
           SELECT LOWER(TRIM(name)) FROM tree_bubbles WHERE tree_id = ?
         )
       ORDER BY b.name COLLATE NOCASE`
    )
    .all(req.user.id, tree.id);

  res.json({ eligible: true, matches });
});

router.get('/family-tree/mine/export', requireAuth, (req, res) => {
  const tree = attachTreeContents(getOrCreateTree(req.user.id));
  const doc = generateFamilyTreePdf(tree, req.user.display_name);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="family-tree.pdf"');
  doc.pipe(res);
});

router.patch('/family-tree/mine', requireAuth, (req, res) => {
  const { visibility } = req.body;
  if (visibility !== undefined && !VISIBILITIES.includes(visibility)) {
    return res.status(400).json({ error: `visibility must be one of: ${VISIBILITIES.join(', ')}` });
  }

  const tree = getOrCreateTree(req.user.id);
  db.prepare(
    `UPDATE family_trees SET visibility = COALESCE(?, visibility), updated_at = CURRENT_TIMESTAMP WHERE id = ?`
  ).run(visibility ?? null, tree.id);

  const updated = db.prepare('SELECT * FROM family_trees WHERE id = ?').get(tree.id);
  res.json(updated);
});

router.post('/family-tree/mine/bubbles', requireAuth, (req, res) => {
  const { name, birth_year, location, notes, position_x, position_y } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'name is required' });
  }

  const tree = getOrCreateTree(req.user.id);
  const result = db
    .prepare(
      `INSERT INTO tree_bubbles (tree_id, name, birth_year, location, notes, position_x, position_y)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      tree.id,
      name.trim(),
      birth_year ?? null,
      location ?? null,
      notes ?? null,
      position_x ?? 0,
      position_y ?? 0
    );

  const bubble = db.prepare('SELECT * FROM tree_bubbles WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(bubble);
});

router.patch('/family-tree/bubbles/:id', requireAuth, (req, res) => {
  const bubble = db
    .prepare(
      `SELECT b.*, t.user_id AS owner_id
       FROM tree_bubbles b
       JOIN family_trees t ON t.id = b.tree_id
       WHERE b.id = ?`
    )
    .get(req.params.id);
  if (!bubble || bubble.owner_id !== req.user.id) {
    return res.status(404).json({ error: 'Bubble not found' });
  }

  const { name, birth_year, location, notes, position_x, position_y } = req.body;
  if (name !== undefined && !name.trim()) {
    return res.status(400).json({ error: 'name cannot be empty' });
  }

  db.prepare(
    `UPDATE tree_bubbles SET
       name = COALESCE(?, name),
       birth_year = COALESCE(?, birth_year),
       location = COALESCE(?, location),
       notes = COALESCE(?, notes),
       position_x = COALESCE(?, position_x),
       position_y = COALESCE(?, position_y),
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(
    name !== undefined ? name.trim() : null,
    birth_year ?? null,
    location ?? null,
    notes ?? null,
    position_x ?? null,
    position_y ?? null,
    bubble.id
  );

  const updated = db.prepare('SELECT * FROM tree_bubbles WHERE id = ?').get(bubble.id);
  res.json(updated);
});

router.delete('/family-tree/bubbles/:id', requireAuth, (req, res) => {
  const bubble = db
    .prepare(
      `SELECT b.*, t.user_id AS owner_id
       FROM tree_bubbles b
       JOIN family_trees t ON t.id = b.tree_id
       WHERE b.id = ?`
    )
    .get(req.params.id);
  if (!bubble || bubble.owner_id !== req.user.id) {
    return res.status(404).json({ error: 'Bubble not found' });
  }

  db.prepare('DELETE FROM tree_bubbles WHERE id = ?').run(bubble.id);
  res.status(204).end();
});

router.post('/family-tree/mine/connections', requireAuth, (req, res) => {
  const { from_bubble_id, to_bubble_id, label, from_handle, to_handle } = req.body;
  if (!label || !label.trim()) {
    return res.status(400).json({ error: 'label is required' });
  }
  if (!from_bubble_id || !to_bubble_id) {
    return res.status(400).json({ error: 'from_bubble_id and to_bubble_id are required' });
  }
  if (from_bubble_id === to_bubble_id) {
    return res.status(400).json({ error: 'a bubble cannot connect to itself' });
  }
  if (from_handle !== undefined && from_handle !== null && !HANDLES.includes(from_handle)) {
    return res.status(400).json({ error: `from_handle must be one of: ${HANDLES.join(', ')}` });
  }
  if (to_handle !== undefined && to_handle !== null && !HANDLES.includes(to_handle)) {
    return res.status(400).json({ error: `to_handle must be one of: ${HANDLES.join(', ')}` });
  }

  const tree = getOrCreateTree(req.user.id);
  const { n } = db
    .prepare('SELECT COUNT(*) AS n FROM tree_bubbles WHERE id IN (?, ?) AND tree_id = ?')
    .get(from_bubble_id, to_bubble_id, tree.id);
  if (n !== 2) {
    return res.status(404).json({ error: 'Bubble not found' });
  }

  const result = db
    .prepare(
      `INSERT INTO tree_connections (tree_id, from_bubble_id, to_bubble_id, label, from_handle, to_handle)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(tree.id, from_bubble_id, to_bubble_id, label.trim(), from_handle ?? null, to_handle ?? null);

  const connection = db.prepare('SELECT * FROM tree_connections WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(connection);
});

router.delete('/family-tree/connections/:id', requireAuth, (req, res) => {
  const connection = db
    .prepare(
      `SELECT c.*, t.user_id AS owner_id
       FROM tree_connections c
       JOIN family_trees t ON t.id = c.tree_id
       WHERE c.id = ?`
    )
    .get(req.params.id);
  if (!connection || connection.owner_id !== req.user.id) {
    return res.status(404).json({ error: 'Connection not found' });
  }

  db.prepare('DELETE FROM tree_connections WHERE id = ?').run(connection.id);
  res.status(204).end();
});

router.get('/family-tree/:id', optionalAuth, (req, res) => {
  const tree = db
    .prepare(
      `SELECT t.*, u.display_name AS owner_display_name
       FROM family_trees t
       JOIN users u ON u.id = t.user_id
       WHERE t.id = ?`
    )
    .get(req.params.id);
  if (!tree) return res.status(404).json({ error: 'Family tree not found' });

  const isOwner = req.user && req.user.id === tree.user_id;
  if (tree.visibility !== 'public' && !isOwner) {
    return res.status(404).json({ error: 'Family tree not found' });
  }

  res.json(attachTreeContents(tree));
});

module.exports = router;
