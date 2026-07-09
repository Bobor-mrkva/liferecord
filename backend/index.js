require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/stories', (req, res) => {
  const stories = db.prepare('SELECT * FROM stories ORDER BY created_at DESC').all();
  res.json(stories);
});

app.post('/stories', (req, res) => {
  const { author_name, title, content } = req.body;
  if (!author_name || !title || !content) {
    return res.status(400).json({ error: 'author_name, title, and content are required' });
  }
  const result = db.prepare(
    'INSERT INTO stories (author_name, title, content) VALUES (?, ?, ?)'
  ).run(author_name, title, content);
  const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(story);
});

app.listen(PORT, () => {
  console.log(`Liferecord backend running on port ${PORT}`);
});
