// ============================================
// LifeOS — localStorage Service Layer
// ============================================

const STORAGE_PREFIX = 'lifeos_';

function getKey(collection: string): string {
  return `${STORAGE_PREFIX}${collection}`;
}

export function getAll<T>(collection: string): T[] {
  try {
    const data = localStorage.getItem(getKey(collection));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getById<T extends { id: string }>(collection: string, id: string): T | undefined {
  const items = getAll<T>(collection);
  return items.find(item => item.id === id);
}

export function create<T extends { id: string }>(collection: string, item: T): T {
  const items = getAll<T>(collection);
  items.push(item);
  localStorage.setItem(getKey(collection), JSON.stringify(items));
  return item;
}

export function update<T extends { id: string }>(collection: string, id: string, updates: Partial<T>): T | undefined {
  const items = getAll<T>(collection);
  const index = items.findIndex(item => item.id === id);
  if (index === -1) return undefined;
  items[index] = { ...items[index], ...updates };
  localStorage.setItem(getKey(collection), JSON.stringify(items));
  return items[index];
}

export function remove<T extends { id: string }>(collection: string, id: string): boolean {
  const items = getAll<T>(collection);
  const filtered = items.filter(item => item.id !== id);
  if (filtered.length === items.length) return false;
  localStorage.setItem(getKey(collection), JSON.stringify(filtered));
  return true;
}

export function setAll<T>(collection: string, items: T[]): void {
  localStorage.setItem(getKey(collection), JSON.stringify(items));
}

export function query<T>(collection: string, predicate: (item: T) => boolean): T[] {
  return getAll<T>(collection).filter(predicate);
}

export function exportAllData(): string {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      const collectionName = key.replace(STORAGE_PREFIX, '');
      try {
        data[collectionName] = JSON.parse(localStorage.getItem(key) || '[]');
      } catch {
        data[collectionName] = localStorage.getItem(key);
      }
    }
  }
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as Record<string, unknown>;
    Object.entries(data).forEach(([collection, items]) => {
      localStorage.setItem(getKey(collection), JSON.stringify(items));
    });
    return true;
  } catch {
    return false;
  }
}

export function clearAllData(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_PREFIX)) {
      keys.push(key);
    }
  }
  keys.forEach(key => localStorage.removeItem(key));
}

export function getValue<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(getKey(key));
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setValue<T>(key: string, value: T): void {
  localStorage.setItem(getKey(key), JSON.stringify(value));
}
