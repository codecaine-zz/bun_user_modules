import { readFileText, writeFileText, exists, createDirectory } from './filesystem';
import { join } from 'path';
import { homedir } from 'os';

// Default storage directory
const getStorageDir = () => {
  const homeDir = homedir();
  return join(homeDir, '.bun-user-modules', 'storage');
};

// Storage file path
const getStorageFile = (key?: string) => {
  const dir = getStorageDir();
  return key ? join(dir, `${key}.json`) : join(dir, 'data.json');
};

// In-memory cache for better performance
const cache = new Map<string, any>();

/**
 * Sets a data item in storage
 */
export async function setData(key: string, value: any): Promise<void> {
  try {
    // Ensure storage directory exists
    const storageDir = getStorageDir();
    if (!(await exists(storageDir))) {
      await createDirectory(storageDir);
    }
    
    // Store in cache
    cache.set(key, value);
    
    // Write to file
    const filePath = getStorageFile(key);
    const data = JSON.stringify(value, null, 2);
    await writeFileText(filePath, data);
  } catch (error) {
    throw new Error(`Failed to set storage data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets a data item from storage
 */
export async function getData<T = any>(key: string): Promise<T | null> {
  try {
    // Check cache first
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    // Read from file
    const filePath = getStorageFile(key);
    if (!(await exists(filePath))) {
      return null;
    }
    
    const content = await readFileText(filePath);
    const value = JSON.parse(content);
    
    // Update cache
    cache.set(key, value);
    
    return value;
  } catch (error) {
    return null;
  }
}

/**
 * Removes a data item from storage
 */
export async function removeData(key: string): Promise<void> {
  try {
    // Remove from cache
    cache.delete(key);
    
    // Remove file
    const filePath = getStorageFile(key);
    if (await exists(filePath)) {
      const { remove } = await import('./filesystem');
      await remove(filePath);
    }
  } catch (error) {
    throw new Error(`Failed to remove storage data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets all storage keys
 */
export async function getKeys(): Promise<string[]> {
  try {
    const storageDir = getStorageDir();
    if (!(await exists(storageDir))) {
      return [];
    }
    
    const { readDirectory } = await import('./filesystem');
    const entries = await readDirectory(storageDir);
    
    return entries
      .filter(entry => entry.type === 'FILE' && entry.name.endsWith('.json'))
      .map(entry => entry.name.replace('.json', ''));
  } catch (error) {
    return [];
  }
}

/**
 * Checks if a key exists in storage
 */
export async function hasData(key: string): Promise<boolean> {
  try {
    // Check cache first
    if (cache.has(key)) {
      return true;
    }
    
    // Check file
    const filePath = getStorageFile(key);
    return await exists(filePath);
  } catch {
    return false;
  }
}

/**
 * Clears all storage data
 */
export async function clear(): Promise<void> {
  try {
    // Clear cache
    cache.clear();
    
    // Remove storage directory
    const storageDir = getStorageDir();
    if (await exists(storageDir)) {
      const { remove } = await import('./filesystem');
      await remove(storageDir);
    }
  } catch (error) {
    throw new Error(`Failed to clear storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets storage statistics
 */
export async function getStats(): Promise<{
  totalKeys: number;
  totalSize: number;
  cacheSize: number;
}> {
  try {
    const keys = await getKeys();
    let totalSize = 0;
    
    for (const key of keys) {
      try {
        const filePath = getStorageFile(key);
        const { getFileSize } = await import('./filesystem');
        const size = await getFileSize(filePath);
        totalSize += size;
      } catch {
        // Ignore errors for individual files
      }
    }
    
    return {
      totalKeys: keys.length,
      totalSize,
      cacheSize: cache.size
    };
  } catch {
    return {
      totalKeys: 0,
      totalSize: 0,
      cacheSize: cache.size
    };
  }
}

/**
 * Exports all storage data to a single object
 */
export async function exportData(): Promise<Record<string, any>> {
  try {
    const keys = await getKeys();
    const data: Record<string, any> = {};
    
    for (const key of keys) {
      try {
        const value = await getData(key);
        if (value !== null) {
          data[key] = value;
        }
      } catch {
        // Ignore errors for individual keys
      }
    }
    
    return data;
  } catch {
    return {};
  }
}

/**
 * Imports data from an object, overwriting existing data
 */
export async function importData(data: Record<string, any>): Promise<void> {
  try {
    for (const [key, value] of Object.entries(data)) {
      await setData(key, value);
    }
  } catch (error) {
    throw new Error(`Failed to import storage data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a scoped storage namespace
 */
export function createNamespace(namespace: string) {
  const prefixKey = (key: string) => `${namespace}:${key}`;
  
  return {
    async setData(key: string, value: any): Promise<void> {
      return setData(prefixKey(key), value);
    },
    
    async getData<T = any>(key: string): Promise<T | null> {
      return getData<T>(prefixKey(key));
    },
    
    async removeData(key: string): Promise<void> {
      return removeData(prefixKey(key));
    },
    
    async hasData(key: string): Promise<boolean> {
      return hasData(prefixKey(key));
    },
    
    async getKeys(): Promise<string[]> {
      const allKeys = await getKeys();
      const prefix = `${namespace}:`;
      return allKeys
        .filter(key => key.startsWith(prefix))
        .map(key => key.substring(prefix.length));
    },
    
    async clear(): Promise<void> {
      const keys = await this.getKeys();
      for (const key of keys) {
        await this.removeData(key);
      }
    },
    
    async exportData(): Promise<Record<string, any>> {
      const keys = await this.getKeys();
      const data: Record<string, any> = {};
      
      for (const key of keys) {
        try {
          const value = await this.getData(key);
          if (value !== null) {
            data[key] = value;
          }
        } catch {
          // Ignore errors for individual keys
        }
      }
      
      return data;
    },
    
    async importData(data: Record<string, any>): Promise<void> {
      for (const [key, value] of Object.entries(data)) {
        await this.setData(key, value);
      }
    }
  };
}

/**
 * Session storage (in-memory only)
 */
export const sessionStorage = {
  _data: new Map<string, any>(),
  
  setData(key: string, value: any): void {
    this._data.set(key, value);
  },
  
  getData<T = any>(key: string): T | null {
    return this._data.get(key) || null;
  },
  
  removeData(key: string): void {
    this._data.delete(key);
  },
  
  hasData(key: string): boolean {
    return this._data.has(key);
  },
  
  getKeys(): string[] {
    return Array.from(this._data.keys());
  },
  
  clear(): void {
    this._data.clear();
  },
  
  getStats() {
    return {
      totalKeys: this._data.size,
      totalSize: JSON.stringify(Object.fromEntries(this._data)).length
    };
  }
};

/**
 * Advanced storage utilities
 */

/**
 * Storage manager with encryption and compression
 */
export class SecureStorage {
  private encryptionKey: string;
  
  constructor(encryptionKey?: string) {
    this.encryptionKey = encryptionKey || this.generateKey();
  }
  
  private generateKey(): string {
    return Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
  }
  
  private encrypt(data: string): string {
    // Simple XOR encryption (for demonstration - use proper encryption in production)
    let encrypted = '';
    for (let i = 0; i < data.length; i++) {
      const keyChar = this.encryptionKey[i % this.encryptionKey.length]!;
      encrypted += String.fromCharCode(data.charCodeAt(i) ^ keyChar.charCodeAt(0));
    }
    return btoa(encrypted);
  }
  
  private decrypt(encryptedData: string): string {
    const encrypted = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const keyChar = this.encryptionKey[i % this.encryptionKey.length]!;
      decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ keyChar.charCodeAt(0));
    }
    return decrypted;
  }
  
  private compress(data: string): string {
    // Simple compression using repeated character reduction
    return data.replace(/(.)\1+/g, (match, char) => `${char}${match.length}`);
  }
  
  private decompress(compressedData: string): string {
    return compressedData.replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.slice(1));
      return char.repeat(count);
    });
  }
  
  async setSecure(key: string, value: any, options: { compress?: boolean } = {}): Promise<void> {
    let data = JSON.stringify(value);
    
    if (options.compress) {
      data = this.compress(data);
    }
    
    const encryptedData = this.encrypt(data);
    await setData(`secure_${key}`, {
      data: encryptedData,
      compressed: options.compress || false,
      timestamp: Date.now()
    });
  }
  
  async getSecure<T = any>(key: string): Promise<T | null> {
    const stored = await getData<{
      data: string;
      compressed: boolean;
      timestamp: number;
    }>(`secure_${key}`);
    
    if (!stored) return null;
    
    try {
      let decryptedData = this.decrypt(stored.data);
      
      if (stored.compressed) {
        decryptedData = this.decompress(decryptedData);
      }
      
      return JSON.parse(decryptedData);
    } catch {
      return null;
    }
  }
  
  async removeSecure(key: string): Promise<void> {
    await removeData(`secure_${key}`);
  }
}

/**
 * Creates a secure storage instance
 */
export function createSecureStorage(encryptionKey?: string): SecureStorage {
  return new SecureStorage(encryptionKey);
}

/**
 * Storage with TTL (Time To Live) support
 */
export class TTLStorage {
  async set(key: string, value: any, ttlMs: number): Promise<void> {
    const expiresAt = Date.now() + ttlMs;
    await setData(key, {
      value,
      expiresAt
    });
  }
  
  async get<T = any>(key: string): Promise<T | null> {
    const stored = await getData<{ value: T; expiresAt: number }>(key);
    
    if (!stored) return null;
    
    if (Date.now() > stored.expiresAt) {
      await this.remove(key);
      return null;
    }
    
    return stored.value;
  }
  
  async remove(key: string): Promise<void> {
    await removeData(key);
  }
  
  async cleanup(): Promise<number> {
    const allKeys = await getKeys();
    let cleanedCount = 0;
    
    for (const key of allKeys) {
      const stored = await getData<{ expiresAt?: number }>(key);
      if (stored?.expiresAt && Date.now() > stored.expiresAt) {
        await this.remove(key);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }
  
  async extend(key: string, additionalMs: number): Promise<boolean> {
    const stored = await getData<{ value: any; expiresAt: number }>(key);
    
    if (!stored || Date.now() > stored.expiresAt) {
      return false;
    }
    
    await setData(key, {
      value: stored.value,
      expiresAt: stored.expiresAt + additionalMs
    });
    
    return true;
  }
  
  async getTimeToLive(key: string): Promise<number | null> {
    const stored = await getData<{ expiresAt: number }>(key);
    
    if (!stored) return null;
    
    const remaining = stored.expiresAt - Date.now();
    return remaining > 0 ? remaining : null;
  }
}

/**
 * Creates a TTL storage instance
 */
export function createTTLStorage(): TTLStorage {
  return new TTLStorage();
}

/**
 * Observable storage that emits events on changes
 */
export class ObservableStorage {
  private listeners = new Map<string, Array<(newValue: any, oldValue: any) => void>>();
  private globalListeners: Array<(key: string, newValue: any, oldValue: any) => void> = [];
  
  async set(key: string, value: any): Promise<void> {
    const oldValue = await getData(key);
    await setData(key, value);
    
    // Notify key-specific listeners
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => listener(value, oldValue));
    }
    
    // Notify global listeners
    this.globalListeners.forEach(listener => listener(key, value, oldValue));
  }
  
  async get<T = any>(key: string): Promise<T | null> {
    return await getData<T>(key);
  }
  
  async remove(key: string): Promise<void> {
    const oldValue = await getData(key);
    await removeData(key);
    
    // Notify listeners of removal
    const keyListeners = this.listeners.get(key);
    if (keyListeners) {
      keyListeners.forEach(listener => listener(null, oldValue));
    }
    
    this.globalListeners.forEach(listener => listener(key, null, oldValue));
  }
  
  on(key: string, listener: (newValue: any, oldValue: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    
    this.listeners.get(key)!.push(listener);
    
    // Return unsubscribe function
    return () => {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        const index = keyListeners.indexOf(listener);
        if (index !== -1) {
          keyListeners.splice(index, 1);
        }
      }
    };
  }
  
  onAny(listener: (key: string, newValue: any, oldValue: any) => void): () => void {
    this.globalListeners.push(listener);
    
    return () => {
      const index = this.globalListeners.indexOf(listener);
      if (index !== -1) {
        this.globalListeners.splice(index, 1);
      }
    };
  }
  
  off(key: string, listener?: (newValue: any, oldValue: any) => void): void {
    if (!listener) {
      this.listeners.delete(key);
    } else {
      const keyListeners = this.listeners.get(key);
      if (keyListeners) {
        const index = keyListeners.indexOf(listener);
        if (index !== -1) {
          keyListeners.splice(index, 1);
        }
      }
    }
  }
}

/**
 * Creates an observable storage instance
 */
export function createObservableStorage(): ObservableStorage {
  return new ObservableStorage();
}

/**
 * Storage with automatic backup and versioning
 */
export class VersionedStorage {
  private maxVersions: number;
  
  constructor(maxVersions: number = 5) {
    this.maxVersions = maxVersions;
  }
  
  async set(key: string, value: any, description?: string): Promise<void> {
    // Get current value for versioning
    const currentValue = await getData(key);
    
    // Store the new value
    await setData(key, value);
    
    // Create version entry
    const versionKey = `${key}_versions`;
    const versions = await getData<Array<{
      value: any;
      timestamp: number;
      description?: string;
    }>>(versionKey) || [];
    
    if (currentValue !== null) {
      versions.unshift({
        value: currentValue,
        timestamp: Date.now(),
        description
      });
      
      // Limit version history
      if (versions.length > this.maxVersions) {
        versions.splice(this.maxVersions);
      }
      
      await setData(versionKey, versions);
    }
  }
  
  async get<T = any>(key: string): Promise<T | null> {
    return await getData<T>(key);
  }
  
  async getVersion<T = any>(key: string, versionIndex: number): Promise<T | null> {
    const versionKey = `${key}_versions`;
    const versions = await getData<Array<{
      value: T;
      timestamp: number;
      description?: string;
    }>>(versionKey);
    
    if (!versions || versionIndex >= versions.length) {
      return null;
    }
    
    return versions[versionIndex]?.value || null;
  }
  
  async getVersionHistory(key: string): Promise<Array<{
    value: any;
    timestamp: number;
    description?: string;
  }>> {
    const versionKey = `${key}_versions`;
    return await getData(versionKey) || [];
  }
  
  async restoreVersion(key: string, versionIndex: number): Promise<boolean> {
    const versionValue = await this.getVersion(key, versionIndex);
    
    if (versionValue === null) {
      return false;
    }
    
    await this.set(key, versionValue, `Restored from version ${versionIndex}`);
    return true;
  }
  
  async remove(key: string): Promise<void> {
    await removeData(key);
    await removeData(`${key}_versions`);
  }
}

/**
 * Creates a versioned storage instance
 */
export function createVersionedStorage(maxVersions?: number): VersionedStorage {
  return new VersionedStorage(maxVersions);
}

/**
 * Storage migration utilities
 */
export const storageMigrations = {
  /**
   * Migrates storage data using a set of migration functions
   */
  async migrate(migrations: Array<{
    version: number;
    up: (data: Record<string, any>) => Record<string, any> | Promise<Record<string, any>>;
    down?: (data: Record<string, any>) => Record<string, any> | Promise<Record<string, any>>;
  }>): Promise<void> {
    const currentVersion = await getData<number>('__storage_version') || 0;
    
    // Sort migrations by version
    const sortedMigrations = migrations.sort((a, b) => a.version - b.version);
    
    for (const migration of sortedMigrations) {
      if (migration.version > currentVersion) {
        const allData = await exportData();
        const migratedData = await migration.up(allData);
        
        // Clear old data and set new data
        await clear();
        for (const [key, value] of Object.entries(migratedData)) {
          await setData(key, value);
        }
        
        // Update version
        await setData('__storage_version', migration.version);
      }
    }
  },
  
  /**
   * Creates a backup of all storage data
   */
  async backup(): Promise<string> {
    const allData = await exportData();
    const backupData = {
      timestamp: Date.now(),
      version: await getData<number>('__storage_version') || 0,
      data: allData
    };
    
    const backupKey = `backup_${Date.now()}`;
    await setData(backupKey, backupData);
    return backupKey;
  },
  
  /**
   * Restores storage from a backup
   */
  async restore(backupKey: string): Promise<boolean> {
    const backup = await getData<{
      timestamp: number;
      version: number;
      data: Record<string, any>;
    }>(backupKey);
    
    if (!backup) return false;
    
    // Clear current data
    await clear();
    
    // Restore backup data
    for (const [key, value] of Object.entries(backup.data)) {
      await setData(key, value);
    }
    
    return true;
  }
};
