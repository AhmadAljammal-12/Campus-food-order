import { validationResult } from 'express-validator';

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array().map(({ path, msg, value }) => ({ field: path, message: msg, value })),
    });
  }
  return next();
}

export function notFound(req, res) {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || (err.code === 'ER_DUP_ENTRY' ? 409 : 500);
  if (process.env.NODE_ENV !== 'test') console.error(err);
  res.status(status).json({
    message: status === 500 ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
