import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3001;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/runopoly';
export const JWT_SECRET = process.env.JWT_SECRET || 'runopoly_dev_secret';
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
export const USER_COLORS = [
  '#4F8EF7', '#FF6B6B', '#00D68F', '#FFB020',
  '#B8FF00', '#C084FC', '#22D3EE', '#F97316',
];
