import { Router } from 'express';
import { User } from '../models/User.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/leaderboard', async (_req, res, next) => {
  try {
    const users = await User.find().sort({ totalKm: -1 }).select('-passwordHash');
    res.json({ users });
  } catch (err) { next(err); }
});

router.post('/stats', authRequired, async (req, res, next) => {
  try {
    const { distKm } = req.body;
    if (typeof distKm !== 'number' || distKm < 0) return res.status(400).json({ error: 'distKm required' });
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.runs += 1;
    user.totalKm = +(user.totalKm + distKm).toFixed(2);
    await user.save();
    res.json({ user: user.toJSON() });
  } catch (err) { next(err); }
});

export default router;
