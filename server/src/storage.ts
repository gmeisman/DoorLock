import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.txt');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function logFile(username: string): string {
  return path.join(DATA_DIR, `${username}.txt`);
}

export function getUsers(): string[] {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) return [];
  const content = fs.readFileSync(USERS_FILE, 'utf-8').trim();
  return content ? content.split('\n').map(u => u.trim()).filter(Boolean) : [];
}

export function userExists(username: string): boolean {
  return getUsers().includes(username);
}

export function createUser(username: string): void {
  ensureDataDir();
  const users = getUsers();
  if (users.includes(username)) throw new Error('User already exists');
  fs.appendFileSync(USERS_FILE, username + '\n', 'utf-8');
  // Initialize log with locked state
  const ts = new Date().toISOString();
  fs.writeFileSync(logFile(username), `${ts}|locked|Account created\n`, 'utf-8');
}

export interface LockEvent {
  timestamp: string;
  state: 'locked' | 'unlocked';
  note: string;
}

export function getLockLog(username: string): LockEvent[] {
  const file = logFile(username);
  if (!fs.existsSync(file)) return [];
  const content = fs.readFileSync(file, 'utf-8').trim();
  if (!content) return [];
  return content
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const [timestamp, state, ...noteParts] = line.split('|');
      return {
        timestamp,
        state: state as 'locked' | 'unlocked',
        note: noteParts.join('|'),
      };
    });
}

export function getCurrentState(username: string): 'locked' | 'unlocked' {
  const log = getLockLog(username);
  if (log.length === 0) return 'locked';
  return log[log.length - 1].state;
}

export function toggleLock(username: string): 'locked' | 'unlocked' {
  const current = getCurrentState(username);
  const next = current === 'locked' ? 'unlocked' : 'locked';
  const ts = new Date().toISOString();
  const note = next === 'unlocked' ? 'Door unlocked' : 'Door locked';
  fs.appendFileSync(logFile(username), `${ts}|${next}|${note}\n`, 'utf-8');
  return next;
}
