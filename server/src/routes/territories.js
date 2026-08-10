import { Router } from 'express';
import { Territory } from '../models/Territory.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const territories = await Territory.find().sort({ claimedAt: -1 });
    res.json({ territories });
  } catch (err) { next(err); }
});

router.post('/', authRequired, async (req, res, next) => {
  try {
    const { coords, area, totalKm, elapsed, existingId } = req.body;
    if (!coords || coords.length < 4) return res.status(400).json({ error: 'At least 4 coords required' });

    if (existingId) {
      const updated = await Territory.findByIdAndUpdate(
        existingId,
        {
          owner: req.username,
          colorIdx: req.body.colorIdx ?? 0,
          coords,
          area,
          distance: totalKm.toFixed(2),
          duration: elapsed,
          claimedAt: Date.now(),
        },
        { new: true }
      );
      if (!updated) return res.status(404).json({ error: 'Territory not found' });
      return res.json({ territory: updated.toJSON(), reclaimed: true });
    }

    const territory = await Territory.create({
      owner: req.username,
      colorIdx: req.body.colorIdx ?? 0,
      coords,
      area,
      distance: totalKm.toFixed(2),
      duration: elapsed,
    });
    res.status(201).json({ territory: territory.toJSON(), reclaimed: false });
  } catch (err) { next(err); }
});

export default router;
