import { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import LockScreen from './components/LockScreen';

export default function App() {
  const [user, setUser] = useState<string | null>(null);

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return <LockScreen username={user} onSwitchUser={() => setUser(null)} />;
}
