import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import auth from './routes/auth.js';
import menu from './routes/menu.js';
import cart from './routes/cart.js';
import orders from './routes/orders.js';
import admin from './routes/admin.js';
import vendors from './routes/vendors.js';
import reviews from './routes/reviews.js';
import queue from './routes/queue.js';
import { errorHandler, notFound } from './middleware/error.js';

dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set to at least 32 characters');
}

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((origin) => origin.trim());

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS origin not allowed'));
  },
  credentials: true,
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.use('/api/auth', auth);
app.use('/api/menu', menu);
app.use('/api/cart', cart);
app.use('/api/orders', orders);
app.use('/api/admin', admin);
app.use('/api/vendors', vendors);
app.use('/api/reviews', reviews);
app.use('/api/queue', queue);
app.use(notFound);
app.use(errorHandler);

const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`Campus Food API listening on port ${port}`));
