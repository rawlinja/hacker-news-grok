import './env.js';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './errors.js';
import feedRouter from './routes/feed.js';
import storyRouter from './routes/story.js';
import summaryRouter from './routes/summary.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/feed', feedRouter);
app.use('/api/story', storyRouter);
app.use('/api/summary', summaryRouter);

app.use(errorHandler);

export default app;
