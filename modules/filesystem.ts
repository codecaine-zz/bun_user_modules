// Use Bun's built-in file system APIs for optimal performance
import { file as bunFile, write as bunWrite } from 'bun';
import { readdir, readFile, writeFile, appendFile, mkdir, rm, stat, copyFile, rename, chmod, access } from 'fs/promises';
import { join, resolve, relative, dirname, basename, extname, parse } from 'path';
import { createReadStream, createWriteStream, constants, watchFile as fsWatchFile, unwatchFile, watch } from 'fs';
import type { 
  DirectoryEntry, 
  FileStats, 
  FilePermissions, 
  PathParts, 
  FileWatcher, 
  WatchEvent, 
  EventListener,
  EnhancedWatchEvent,
  WatcherConfig,
  DirectoryWatcher
} from '../types';

// File watchers storage
const watchers = new Map<number, { cleanup: () => void; path: string }>();
let watcherId = 0;

// Enhanced directory watchers storage
const directoryWatchers = new Map<number, DirectoryWatcher>();
let directoryWatcherId = 0;

// Event emitter for file system events
const eventListeners = new Map<string, EventListener[]>();

// Debounce utility for enhanced watchers
const debounceMap = new Map<string, NodeJS.Timeout>();

/**
 * Creates a directory or multiple directories recursively
 */
export async function createDirectory(path: string): Promise<void> {
  try {
    await mkdir(path, { recursive: true });
  } catch (error) {
    throw new Error(`Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Removes a directory or file recursively
 */
export async function remove(path: string): Promise<void> {
  try {
    await rm(path, { recursive: true, force: true });
  } catch (error) {
    throw new Error(`Failed to remove path: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Writes a text file using Bun's optimized file API
 */
export async function writeFileText(filename: string, data: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
  try {
    // Use Bun's optimized write for better performance
    await bunWrite(filename, data);
  } catch (error) {
    throw new Error(`Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Appends text content to file
 */
export async function appendFileText(filename: string, data: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
  try {
    await appendFile(filename, data, encoding);
  } catch (error) {
    throw new Error(`Failed to append to file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Writes a binary file using Bun's optimized file API
 */
export async function writeBinaryFile(filename: string, data: ArrayBuffer): Promise<void> {
  try {
    // Use Bun's optimized write for better performance
    await bunWrite(filename, data);
  } catch (error) {
    throw new Error(`Failed to write binary file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Appends binary data to a file using Bun's optimized file API
 */
export async function appendBinaryFile(filename: string, data: ArrayBuffer): Promise<void> {
  try {
    // For append operations, we still use Node.js API as Bun doesn't have a direct append for binary
    const buffer = Buffer.from(data);
    await appendFile(filename, buffer);
  } catch (error) {
    throw new Error(`Failed to append binary file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Reads a text file using Bun's optimized file API
 */
export async function readFileText(filename: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
  try {
    // Use Bun's optimized file API for better performance
    const file = bunFile(filename);
    return await file.text();
  } catch (error) {
    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Reads binary files using Bun's optimized file API
 */
export async function readBinaryFile(filename: string): Promise<ArrayBuffer> {
  try {
    // Use Bun's optimized file API for better performance
    const file = bunFile(filename);
    return await file.arrayBuffer();
  } catch (error) {
    throw new Error(`Failed to read binary file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Reads directory contents
 */
export async function readDirectory(path: string, options: { recursive?: boolean } = {}): Promise<DirectoryEntry[]> {
  try {
    const entries: DirectoryEntry[] = [];
    const items = await readdir(path, { withFileTypes: true });

    for (const item of items) {
      const fullPath = join(path, item.name);
      const stats = await stat(fullPath);
      
      const entry: DirectoryEntry = {
        name: item.name,
        type: item.isDirectory() ? 'DIRECTORY' : 'FILE',
        path: fullPath,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime
      };

      entries.push(entry);

      // Recursively read subdirectories if requested
      if (options.recursive && item.isDirectory()) {
        const subEntries = await readDirectory(fullPath, options);
        entries.push(...subEntries);
      }
    }

    return entries;
  } catch (error) {
    throw new Error(`Failed to read directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Copies a file or directory to a new destination
 */
export async function copy(source: string, destination: string, options: { 
  recursive?: boolean; 
  overwrite?: boolean; 
  skip?: boolean 
} = {}): Promise<void> {
  try {
    const { recursive = true, overwrite = true, skip = false } = options;
    
    // Check if destination exists
    const destExists = await exists(destination);
    if (destExists && skip) {
      return; // Skip if file exists and skip option is true
    }
    
    if (destExists && !overwrite) {
      throw new Error('Destination already exists and overwrite is disabled');
    }

    const sourceStats = await stat(source);
    
    if (sourceStats.isDirectory()) {
      if (!recursive) {
        throw new Error('Cannot copy directory without recursive option');
      }
      
      // Create destination directory
      await createDirectory(destination);
      
      // Copy all contents
      const entries = await readdir(source);
      for (const entry of entries) {
        const srcPath = join(source, entry);
        const destPath = join(destination, entry);
        await copy(srcPath, destPath, options);
      }
    } else {
      // Ensure destination directory exists
      await createDirectory(dirname(destination));
      await copyFile(source, destination);
    }
  } catch (error) {
    throw new Error(`Failed to copy: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Moves a file or directory to a new destination
 */
export async function move(source: string, destination: string): Promise<void> {
  try {
    // Ensure destination directory exists
    await createDirectory(dirname(destination));
    await rename(source, destination);
  } catch (error) {
    throw new Error(`Failed to move: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Returns file statistics for the given path
 */
export async function getStats(path: string): Promise<FileStats> {
  try {
    const stats = await stat(path);
    return {
      size: stats.size,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    };
  } catch (error) {
    throw new Error(`Failed to get stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Checks if a file or directory exists
 */
export async function exists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns the absolute path for a given path
 */
export function getAbsolutePath(path: string): string {
  return resolve(path);
}

/**
 * Returns the relative path for a given path and base
 */
export function getRelativePath(path: string, base?: string): string {
  const basePath = base || process.cwd();
  return relative(basePath, path);
}

/**
 * Parses a given path and returns its parts
 */
export function getPathParts(path: string): PathParts {
  const parsed = parse(path);
  const absolutePath = resolve(path);
  
  return {
    rootName: parsed.root,
    rootDirectory: parsed.root,
    rootPath: parsed.root,
    relativePath: relative(parsed.root, absolutePath),
    parentPath: parsed.dir,
    filename: parsed.base,
    extension: parsed.ext,
    stem: parsed.name
  };
}

/**
 * Sets file permissions (Unix-like systems)
 */
export async function setPermissions(
  path: string, 
  permissions: FilePermissions, 
  mode: 'ADD' | 'REPLACE' | 'REMOVE' = 'REPLACE'
): Promise<void> {
  try {
    let octalMode = 0;
    
    // Convert permissions object to octal mode
    if (permissions.all) {
      octalMode = 0o777;
    } else {
      if (permissions.ownerRead || permissions.ownerAll) octalMode |= 0o400;
      if (permissions.ownerWrite || permissions.ownerAll) octalMode |= 0o200;
      if (permissions.ownerExec || permissions.ownerAll) octalMode |= 0o100;
      if (permissions.groupRead || permissions.groupAll) octalMode |= 0o040;
      if (permissions.groupWrite || permissions.groupAll) octalMode |= 0o020;
      if (permissions.groupExec || permissions.groupAll) octalMode |= 0o010;
      if (permissions.othersRead || permissions.othersAll) octalMode |= 0o004;
      if (permissions.othersWrite || permissions.othersAll) octalMode |= 0o002;
      if (permissions.othersExec || permissions.othersAll) octalMode |= 0o001;
    }
    
    if (mode === 'ADD' || mode === 'REMOVE') {
      const currentStats = await stat(path);
      const currentMode = currentStats.mode & parseInt('777', 8);
      
      if (mode === 'ADD') {
        octalMode = currentMode | octalMode;
      } else { // REMOVE
        octalMode = currentMode & ~octalMode;
      }
    }
    
    await chmod(path, octalMode);
  } catch (error) {
    throw new Error(`Failed to set permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Returns file permissions for a given path
 */
export async function getPermissions(path: string): Promise<FilePermissions> {
  try {
    const stats = await stat(path);
    const mode = stats.mode;
    
    return {
      ownerRead: Boolean(mode & 0o400),
      ownerWrite: Boolean(mode & 0o200),
      ownerExec: Boolean(mode & 0o100),
      groupRead: Boolean(mode & 0o040),
      groupWrite: Boolean(mode & 0o020),
      groupExec: Boolean(mode & 0o010),
      othersRead: Boolean(mode & 0o004),
      othersWrite: Boolean(mode & 0o002),
      othersExec: Boolean(mode & 0o001)
    };
  } catch (error) {
    throw new Error(`Failed to get permissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a filesystem watcher using Node.js fs.watchFile
 */
export function createWatcher(path: string): number {
  try {
    const id = ++watcherId;
    
    // Check if watcher already exists for this path
    for (const [existingId, { path: existingPath }] of watchers) {
      if (existingPath === path) {
        return existingId;
      }
    }
    
    const listener = (curr: any, prev: any) => {
      const event: WatchEvent = {
        path,
        event: 'modify',
        filename: basename(path)
      };
      
      // Emit watch event
      const listeners = eventListeners.get('watchFile') || [];
      listeners.forEach(listener => listener({ id, detail: event }));
    };
    
    fsWatchFile(path, { interval: 1000 }, listener);
    
    const cleanup = () => {
      unwatchFile(path, listener);
    };
    
    watchers.set(id, { cleanup, path });
    return id;
  } catch (error) {
    throw new Error(`Failed to create watcher: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Removes a filesystem watcher
 */
export function removeWatcher(watcherId: number): void {
  try {
    const watcherData = watchers.get(watcherId);
    if (!watcherData) {
      throw new Error('Invalid watcher ID');
    }
    
    watcherData.cleanup();
    watchers.delete(watcherId);
  } catch (error) {
    throw new Error(`Failed to remove watcher: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Returns information about created file watchers
 */
export function getWatchers(): FileWatcher[] {
  return Array.from(watchers.entries()).map(([id, { path }]) => ({
    id,
    path,
    active: true
  }));
}

/**
 * Enhanced Directory Watcher Class
 */
class EnhancedDirectoryWatcher implements DirectoryWatcher {
  public id: number;
  public path: string;
  public config: WatcherConfig;
  public active: boolean = false;
  public eventCount: number = 0;
  public lastEvent?: Date;

  private watcher: any = null;
  private listeners = new Map<string, Set<Function>>();
  private fileStatsCache = new Map<string, FileStats>();

  constructor(id: number, path: string, config: WatcherConfig) {
    this.id = id;
    this.path = path;
    this.config = {
      recursive: true,
      debounceMs: 100,
      events: ['create', 'modify', 'delete', 'rename'],
      persistent: true,
      followSymlinks: false,
      maxDepth: Infinity,
      ...config
    };
  }

  async start(): Promise<void> {
    if (this.active) return;

    try {
      // Initialize file stats cache for existing files
      await this.initializeStatsCache();

      // Use fs.watch for better performance on directories
      this.watcher = watch(this.path, { recursive: this.config.recursive }, (eventType, filename) => {
        if (filename) {
          this.handleRawEvent(eventType, filename);
        }
      });

      this.watcher.on('error', (error: Error) => {
        this.emit('error', error);
      });

      this.active = true;
    } catch (error) {
      throw new Error(`Failed to start enhanced watcher: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stop(): Promise<void> {
    if (!this.active) return;

    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }

    // Clear debounce timers
    for (const timer of debounceMap.values()) {
      clearTimeout(timer);
    }

    this.active = false;
    this.fileStatsCache.clear();
  }

  on(event: 'change', callback: (event: EnhancedWatchEvent) => void): void;
  on(event: 'error', callback: (error: Error) => void): void;
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: 'change' | 'error', callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
  }

  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in watcher callback:', error);
        }
      });
    }
  }

  private async initializeStatsCache(): Promise<void> {
    if (!this.config.recursive) {
      return;
    }

    try {
      const entries = await readDirectory(this.path, { recursive: true });
      for (const entry of entries) {
        try {
          if (entry.type === 'FILE') {
            const stats = await getStats(entry.path);
            this.fileStatsCache.set(entry.path, stats);
          }
        } catch {
          // Skip files we can't stat
        }
      }
    } catch {
      // Skip if we can't read directory
    }
  }

  private handleRawEvent(eventType: string, filename: string): void {
    const fullPath = join(this.path, filename);
    const debounceKey = `${this.id}-${fullPath}`;

    // Clear existing debounce timer
    const existingTimer = debounceMap.get(debounceKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new debounce timer
    const timer = setTimeout(async () => {
      try {
        await this.processEvent(eventType, fullPath);
        debounceMap.delete(debounceKey);
      } catch (error) {
        this.emit('error', error instanceof Error ? error : new Error('Unknown error'));
      }
    }, this.config.debounceMs);

    debounceMap.set(debounceKey, timer);
  }

  private async processEvent(eventType: string, filePath: string): Promise<void> {
    // Check if file matches patterns
    if (!this.shouldIncludeFile(filePath)) {
      return;
    }

    // Map raw event types to our enhanced event types
    let mappedEvent: EnhancedWatchEvent['event'];
    
    switch (eventType) {
      case 'rename':
        // Check if file still exists to determine if it's create or delete
        const fileExists = await exists(filePath);
        mappedEvent = fileExists ? 'create' : 'delete';
        break;
      case 'change':
        mappedEvent = 'modify';
        break;
      default:
        mappedEvent = 'modify';
    }

    // Filter by configured events
    if (!this.config.events!.includes(mappedEvent)) {
      return;
    }

    try {
      let currentStats: FileStats | undefined;
      let isDirectory = false;

      if (mappedEvent !== 'delete') {
        try {
          currentStats = await getStats(filePath);
          isDirectory = currentStats.isDirectory;
        } catch {
          // File might have been deleted between checks
          mappedEvent = 'delete';
        }
      }

      const previousStats = this.fileStatsCache.get(filePath);
      const filename = basename(filePath);

      const enhancedEvent: EnhancedWatchEvent = {
        path: filePath,
        event: mappedEvent,
        filename,
        timestamp: new Date(),
        isDirectory,
        size: currentStats?.size,
        previousSize: previousStats?.size,
        stats: currentStats,
        previousStats
      };

      // Update cache
      if (mappedEvent === 'delete') {
        this.fileStatsCache.delete(filePath);
      } else if (currentStats) {
        this.fileStatsCache.set(filePath, currentStats);
      }

      // Update counters
      this.eventCount++;
      this.lastEvent = enhancedEvent.timestamp;

      // Emit the enhanced event
      this.emit('change', enhancedEvent);

    } catch (error) {
      this.emit('error', error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  private shouldIncludeFile(filePath: string): boolean {
    const relativePath = relative(this.path, filePath);
    const filename = basename(filePath);

    // Check ignore patterns
    if (this.config.ignorePatterns) {
      for (const pattern of this.config.ignorePatterns) {
        if (typeof pattern === 'string') {
          if (relativePath.includes(pattern) || filename.includes(pattern)) {
            return false;
          }
        } else if (pattern instanceof RegExp) {
          if (pattern.test(relativePath) || pattern.test(filename)) {
            return false;
          }
        }
      }
    }

    // Check include patterns (if specified, file must match at least one)
    if (this.config.includePatterns && this.config.includePatterns.length > 0) {
      let matches = false;
      for (const pattern of this.config.includePatterns) {
        if (typeof pattern === 'string') {
          if (relativePath.includes(pattern) || filename.includes(pattern)) {
            matches = true;
            break;
          }
        } else if (pattern instanceof RegExp) {
          if (pattern.test(relativePath) || pattern.test(filename)) {
            matches = true;
            break;
          }
        }
      }
      if (!matches) {
        return false;
      }
    }

    // Check max depth
    if (this.config.maxDepth !== undefined) {
      const depth = relativePath.split('/').length - 1;
      if (depth > this.config.maxDepth) {
        return false;
      }
    }

    return true;
  }
}

/**
 * Creates an enhanced directory watcher with advanced filtering and event handling
 */
export function createDirectoryWatcher(path: string, config: WatcherConfig = {}): DirectoryWatcher {
  const id = ++directoryWatcherId;
  const watcher = new EnhancedDirectoryWatcher(id, path, config);
  directoryWatchers.set(id, watcher);
  return watcher;
}

/**
 * Removes an enhanced directory watcher
 */
export async function removeDirectoryWatcher(watcherId: number): Promise<void> {
  const watcher = directoryWatchers.get(watcherId);
  if (!watcher) {
    throw new Error('Invalid directory watcher ID');
  }

  await watcher.stop();
  directoryWatchers.delete(watcherId);
}

/**
 * Gets all active directory watchers
 */
export function getDirectoryWatchers(): DirectoryWatcher[] {
  return Array.from(directoryWatchers.values());
}

/**
 * Stops all directory watchers
 */
export async function stopAllDirectoryWatchers(): Promise<void> {
  const stopPromises = Array.from(directoryWatchers.values()).map(watcher => watcher.stop());
  await Promise.all(stopPromises);
  directoryWatchers.clear();
}

/**
 * Creates a readable stream for a file
 */
export function createReadableStream(filename: string, options?: { start?: number; end?: number }) {
  return createReadStream(filename, options);
}

/**
 * Creates a writable stream for a file
 */
export function createWritableStream(filename: string, options?: { flags?: string }) {
  return createWriteStream(filename, options);
}

/**
 * Watches a single file for changes
 */
export function watchFile(filename: string, callback: (event: WatchEvent) => void): () => void {
  const listener = (curr: any, prev: any) => {
    callback({
      path: filename,
      event: 'modify',
      filename: basename(filename)
    });
  };
  
  fsWatchFile(filename, { interval: 1000 }, listener);
  
  return () => {
    unwatchFile(filename, listener);
  };
}

/**
 * Gets the size of a file in bytes
 */
export async function getFileSize(filename: string): Promise<number> {
  const stats = await getStats(filename);
  return stats.size;
}

/**
 * Checks if path is a file
 */
export async function isFile(path: string): Promise<boolean> {
  try {
    const stats = await getStats(path);
    return stats.isFile;
  } catch {
    return false;
  }
}

/**
 * Checks if path is a directory
 */
export async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await getStats(path);
    return stats.isDirectory;
  } catch {
    return false;
  }
}

/**
 * Event listener management
 */
export function on(event: string, listener: EventListener): void {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, []);
  }
  eventListeners.get(event)!.push(listener);
}

export function off(event: string, listener: EventListener): void {
  const listeners = eventListeners.get(event);
  if (listeners) {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
}

/**
 * File operations utility class
 */
export class FileManager {
  private basePath: string;
  
  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
  }
  
  /**
   * Resolves a path relative to the base path
   */
  resolve(...paths: string[]): string {
    return resolve(this.basePath, ...paths);
  }
  
  /**
   * Creates a backup of a file
   */
  async backup(filePath: string, suffix: string = '.backup'): Promise<string> {
    const resolvedPath = this.resolve(filePath);
    const backupPath = `${resolvedPath}${suffix}`;
    
    await copyFile(resolvedPath, backupPath);
    return backupPath;
  }
  
  /**
   * Safely writes to a file with backup
   */
  async safeWrite(filePath: string, content: string, encoding: BufferEncoding = 'utf8'): Promise<void> {
    const resolvedPath = this.resolve(filePath);
    
    // Create backup if file exists
    if (await exists(resolvedPath)) {
      await this.backup(filePath);
    }
    
    await writeFileText(resolvedPath, content, encoding);
  }
  
  /**
   * Moves a file or directory
   */
  async move(source: string, destination: string): Promise<void> {
    const sourcePath = this.resolve(source);
    const destPath = this.resolve(destination);
    
    await rename(sourcePath, destPath);
  }
  
  /**
   * Gets file size in a human-readable format
   */
  async getHumanSize(filePath: string): Promise<string> {
    const resolvedPath = this.resolve(filePath);
    const stats = await getStats(resolvedPath);
    
    const bytes = stats.size;
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

/**
 * Creates a file manager instance
 */
export function createFileManager(basePath?: string): FileManager {
  return new FileManager(basePath);
}

/**
 * Recursively finds files matching a pattern
 */
export async function findFiles(
  directory: string,
  pattern: RegExp | string,
  options: {
    includeDirectories?: boolean;
    maxDepth?: number;
    followSymlinks?: boolean;
  } = {}
): Promise<string[]> {
  const results: string[] = [];
  const { includeDirectories = false, maxDepth = Infinity, followSymlinks = false } = options;
  
  async function search(dir: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;
    
    try {
      const entries = await readDirectory(dir);
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.type === 'DIRECTORY') {
          if (includeDirectories) {
            const matches = typeof pattern === 'string' 
              ? entry.name.includes(pattern)
              : pattern.test(entry.name);
            
            if (matches) {
              results.push(fullPath);
            }
          }
          
          await search(fullPath, depth + 1);
        } else {
          const matches = typeof pattern === 'string' 
            ? entry.name.includes(pattern)
            : pattern.test(entry.name);
          
          if (matches) {
            results.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
  }
  
  await search(directory, 0);
  return results;
}

/**
 * Synchronizes two directories
 */
export async function syncDirectories(
  source: string,
  destination: string,
  options: {
    deleteExtra?: boolean;
    overwriteNewer?: boolean;
    dryRun?: boolean;
  } = {}
): Promise<{
  copied: string[];
  deleted: string[];
  skipped: string[];
  errors: Array<{ path: string; error: string }>;
}> {
  const { deleteExtra = false, overwriteNewer = false, dryRun = false } = options;
  const result = {
    copied: [] as string[],
    deleted: [] as string[],
    skipped: [] as string[],
    errors: [] as Array<{ path: string; error: string }>
  };
  
  try {
    // Ensure destination exists
    if (!dryRun && !(await exists(destination))) {
      await createDirectory(destination);
    }
    
    const sourceEntries = await readDirectory(source);
    
    for (const entry of sourceEntries) {
      const sourcePath = join(source, entry.name);
      const destPath = join(destination, entry.name);
      
      try {
        if (entry.type === 'DIRECTORY') {
          // Recursively sync subdirectories
          const subResult = await syncDirectories(sourcePath, destPath, options);
          result.copied.push(...subResult.copied);
          result.deleted.push(...subResult.deleted);
          result.skipped.push(...subResult.skipped);
          result.errors.push(...subResult.errors);
        } else {
          // Handle file
          const shouldCopy = await shouldCopyFile(sourcePath, destPath, overwriteNewer);
          
          if (shouldCopy) {
            if (!dryRun) {
              await copyFile(sourcePath, destPath);
            }
            result.copied.push(destPath);
          } else {
            result.skipped.push(destPath);
          }
        }
      } catch (error) {
        result.errors.push({
          path: sourcePath,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Handle extra files in destination
    if (deleteExtra) {
      try {
        const destEntries = await readDirectory(destination);
        
        for (const entry of destEntries) {
          const destPath = join(destination, entry.name);
          const sourcePath = join(source, entry.name);
          
          if (!(await exists(sourcePath))) {
            if (!dryRun) {
              await remove(destPath);
            }
            result.deleted.push(destPath);
          }
        }
      } catch (error) {
        // Destination might not exist
      }
    }
  } catch (error) {
    result.errors.push({
      path: source,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  return result;
}

/**
 * Helper function to determine if a file should be copied
 */
async function shouldCopyFile(sourcePath: string, destPath: string, overwriteNewer: boolean): Promise<boolean> {
  if (!(await exists(destPath))) {
    return true; // Destination doesn't exist, copy
  }
  
  if (!overwriteNewer) {
    return false; // Don't overwrite existing files
  }
  
  try {
    const sourceStats = await getStats(sourcePath);
    const destStats = await getStats(destPath);
    
    // Copy if source is newer
    return sourceStats.modifiedAt > destStats.modifiedAt;
  } catch {
    return true; // If we can't stat, assume we should copy
  }
}

/**
 * Creates a temporary directory
 */
export async function createTempDir(prefix: string = 'tmp-'): Promise<string> {
  const tempDir = join(process.env.TMPDIR || '/tmp', `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  await createDirectory(tempDir);
  return tempDir;
}

/**
 * Creates a temporary file
 */
export async function createTempFile(content: string = '', extension: string = '.tmp'): Promise<string> {
  const tempFile = join(process.env.TMPDIR || '/tmp', `tmp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}${extension}`);
  await writeFileText(tempFile, content);
  return tempFile;
}

/**
 * Cleans up old temporary files
 */
export async function cleanupTempFiles(maxAge: number = 24 * 60 * 60 * 1000): Promise<number> {
  const tempDir = process.env.TMPDIR || '/tmp';
  let cleaned = 0;
  
  try {
    const entries = await readDirectory(tempDir);
    const now = Date.now();
    
    for (const entry of entries) {
      if (entry.name.startsWith('tmp-')) {
        const filePath = join(tempDir, entry.name);
        
        try {
          const stats = await getStats(filePath);
          const age = now - stats.modifiedAt.getTime();
          
          if (age > maxAge) {
            await remove(filePath);
            cleaned++;
          }
        } catch {
          // Skip files we can't process
        }
      }
    }
  } catch {
    // Skip if we can't access temp directory
  }
  
  return cleaned;
}

/**
 * File content archiver
 */
export class FileArchiver {
  private files = new Map<string, { content: string; timestamp: Date }>();
  
  /**
   * Archives the current content of a file
   */
  async archive(filePath: string): Promise<void> {
    try {
      const content = await readFileText(filePath);
      this.files.set(filePath, {
        content,
        timestamp: new Date()
      });
    } catch (error) {
      throw new Error(`Failed to archive file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Restores a file from archive
   */
  async restore(filePath: string): Promise<void> {
    const archived = this.files.get(filePath);
    if (!archived) {
      throw new Error('File not found in archive');
    }
    
    await writeFileText(filePath, archived.content);
  }
  
  /**
   * Gets archived file content
   */
  getArchived(filePath: string): { content: string; timestamp: Date } | null {
    return this.files.get(filePath) || null;
  }
  
  /**
   * Lists all archived files
   */
  listArchived(): Array<{ path: string; timestamp: Date }> {
    return Array.from(this.files.entries()).map(([path, data]) => ({
      path,
      timestamp: data.timestamp
    }));
  }
  
  /**
   * Clears the archive
   */
  clear(): void {
    this.files.clear();
  }
}

/**
 * Creates a file archiver instance
 */
export function createFileArchiver(): FileArchiver {
  return new FileArchiver();
}
