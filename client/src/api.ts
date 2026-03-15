const BASE = '/api';

export interface LockEvent {
  timestamp: string;
  state: 'locked' | 'unlocked';
  note: string;
}

export interface LockStatus {
  state: 'locked' | 'unlocked';
  history: LockEvent[];
}

export async function fetchUsers(): Promise<string[]> {
  const res = await fetch(`${BASE}/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  const data = await res.json();
  return data.users as string[];
}

export async function createUser(username: string): Promise<void> {
  const res = await fetch(`${BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to create user');
  }
}

export async function fetchLockStatus(username: string): Promise<LockStatus> {
  const res = await fetch(`${BASE}/lock/${encodeURIComponent(username)}`);
  if (!res.ok) throw new Error('Failed to fetch lock status');
  return res.json();
}

export async function toggleLock(username: string): Promise<'locked' | 'unlocked'> {
  const res = await fetch(`${BASE}/lock/${encodeURIComponent(username)}/toggle`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to toggle lock');
  const data = await res.json();
  return data.state;
}
