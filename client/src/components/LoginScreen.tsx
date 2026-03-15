import { useState, useEffect } from 'react';
import { fetchUsers, createUser } from '../api';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [users, setUsers] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers().then(setUsers).catch(() => setError('Cannot reach server'));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createUser(newName.trim());
      onLogin(newName.trim());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.wrap}>
      <h1 style={styles.title}>DoorLock</h1>

      {users.length > 0 && (
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Select user</h2>
          <div style={styles.userList}>
            {users.map(u => (
              <button key={u} style={styles.userBtn} onClick={() => onLogin(u)}>
                {u}
              </button>
            ))}
          </div>
        </section>
      )}

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>New user</h2>
        <form onSubmit={handleCreate} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Username"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            pattern="[a-zA-Z0-9_\-]{1,32}"
            title="1-32 chars: letters, numbers, _ or -"
            required
          />
          <button style={styles.createBtn} type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create & Login'}
          </button>
        </form>
        {error && <p style={styles.error}>{error}</p>}
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', gap: 24,
    padding: '24px 16px',
  },
  title: {
    fontSize: 'clamp(2rem, 10vw, 3rem)', fontWeight: 700, letterSpacing: -1,
    background: 'linear-gradient(135deg, #22c55e, #3b82f6)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  section: {
    background: '#1a1d27', borderRadius: 16, padding: '20px 20px',
    width: '100%', maxWidth: 400, border: '1px solid #2d3148',
  },
  sectionTitle: {
    fontSize: 13, fontWeight: 600, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14,
  },
  userList: { display: 'flex', flexDirection: 'column', gap: 10 },
  userBtn: {
    background: '#252836', color: '#e2e8f0', border: '1px solid #3d4268',
    borderRadius: 8, padding: '12px 20px', cursor: 'pointer', fontSize: 15, fontWeight: 500,
    transition: 'background 0.15s', width: '100%', minHeight: 48, textAlign: 'left',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  input: {
    width: '100%', background: '#252836', color: '#e2e8f0', border: '1px solid #3d4268',
    borderRadius: 8, padding: '12px 14px', fontSize: 16, outline: 'none',
  },
  createBtn: {
    background: '#3b82f6', color: '#fff', border: 'none',
    borderRadius: 8, padding: '12px 18px', cursor: 'pointer', fontSize: 15, fontWeight: 600,
    width: '100%', minHeight: 48,
  },
  error: { color: '#ef4444', marginTop: 12, fontSize: 14 },
};
