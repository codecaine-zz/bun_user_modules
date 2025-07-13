#!/usr/bin/env bun

/**
 * Enhanced File Watching Example
 * Demonstrates advanced directory monitoring with configurable events, filtering, and debouncing
 */

import { 
  createDirectoryWatcher, 
  getDirectoryWatchers, 
  stopAllDirectoryWatchers,
  createDirectory,
  writeFileText,
  remove
} from '../modules/filesystem.js';
import { join } from 'path';

async function demonstrateEnhancedWatching() {
  console.log('🔍 Enhanced File Watching Example\n');
  
  // Create a test directory
  const testDir = './test-enhanced-watching';
  await createDirectory(testDir);
  console.log(`✅ Created test directory: ${testDir}`);

  try {
    // Example 1: Basic Enhanced Watcher
    console.log('\n📁 Example 1: Basic Enhanced Directory Watcher');
    const basicWatcher = createDirectoryWatcher(testDir, {
      recursive: true,
      events: ['create', 'modify', 'delete'],
      debounceMs: 100
    });

    let eventCount = 0;
    basicWatcher.on('change', (event) => {
      eventCount++;
      console.log(`  🔔 Event ${eventCount}: ${event.event} - ${event.filename}`);
      console.log(`     📊 Size: ${event.size || 'N/A'} bytes, Directory: ${event.isDirectory}`);
      console.log(`     ⏰ Time: ${event.timestamp.toISOString()}`);
    });

    basicWatcher.on('error', (error) => {
      console.error('  ❌ Watcher error:', error.message);
    });

    await basicWatcher.start();
    console.log(`  ▶️  Started basic watcher (ID: ${basicWatcher.id})`);

    // Create some test files
    console.log('\n  📝 Creating test files...');
    await writeFileText(join(testDir, 'test1.txt'), 'Hello World');
    await writeFileText(join(testDir, 'test2.js'), 'console.log("test");');
    
    // Create subdirectory with files
    const subDir = join(testDir, 'subdir');
    await createDirectory(subDir);
    await writeFileText(join(subDir, 'nested.txt'), 'Nested file content');

    // Wait for events to be processed
    await new Promise(resolve => setTimeout(resolve, 300));

    console.log(`  📈 Total events captured: ${basicWatcher.eventCount}`);
    console.log(`  🕐 Last event: ${basicWatcher.lastEvent?.toISOString() || 'None'}`);

    // Example 2: Filtered Watcher
    console.log('\n📁 Example 2: Filtered Directory Watcher');
    const filteredWatcher = createDirectoryWatcher(testDir, {
      recursive: true,
      events: ['create', 'modify'],
      debounceMs: 50,
      includePatterns: [/\.txt$/, /\.md$/],  // Only text and markdown files
      ignorePatterns: ['temp', /\.tmp$/],    // Ignore temp files
      maxDepth: 2                           // Limit recursion depth
    });

    let filteredEventCount = 0;
    filteredWatcher.on('change', (event) => {
      filteredEventCount++;
      console.log(`  🎯 Filtered Event ${filteredEventCount}: ${event.event} - ${event.filename}`);
      console.log(`     📁 Path: ${event.path}`);
    });

    await filteredWatcher.start();
    console.log(`  ▶️  Started filtered watcher (ID: ${filteredWatcher.id})`);

    // Test filtering
    console.log('\n  📝 Testing file filters...');
    await writeFileText(join(testDir, 'should-include.txt'), 'Included');
    await writeFileText(join(testDir, 'should-ignore.js'), 'Ignored');
    await writeFileText(join(testDir, 'temp.txt'), 'Ignored temp');
    await writeFileText(join(testDir, 'readme.md'), 'Included markdown');

    // Wait for events
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log(`  📈 Filtered events captured: ${filteredWatcher.eventCount}`);

    // Example 3: Monitor Statistics
    console.log('\n📁 Example 3: Watcher Management');
    const watchers = getDirectoryWatchers();
    console.log(`  📊 Active watchers: ${watchers.length}`);
    
    watchers.forEach(watcher => {
      console.log(`     • Watcher ${watcher.id}: ${watcher.eventCount} events, active: ${watcher.active}`);
      console.log(`       📁 Path: ${watcher.path}`);
      console.log(`       🕐 Last event: ${watcher.lastEvent?.toISOString() || 'None'}`);
    });

    // Example 4: Event Listener Management
    console.log('\n📁 Example 4: Dynamic Event Listeners');
    const dynamicWatcher = createDirectoryWatcher(testDir, {
      events: ['create', 'delete'],
      debounceMs: 25
    });

    // Add multiple listeners
    const listener1 = (event: any) => console.log(`  🔔 Listener 1: ${event.filename}`);
    const listener2 = (event: any) => console.log(`  🔕 Listener 2: ${event.filename}`);

    dynamicWatcher.on('change', listener1);
    dynamicWatcher.on('change', listener2);

    await dynamicWatcher.start();
    console.log(`  ▶️  Started dynamic watcher with 2 listeners`);

    // Test with file creation
    await writeFileText(join(testDir, 'dynamic-test.txt'), 'Test');
    await new Promise(resolve => setTimeout(resolve, 100));

    // Remove one listener
    dynamicWatcher.off('change', listener1);
    console.log(`  ➖ Removed listener 1`);

    await writeFileText(join(testDir, 'dynamic-test2.txt'), 'Test 2');
    await new Promise(resolve => setTimeout(resolve, 100));

    // Example 5: Error Handling
    console.log('\n📁 Example 5: Error Handling');
    const errorWatcher = createDirectoryWatcher('/non/existent/path');
    
    errorWatcher.on('error', (error) => {
      console.log(`  ⚠️  Expected error caught: ${error.message}`);
    });

    try {
      await errorWatcher.start();
      console.log(`  ✅ Watcher started without error (may vary by system)`);
    } catch (error) {
      console.log(`  ⚠️  Expected startup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Clean up all watchers
    console.log('\n🧹 Cleaning up watchers...');
    await stopAllDirectoryWatchers();
    console.log(`  ✅ All watchers stopped`);

  } finally {
    // Clean up test directory
    console.log('\n🧹 Cleaning up test directory...');
    try {
      await remove(testDir);
      console.log(`  ✅ Removed test directory: ${testDir}`);
    } catch (error) {
      console.log(`  ⚠️  Cleanup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('\n✨ Enhanced File Watching demonstration complete!');
  console.log('\n📚 Key Features Demonstrated:');
  console.log('   • Real-time file system monitoring');
  console.log('   • Configurable event filtering (create, modify, delete, rename)');
  console.log('   • Pattern-based file inclusion/exclusion');
  console.log('   • Debouncing to reduce event noise');
  console.log('   • Recursive directory monitoring with depth limits');
  console.log('   • Multiple event listeners per watcher');
  console.log('   • Watcher statistics and management');
  console.log('   • Graceful error handling');
  console.log('   • Performance optimization with native fs.watch');
}

// Run the demonstration
if (import.meta.main) {
  demonstrateEnhancedWatching().catch(console.error);
}

export { demonstrateEnhancedWatching };
