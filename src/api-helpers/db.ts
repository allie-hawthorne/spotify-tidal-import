const DB_NAME = 'spotifree-cache';
const DB_VERSION = 1;
const STORE_NAME = 'kv';

const openDb = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onupgradeneeded = () => {
    if (!req.result.objectStoreNames.contains(STORE_NAME)) {
      req.result.createObjectStore(STORE_NAME);
    }
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

// Best-effort cache: read/write failures (private browsing quotas, unsupported browsers, etc.)
// are swallowed so callers can always fall back to fetching fresh instead of crashing.
export const getCached = async <T>(key: string): Promise<T | undefined> => {
  try {
    const db = await openDb();
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn(`Failed to read cache key "${key}"`, e);
    return undefined;
  }
};

export const setCached = async <T>(key: string, value: T): Promise<void> => {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn(`Failed to write cache key "${key}"`, e);
  }
};
