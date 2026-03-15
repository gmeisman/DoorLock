import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import {
  getUsers,
  createUser,
  userExists,
  getLockLog,
  getCurrentState,
  toggleLock,
} from './storage';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// GET /api/users — list all users
app.get('/api/users', (_req: Request, res: Response) => {
  try {
    const users = getUsers();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to read users' });
  }
});

// POST /api/users — create a new user
app.post('/api/users', (req: Request, res: Response) => {
  const { username } = req.body as { username?: string };
  if (!username || !/^[a-zA-Z0-9_-]{1,32}$/.test(username)) {
    res.status(400).json({ error: 'Invalid username (1-32 alphanumeric, _ or - chars)' });
    return;
  }
  try {
    createUser(username);
    res.status(201).json({ username });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create user';
    res.status(409).json({ error: msg });
  }
});

// GET /api/lock/:username — get current state + last 10 events
app.get('/api/lock/:username', (req: Request, res: Response) => {
  const username = req.params['username'] as string;
  if (!userExists(username)) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const state = getCurrentState(username);
  const log = getLockLog(username);
  const history = log.slice(-10).reverse();
  res.json({ state, history });
});

// POST /api/lock/:username/toggle — toggle lock state
app.post('/api/lock/:username/toggle', (req: Request, res: Response) => {
  const username = req.params['username'] as string;
  if (!userExists(username)) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const newState = toggleLock(username);
  res.json({ state: newState });
});

// Serve the Vite-built frontend
app.use(express.static(path.join(__dirname, '..', '..', 'client', 'dist')));

// Catch-all: send index.html for any non-API route (for client-side routing)
app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`DoorLock server running on http://localhost:${PORT}`);
});
