require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const storiesRouter = require('./routes/stories');
const familyTreeRouter = require('./routes/family-tree');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/', storiesRouter);
app.use('/', familyTreeRouter);

app.listen(PORT, () => {
  console.log(`Liferecord backend running on port ${PORT}`);
});
