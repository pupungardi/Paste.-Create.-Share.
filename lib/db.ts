
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'registry.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure db file exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({}));
}

export interface RegistryFile {
  filename: string;
  content: string;
  language: string;
  type: string;
}

export interface RegistryItem {
  id: string;
  files: RegistryFile[];
  createdAt: number;
  expiresAt?: number;
  password?: string; // Hashed password
  // Legacy fields for backward compatibility
  content?: string;
  filename?: string;
  language?: string;
  type?: string;
  customCss?: string;
}

export function saveItem(item: RegistryItem) {
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  
  // Clean up expired items while we're at it
  const now = Date.now();
  Object.keys(data).forEach(key => {
    if (data[key].expiresAt && data[key].expiresAt < now) {
      delete data[key];
    }
  });

  data[item.id] = item;
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

export function getItem(id: string): RegistryItem | null {
  try {
    const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    const item = data[id];
    
    if (!item) return null;

    // Check expiration
    if (item.expiresAt && item.expiresAt < Date.now()) {
      // Lazy delete
      delete data[id];
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
      return null;
    }

    return item;
  } catch (e) {
    return null;
  }
}
