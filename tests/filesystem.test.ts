import { test, expect, describe, beforeEach, afterEach } from 'bun:test';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as filesystem from '../modules/filesystem';

const TEST_DIR = path.join(process.cwd(), 'test-files');

describe('Filesystem Module', () => {
  beforeEach(async () => {
    // Create test directory
    try {
      await fs.mkdir(TEST_DIR, { recursive: true });
    } catch (err) {
      // Directory might already exist
    }
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch (err) {
      // Directory might not exist
    }
  });

  describe('Directory Operations', () => {
    test('should create directory', async () => {
      const dirPath = path.join(TEST_DIR, 'new-dir');
      
      await filesystem.createDirectory(dirPath);
      
      const stats = await fs.stat(dirPath);
      expect(stats.isDirectory()).toBe(true);
    });

    test('should create nested directories', async () => {
      const dirPath = path.join(TEST_DIR, 'nested', 'deep', 'directory');
      
      await filesystem.createDirectory(dirPath);
      
      const stats = await fs.stat(dirPath);
      expect(stats.isDirectory()).toBe(true);
    });

    test('should remove directory', async () => {
      const dirPath = path.join(TEST_DIR, 'to-remove');
      await fs.mkdir(dirPath);
      
      await filesystem.remove(dirPath);
      
      await expect(fs.stat(dirPath)).rejects.toThrow();
    });

    test('should read directory', async () => {
      // Create test files
      await fs.writeFile(path.join(TEST_DIR, 'file1.txt'), 'content1');
      await fs.writeFile(path.join(TEST_DIR, 'file2.txt'), 'content2');
      await fs.mkdir(path.join(TEST_DIR, 'subdir'));
      
      const entries = await filesystem.readDirectory(TEST_DIR);
      
      expect(entries.length).toBe(3);
      expect(entries.find(e => e.name === 'file1.txt')?.type).toBe('FILE');
      expect(entries.find(e => e.name === 'file2.txt')?.type).toBe('FILE');
      expect(entries.find(e => e.name === 'subdir')?.type).toBe('DIRECTORY');
    });
  });

  describe('File Operations', () => {
    test('should write and read text file', async () => {
      const filePath = path.join(TEST_DIR, 'test.txt');
      const content = 'Hello, World!';
      
      await filesystem.writeFileText(filePath, content);
      const readContent = await filesystem.readFileText(filePath);
      
      expect(readContent).toBe(content);
    });

    test('should write and read binary file', async () => {
      const filePath = path.join(TEST_DIR, 'test.bin');
      const data = new ArrayBuffer(5);
      const view = new Uint8Array(data);
      view.set([1, 2, 3, 4, 5]);
      
      await filesystem.writeBinaryFile(filePath, data);
      const readData = await filesystem.readBinaryFile(filePath);
      
      expect(new Uint8Array(readData)).toEqual(new Uint8Array(data));
    });

    test('should append to file', async () => {
      const filePath = path.join(TEST_DIR, 'append.txt');
      
      await filesystem.writeFileText(filePath, 'First line\n');
      await filesystem.appendFileText(filePath, 'Second line\n');
      
      const content = await filesystem.readFileText(filePath);
      expect(content).toBe('First line\nSecond line\n');
    });

    test('should remove file', async () => {
      const filePath = path.join(TEST_DIR, 'to-remove.txt');
      await fs.writeFile(filePath, 'content');
      
      await filesystem.remove(filePath);
      
      await expect(fs.stat(filePath)).rejects.toThrow();
    });

    test('should get file stats', async () => {
      const filePath = path.join(TEST_DIR, 'stats.txt');
      const content = 'test content';
      await fs.writeFile(filePath, content);
      
      const stats = await filesystem.getStats(filePath);
      
      expect(stats.isFile).toBe(true);
      expect(stats.isDirectory).toBe(false);
      expect(stats.size).toBe(content.length);
      expect(stats.createdAt).toBeInstanceOf(Date);
      expect(stats.modifiedAt).toBeInstanceOf(Date);
    });
  });

  describe('Path Operations', () => {
    test('should check if file exists', async () => {
      const existingFile = path.join(TEST_DIR, 'existing.txt');
      const nonExistingFile = path.join(TEST_DIR, 'non-existing.txt');
      
      await fs.writeFile(existingFile, 'content');
      
      expect(await filesystem.exists(existingFile)).toBe(true);
      expect(await filesystem.exists(nonExistingFile)).toBe(false);
    });

    test('should copy file', async () => {
      const source = path.join(TEST_DIR, 'source.txt');
      const destination = path.join(TEST_DIR, 'destination.txt');
      const content = 'copy me';
      
      await fs.writeFile(source, content);
      await filesystem.copy(source, destination);
      
      const copiedContent = await filesystem.readFileText(destination);
      expect(copiedContent).toBe(content);
    });

    test('should move file', async () => {
      const source = path.join(TEST_DIR, 'move-source.txt');
      const destination = path.join(TEST_DIR, 'move-destination.txt');
      const content = 'move me';
      
      await fs.writeFile(source, content);
      await filesystem.move(source, destination);
      
      expect(await filesystem.exists(source)).toBe(false);
      expect(await filesystem.exists(destination)).toBe(true);
      
      const movedContent = await filesystem.readFileText(destination);
      expect(movedContent).toBe(content);
    });

    test('should parse path parts', () => {
      const testPath = '/home/user/documents/file.txt';
      const parts = filesystem.getPathParts(testPath);
      
      expect(parts.filename).toBe('file.txt');
      expect(parts.extension).toBe('.txt');
      expect(parts.stem).toBe('file');
      expect(parts.parentPath).toBe('/home/user/documents');
    });

    test('should get absolute path', () => {
      const absolutePath = filesystem.getAbsolutePath('documents/file.txt');
      expect(path.isAbsolute(absolutePath)).toBe(true);
    });

    test('should get relative path', () => {
      const relative = filesystem.getRelativePath('/home/user/documents/file.txt', '/home/user');
      expect(relative).toBe('documents/file.txt');
    });
  });

  describe('File Watching', () => {
    test('should create file watcher', () => {
      const watcherId = filesystem.createWatcher(TEST_DIR);
      
      expect(watcherId).toBeGreaterThan(0);
      
      filesystem.removeWatcher(watcherId);
    });

    test('should remove file watcher', () => {
      const watcherId = filesystem.createWatcher(TEST_DIR);
      
      filesystem.removeWatcher(watcherId);
      
      const watchers = filesystem.getWatchers();
      expect(watchers.find(w => w.id === watcherId)).toBeUndefined();
    });

    test('should list watchers', () => {
      const initialWatcherCount = filesystem.getWatchers().length;
      
      // Use different paths to ensure separate watchers are created
      const testDir1 = path.join(TEST_DIR, 'watch1');
      const testDir2 = path.join(TEST_DIR, 'watch2');
      
      const watcherId1 = filesystem.createWatcher(testDir1);
      const watcherId2 = filesystem.createWatcher(testDir2);
      
      const watchers = filesystem.getWatchers();
      
      expect(watchers.length).toBe(initialWatcherCount + 2);
      expect(watchers.find(w => w.id === watcherId1)).toBeDefined();
      expect(watchers.find(w => w.id === watcherId2)).toBeDefined();
      
      filesystem.removeWatcher(watcherId1);
      filesystem.removeWatcher(watcherId2);
    });
  });

  describe('Special Operations', () => {
    test('should use Node.js path functions directly', () => {
      // Since the filesystem module doesn't wrap all path functions,
      // we can test that the path library works as expected
      expect(path.isAbsolute('/home/user')).toBe(true);
      expect(path.isAbsolute('documents/file.txt')).toBe(false);
      
      expect(path.dirname('/home/user/documents/file.txt')).toBe('/home/user/documents');
      expect(path.basename('/home/user/documents/file.txt')).toBe('file.txt');
      expect(path.basename('/home/user/documents/file.txt', '.txt')).toBe('file');
      expect(path.extname('/home/user/documents/file.txt')).toBe('.txt');
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent file read', async () => {
      const nonExistentFile = path.join(TEST_DIR, 'does-not-exist.txt');
      
      await expect(filesystem.readFileText(nonExistentFile)).rejects.toThrow();
    });

    test('should handle invalid directory creation', async () => {
      // Try to create directory in non-existent parent
      const invalidPath = '/non-existent-root/test-dir';
      
      await expect(filesystem.createDirectory(invalidPath)).rejects.toThrow();
    });

    test('should handle copying non-existent file', async () => {
      const source = path.join(TEST_DIR, 'non-existent.txt');
      const destination = path.join(TEST_DIR, 'copy.txt');
      
      await expect(filesystem.copy(source, destination)).rejects.toThrow();
    });
  });
});
