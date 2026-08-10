import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Territory } from './models/Territory.js';
import { History } from './models/History.js';

const SEED_USERS = [
  { username: 'alice', email: 'alice@example.com', password: 'alice123' },
  { username: 'bob', email: 'bob@example.com', password: 'bob123' },
  { username: 'carol', email: 'carol@example.com', password: 'carol123' },
];

function offsetPoly(base, dlat, dlng, scale) {
  const pts = 8;
  const coords = [];
  for (let i = 0; i < pts; i++) {
    const angle = (i / pts) * 2 * Math.PI;
    coords.push([
      base[0] + dlat + Math.sin(angle) * scale * 0.002,
      base[1] + dlng + Math.cos(angle) * scale * 0.002,
    ]);
  }
  return coords;
}

function calcArea(coords) {
  let area = 0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = coords[i][1] * (Math.PI / 180) * 6371000 * Math.cos((coords[i][0] * Math.PI) / 180);
    const yi = coords[i][0] * (Math.PI / 180) * 6371000;
    const xj = coords[j][1] * (Math.PI / 180) * 6371000 * Math.cos((coords[j][0] * Math.PI) / 180);
    const yj = coords[j][0] * (Math.PI / 180) * 6371000;
    area += xi * yj - xj * yi;
  }
  return Math.abs(area / 2);
}

export async function seedIfEmpty() {
  const userCount = await User.countDocuments();
  if (userCount > 0) return;

  console.log('Database empty — seeding demo data…');

  for (let i = 0; i < SEED_USERS.length; i++) {
    const s = SEED_USERS[i];
    const passwordHash = await bcrypt.hash(s.password, 10);
    await User.create({
      username: s.username,
      email: s.email,
      passwordHash,
      colorIdx: i,
      totalKm: +(Math.random() * 15 + 5).toFixed(2),
      runs: Math.floor(Math.random() * 8 + 2),
    });
  }

  const base = [51.505, -0.09];
  const seedTs = [
    { owner: 'alice', colorIdx: 0, coords: offsetPoly(base, 0.002, 0.003, 0.5) },
    { owner: 'bob', colorIdx: 1, coords: offsetPoly(base, 0.005, -0.002, 0.3) },
    { owner: 'carol', colorIdx: 2, coords: offsetPoly(base, -0.003, 0.004, 0.4) },
    { owner: 'bob', colorIdx: 1, coords: offsetPoly(base, -0.005, -0.005, 0.35) },
  ];

  for (let i = 0; i < seedTs.length; i++) {
    const s = seedTs[i];
    await Territory.create({
      owner: s.owner,
      colorIdx: s.colorIdx,
      coords: s.coords,
      area: calcArea(s.coords),
      claimedAt: Date.now() - i * 3600000,
      distance: (Math.random() * 3 + 0.5).toFixed(2),
      duration: Math.floor(Math.random() * 1800 + 600),
    });
  }

  await History.create({
    type: 'claimed',
    user: 'alice',
    dist: '2.3 km',
    duration: 1200,
    area: '0.0012 km²',
    date: Date.now() - 3600000,
  });
  await History.create({
    type: 'run',
    user: 'bob',
    dist: '3.1 km',
    duration: 1800,
    date: Date.now() - 7200000,
  });

  console.log('Seed complete: 3 users, 4 territories');
}
