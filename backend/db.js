const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'liferecord.db'));
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('freeform','questions')),
    visibility TEXT NOT NULL CHECK (visibility IN ('public','private')) DEFAULT 'private',
    title TEXT NOT NULL,
    content TEXT,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY,
    prompt TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS story_answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    story_id INTEGER NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id),
    answer TEXT NOT NULL,
    UNIQUE(story_id, question_id)
  );
`);

const addColumnIfMissing = (table, column, definition) => {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  if (!columns.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
};

addColumnIfMissing('stories', 'view_count', 'INTEGER NOT NULL DEFAULT 0');
addColumnIfMissing('users', 'name_changed_at', 'TEXT');
addColumnIfMissing('users', 'password_changed_at', 'TEXT');
addColumnIfMissing('users', 'reset_token_hash', 'TEXT');
addColumnIfMissing('users', 'reset_token_expires_at', 'TEXT');
addColumnIfMissing('users', 'reset_requested_at', 'TEXT');

const seedQuestions = db.prepare(
  'INSERT OR IGNORE INTO questions (id, prompt, sort_order) VALUES (?, ?, ?)'
);
const fixedQuestions = [
  "What's a decision you regret, and what did you learn from it?",
  "What's the hardest period of your life, and how did you get through it?",
  "What advice would you give to someone starting out in life?",
  "What's something you believed strongly when you were young that turned out to be wrong?",
  "Who influenced you the most, and how?",
  "What's an achievement you're proud of that others might not know about?",
  "What would you do differently if you could live your life again?",
  "What's a piece of wisdom you want the people who read this to remember?",
];
const seedAll = db.transaction((rows) => {
  rows.forEach((prompt, i) => seedQuestions.run(i + 1, prompt, i + 1));
});
seedAll(fixedQuestions);

module.exports = db;
