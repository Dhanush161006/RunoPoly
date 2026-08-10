import { useState, useCallback, useEffect } from 'react';
import { AuthScreen } from '@/components/AuthScreen';
import { MainApp } from '@/components/MainApp';
import { api } from '@/api';
import type { User } from '@/types';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (!token) {
      setBooting(false);
      return;
    }
    api
      .getMe()
      .then((user) => setCurrentUser(user))
      .catch(() => api.logout())
      .finally(() => setBooting(false));
  }, []);

  const handleLogin = useCallback(async (username: string, password: string) => {
    const { user } = await api.login(username, password);
    setCurrentUser(user);
  }, []);

  const handleRegister = useCallback(
    async (username: string, email: string, password: string) => {
      const { user } = await api.register(username, email, password);
      setCurrentUser(user);
    },
    []
  );

  const handleLogout = useCallback(() => {
    api.logout();
    setCurrentUser(null);
  }, []);

  if (booting) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <p className="auth-tagline">Loading…</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthScreen onLogin={handleLogin} onRegister={handleRegister} />
    );
  }

  return <MainApp user={currentUser} onLogout={handleLogout} onUserUpdate={setCurrentUser} />;
}

export default App;
