import type { User, Territory, HistoryEntry } from '@/types';

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('runopoly_token');
}

function setToken(token: string | null) {
  if (token) localStorage.setItem('runopoly_token', token);
  else localStorage.removeItem('runopoly_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data as T;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const api = {
  setToken,
  getToken,

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
    setToken(data.token);
    return data;
  },

  async login(username: string, password: string): Promise<AuthResponse> {
    const data = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
    return data;
  },

  async getMe(): Promise<User> {
    const data = await request<{ user: User }>('/auth/me');
    return data.user;
  },

  async getTerritories(): Promise<Territory[]> {
    const data = await request<{ territories: Territory[] }>('/territories');
    return data.territories;
  },

  async claimTerritory(payload: {
    coords: [number, number][];
    area: number;
    totalKm: number;
    elapsed: number;
    colorIdx: number;
    existingId?: string;
  }): Promise<{ territory: Territory; reclaimed: boolean }> {
    return request('/territories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getHistory(limit = 50): Promise<HistoryEntry[]> {
    const data = await request<{ history: HistoryEntry[] }>(`/history?limit=${limit}`);
    return data.history;
  },

  async addHistory(entry: Omit<HistoryEntry, 'date' | 'user'>): Promise<HistoryEntry> {
    const data = await request<{ entry: HistoryEntry }>('/history', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
    return data.entry;
  },

  async getLeaderboard(): Promise<User[]> {
    const data = await request<{ users: User[] }>('/users/leaderboard');
    return data.users;
  },

  async updateStats(distKm: number): Promise<User> {
    const data = await request<{ user: User }>('/users/stats', {
      method: 'POST',
      body: JSON.stringify({ distKm }),
    });
    return data.user;
  },

  logout() {
    setToken(null);
  },
};
