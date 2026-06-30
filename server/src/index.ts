import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import feedRouter from './routes/feed';
import storyRouter from './routes/story';
import summaryRouter from './routes/summary';

config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

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

const port = Number(process.env.PORT) || 3001;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
