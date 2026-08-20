import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export type ValidationError = { field?: string; message: string };

type Issue = ZodError['issues'][number];

function toValidationError(issue: Issue): ValidationError {
  const field = issue.path.join('.');
  return field ? { field, message: issue.message } : { message: issue.message };
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ errors: err.issues.map(toValidationError) });
    return;
  }

  console.error(err);
  res.status(500).json({ error: err instanceof Error ? err.message : 'Internal error' });
};
