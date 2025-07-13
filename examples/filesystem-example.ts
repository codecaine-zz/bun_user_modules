#!/usr/bin/env bun
/**
 * Filesystem Module Example
 * Demonstrates file operations, directory management, path utilities, and file watching
 */

import { filesystem } from '../index';
import * as path from 'path';

async function runFilesystemExample() {
  console.log('📁 Filesystem Module Example\n');

  const exampleDir = path.join(process.cwd(), 'temp-example');
  const testFile = path.join(exampleDir, 'test.txt');

  try {
    // Directory operations
    console.log('📂 Directory Operations:');
    
    // Create directory
    await filesystem.createDirectory(exampleDir);
    console.log('✓ Created directory:', exampleDir);

    // Check if directory exists
    const dirExists = await filesystem.exists(exampleDir);
    console.log('✓ Directory exists:', dirExists);

    // File operations
    console.log('\n📄 File Operations:');
    
    // Write text file
    const textContent = 'Hello from Bun User Modules!\nThis is a test file.';
    await filesystem.writeFileText(testFile, textContent);
    console.log('✓ Text file written:', testFile);

    // Read text file
    const readContent = await filesystem.readFileText(testFile);
    console.log('✓ Text file content:', readContent);

    // Append to file
    await filesystem.appendFileText(testFile, '\nAppended content!');
    console.log('✓ Content appended to file');

    // File stats
    console.log('\n📊 File Information:');
    const stats = await filesystem.getStats(testFile);
    console.log('✓ File size:', stats.size, 'bytes');
    console.log('✓ Is file:', stats.isFile);
    console.log('✓ Is directory:', stats.isDirectory);
    console.log('✓ Created:', stats.createdAt.toLocaleString());
    console.log('✓ Modified:', stats.modifiedAt.toLocaleString());

    // Directory listing
    const dirContents = await filesystem.readDirectory(exampleDir);
    console.log('✓ Directory contents:', dirContents.map(entry => entry.name));

    // Path operations
    console.log('\n🗂️ Path Operations:');
    const absolutePath = filesystem.getAbsolutePath('./package.json');
    console.log('✓ Absolute path:', absolutePath);

    const relativePath = filesystem.getRelativePath(process.cwd(), testFile);
    console.log('✓ Relative path:', relativePath);

    // File watching
    console.log('\n👁️ File Watching:');
    const watcherId = filesystem.watchFile(testFile, (event) => {
      console.log('✓ File watcher triggered for:', event.filename);
    });

    console.log('✓ File watcher created');

    // Modify the file to trigger watcher
    await filesystem.appendFileText(testFile, '\nTriggering watcher...');
    await new Promise(resolve => setTimeout(resolve, 100));

    // Note: watcherId is a cleanup function, call it to remove the watcher
    watcherId();
    console.log('✓ File watcher removed');

    // Copy and move operations
    console.log('\n� File Operations:');
    const copiedFile = path.join(exampleDir, 'test-copy.txt');
    await filesystem.copy(testFile, copiedFile);
    console.log('✓ File copied');

    const movedFile = path.join(exampleDir, 'test-moved.txt');
    await filesystem.move(copiedFile, movedFile);
    console.log('✓ File moved');

    console.log('\n✅ Filesystem module example completed!');

  } catch (error) {
    console.error('❌ Error in filesystem example:', error);
  } finally {
    // Cleanup
    try {
      await filesystem.remove(exampleDir);
      console.log('✓ Cleanup completed');
    } catch (error) {
      console.log('⚠️ Cleanup warning:', error);
    }
  }
}

// Run the example
if (import.meta.main) {
  await runFilesystemExample();
}
