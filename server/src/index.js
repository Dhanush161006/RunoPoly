import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { PORT, MONGODB_URI, CLIENT_ORIGIN } from './config.js';
import { seedIfEmpty } from './seed.js';
import authRoutes from './routes/auth.js';
import territoryRoutes from './routes/territories.js';
import historyRoutes from './routes/history.js';
import userRoutes from './routes/users.js';

const app = express();

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));

const apiLimiter = rateLimit({
  windowMs: 60_000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', mongo: mongoose.connection.readyState });
});

app.use('/api/auth', authRoutes);
app.use('/api/territories', territoryRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/users', userRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

async function getMongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    return mongod.getUri();
  } catch {
    return MONGODB_URI;
  }
}

async function start() {
  const uri = await getMongoUri();
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
    await seedIfEmpty();
    app.listen(PORT, () => console.log(`Express API on http://localhost:${PORT}`));
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

start();
