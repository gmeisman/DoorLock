import { useState, useEffect, useCallback } from 'react';
import { fetchLockStatus, toggleLock } from '../api';
import type { LockEvent } from '../api';
import Padlock from './Padlock';

interface LockScreenProps {
  username: string;
  onSwitchUser: () => void;
}

export default function LockScreen({ username, onSwitchUser }: LockScreenProps) {
  const [state, setState] = useState<'locked' | 'unlocked'>('locked');
  const [history, setHistory] = useState<LockEvent[]>([]);
  const [animating, setAnimating] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const status = await fetchLockStatus(username);
      setState(status.state);
      setHistory(status.history);
      setError('');
    } catch {
      setError('Cannot reach server');
    }
  }, [username]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [refresh]);

  async function handleToggle() {
    if (busy) return;
    setBusy(true);
    setAnimating(true);
    try {
      const newState = await toggleLock(username);
      setState(newState);
      await refresh();
    } catch {
      setError('Toggle failed');
    } finally {
      setTimeout(() => setAnimating(false), 450);
      setBusy(false);
    }
  }

  const isLocked = state === 'locked';

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <header style={styles.header}>
        <span style={styles.logo}>DoorLock</span>
        <div style={styles.headerRight}>
          <span style={styles.userBadge}>{username}</span>
          <button style={styles.switchBtn} onClick={onSwitchUser}>Switch user</button>
        </div>
      </header>

      {/* Lock area */}
      <main style={styles.main}>
        <button
          style={{ ...styles.lockBtn, cursor: busy ? 'wait' : 'pointer' }}
          onClick={handleToggle}
          disabled={busy}
          aria-label="Toggle lock"
        >
          <Padlock state={state} animating={animating} />
        </button>

        <p style={{ ...styles.stateLabel, color: isLocked ? '#22c55e' : '#ef4444' }}>
          {isLocked ? 'LOCKED' : 'UNLOCKED'}
        </p>
        <p style={styles.hint}>Tap to {isLocked ? 'unlock' : 'lock'}</p>

        {error && <p style={styles.error}>{error}</p>}
      </main>

      {/* History */}
      <section style={styles.historySection}>
        <h2 style={styles.historyTitle}>Recent events</h2>
        {history.length === 0 ? (
          <p style={styles.empty}>No events yet</p>
        ) : (
          <ul style={styles.timeline}>
            {history.map((ev, i) => (
              <li key={i} style={styles.timelineItem}>
                <span
                  style={{
                    ...styles.dot,
                    background: ev.state === 'locked' ? '#22c55e' : '#ef4444',
                  }}
                />
                <div style={styles.eventInfo}>
                  <span style={{ ...styles.eventState, color: ev.state === 'locked' ? '#22c55e' : '#ef4444' }}>
                    {ev.state.toUpperCase()}
                  </span>
                  <span style={styles.eventNote}>{ev.note}</span>
                </div>
                <span style={styles.eventTime}>{formatTime(ev.timestamp)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 24px', borderBottom: '1px solid #1e2135', background: '#13151f',
  },
  logo: { fontSize: 20, fontWeight: 700, color: '#e2e8f0', letterSpacing: -0.5 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  userBadge: {
    background: '#252836', color: '#94a3b8', border: '1px solid #3d4268',
    borderRadius: 20, padding: '4px 14px', fontSize: 13,
  },
  switchBtn: {
    background: 'transparent', color: '#64748b', border: '1px solid #2d3148',
    borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13,
    transition: 'color 0.15s',
  },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32,
  },
  lockBtn: {
    background: 'transparent', border: 'none', padding: 16,
    borderRadius: '50%', transition: 'transform 0.1s',
  },
  stateLabel: { fontSize: 28, fontWeight: 800, letterSpacing: 4 },
  hint: { fontSize: 14, color: '#475569' },
  error: { color: '#ef4444', fontSize: 14 },
  historySection: {
    background: '#13151f', borderTop: '1px solid #1e2135',
    padding: '24px 24px 32px',
  },
  historyTitle: {
    fontSize: 13, fontWeight: 600, color: '#475569',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16,
  },
  empty: { color: '#475569', fontSize: 14 },
  timeline: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 },
  timelineItem: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: '#1a1d27', borderRadius: 10, padding: '12px 16px',
    border: '1px solid #1e2135',
  },
  dot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  eventInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  eventState: { fontSize: 13, fontWeight: 700, letterSpacing: 1 },
  eventNote: { fontSize: 13, color: '#64748b' },
  eventTime: { fontSize: 12, color: '#475569', whiteSpace: 'nowrap' },
};
