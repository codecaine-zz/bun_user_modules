#!/usr/bin/env bun
/**
 * Events Module Example
 * Demonstrates event system, listeners, emitters, and advanced event patterns
 */

import { events } from '../index';

async function runEventsExample() {
  console.log('⚡ Events Module Example\n');

  // Basic event operations
  console.log('📡 Basic Event Operations:');
  
  // Add event listeners
  events.on('user-login', (data) => {
    console.log('✓ User logged in:', data.username);
  });

  events.on('user-logout', (data) => {
    console.log('✓ User logged out:', data.username);
  });

  // Emit events
  events.emit('user-login', { username: 'john_doe', timestamp: Date.now() });
  events.emit('user-logout', { username: 'john_doe', timestamp: Date.now() });

  // Multiple listeners for the same event
  console.log('\n👥 Multiple Listeners:');
  
  const logEvent = (data: any) => console.log('📊 Analytics:', data);
  const notifyUser = (data: any) => console.log('📧 Email sent to:', data.email);
  const updateDatabase = (data: any) => console.log('💾 Database updated for:', data.id);

  events.on('user-registered', logEvent);
  events.on('user-registered', notifyUser);
  events.on('user-registered', updateDatabase);

  events.emit('user-registered', {
    id: 123,
    email: 'newuser@example.com',
    username: 'new_user'
  });

  // Once listeners (execute only once)
  console.log('\n🎯 Once Listeners:');
  
  events.once('app-startup', (data) => {
    console.log('🚀 App started once:', data.version);
  });

  events.emit('app-startup', { version: '1.0.0' });
  events.emit('app-startup', { version: '1.0.1' }); // This won't trigger the listener

  // Event listener management
  console.log('\n🔧 Listener Management:');
  
  const temporaryListener = (data: any) => {
    console.log('⏰ Temporary event:', data);
  };

  events.on('temporary-event', temporaryListener);
  events.emit('temporary-event', { message: 'This will show' });

  // Remove specific listener
  events.off('temporary-event', temporaryListener);
  events.emit('temporary-event', { message: 'This will not show' });

  // Event utilities
  console.log('\n🛠️ Event Utilities:');
  
  // Get event names
  const eventNames = events.eventNames();
  console.log('✓ Current event names:', eventNames);

  // Count listeners
  const loginListeners = events.listenerCount('user-login');
  console.log('✓ Listeners for user-login:', loginListeners);

  // Remove all listeners for specific event
  events.removeAllListeners('user-registered');
  const registeredListeners = events.listenerCount('user-registered');
  console.log('✓ Listeners after removal:', registeredListeners);

  // Advanced event features
  console.log('\n🚀 Advanced Event Features:');

  // Wait for event (Promise-based)
  setTimeout(() => {
    events.emit('async-operation-complete', { result: 'success' });
  }, 500);

  console.log('⏳ Waiting for async operation...');
  try {
    const result = await events.waitFor('async-operation-complete', 1000);
    console.log('✓ Async operation result:', result);
  } catch (error) {
    console.log('❌ Timeout waiting for event');
  }

  // Wait for multiple events
  setTimeout(() => {
    events.emit('task-1-complete', { task: 1 });
    events.emit('task-2-complete', { task: 2 });
  }, 200);

  console.log('⏳ Waiting for multiple tasks...');
  try {
    const results = await events.waitForAll(['task-1-complete', 'task-2-complete'], 1000);
    console.log('✓ All tasks completed:', results);
  } catch (error) {
    console.log('❌ Timeout waiting for tasks');
  }

  // Threshold events (trigger after N occurrences)
  console.log('\n🎯 Threshold Events:');
  
  let clickCount = 0;
  events.threshold('button-click', 3, (data: any) => {
    console.log('🖱️ Button clicked 3 times! Last click:', data);
  });

  // Simulate button clicks
  for (let i = 1; i <= 5; i++) {
    events.emit('button-click', { clickNumber: i, timestamp: Date.now() });
    console.log(`Click ${i}`);
  }

  // Debounced events (throttle rapid firing)
  console.log('\n🎛️ Debounced Events:');
  
  events.debounce('search-input', 300, (data: any) => {
    console.log('🔍 Search executed:', data.query);
  });

  // Simulate rapid search input
  const searches = ['a', 'ap', 'app', 'apple'];
  for (let i = 0; i < searches.length; i++) {
    setTimeout(() => {
      events.emit('search-input', { query: searches[i] });
      console.log(`Search input: ${searches[i]}`);
    }, i * 100);
  }

  // Wait for debounced search to complete
  await new Promise(resolve => setTimeout(resolve, 500));

  // Throttled events (limit frequency)
  console.log('\n⚡ Throttled Events:');
  
  events.throttle('scroll-event', 200, (data: any) => {
    console.log('📜 Scroll handler executed:', data.position);
  });

  // Simulate rapid scroll events
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      events.emit('scroll-event', { position: i * 100 });
    }, i * 50);
  }

  await new Promise(resolve => setTimeout(resolve, 600));

  // Independent event emitters
  console.log('\n🎭 Independent Event Emitters:');
  
  const chatEmitter = events.createEventEmitter();
  const gameEmitter = events.createEventEmitter();

  chatEmitter.on('message', (data) => {
    console.log('💬 Chat message:', data.text);
  });

  gameEmitter.on('score-update', (data) => {
    console.log('🎮 Score updated:', data.score);
  });

  chatEmitter.emit('message', { text: 'Hello everyone!', user: 'Alice' });
  gameEmitter.emit('score-update', { score: 1500, player: 'Bob' });

  // System events with structured data
  console.log('\n🖥️ System Events:');
  
  events.emitSystemEvent('PROCESS_SPAWNED', {
    pid: process.pid,
    command: 'bun run example',
    timestamp: new Date()
  });

  events.emitSystemEvent('WARNING', {
    usage: 85.5,
    threshold: 80,
    timestamp: new Date()
  });

  // Error handling in event listeners
  console.log('\n❗ Error Handling:');
  
  events.on('error-prone-event', () => {
    throw new Error('Something went wrong in event handler');
  });

  events.on('error-prone-event', (data) => {
    console.log('✓ This handler still works:', data.message);
  });

  events.emit('error-prone-event', { message: 'Testing error resilience' });

  // Event history and analysis
  console.log('\n📊 Event Statistics:');
  
  // Emit various events for statistics
  for (let i = 0; i < 5; i++) {
    events.emit('page-view', { page: `/page-${i}` });
  }
  
  for (let i = 0; i < 3; i++) {
    events.emit('user-action', { action: `action-${i}` });
  }

  // Clean up all listeners
  console.log('\n🧹 Cleanup:');
  const eventNamesBefore = events.eventNames();
  console.log('✓ Events before cleanup:', eventNamesBefore.length);

  events.removeAllListeners();
  
  const eventNamesAfter = events.eventNames();
  console.log('✓ Events after cleanup:', eventNamesAfter.length);

  console.log('\n✅ Events module example completed!');
}

// Run the example
if (import.meta.main) {
  await runEventsExample();
}
