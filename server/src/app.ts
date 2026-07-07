import './env.js';
import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import feedRouter from './routes/feed.js';
import storyRouter from './routes/story.js';
import summaryRouter from './routes/summary.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/feed', feedRouter);
app.use('/api/story', storyRouter);
app.use('/api/summary', summaryRouter);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err instanceof Error ? err.message : 'Internal error' });
};
app.use(errorHandler);

export default app;
