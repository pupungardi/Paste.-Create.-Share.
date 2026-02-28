
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure users file exists
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({}));
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: number;
}

export function getUserByEmail(email: string): User | null {
  try {
    const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    return Object.values(data).find((user: any) => user.email === email) as User || null;
  } catch (e) {
    return null;
  }
}

export function createUser(user: User) {
  const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  data[user.id] = user;
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}
