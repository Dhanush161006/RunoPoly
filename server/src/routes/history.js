import { Router } from 'express';
import { History } from '../models/History.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const entries = await History.find().sort({ date: -1 }).limit(limit);
    res.json({ history: entries });
  } catch (err) { next(err); }
});

router.post('/', authRequired, async (req, res, next) => {
  try {
    const { type, dist, duration, area } = req.body;
    if (!type) return res.status(400).json({ error: 'Type required' });
    const entry = await History.create({
      type,
      user: req.username,
      dist: dist || '',
      duration: duration || 0,
      area: area || '',
    });
    res.status(201).json({ entry: entry.toJSON() });
  } catch (err) { next(err); }
});

export default router;
