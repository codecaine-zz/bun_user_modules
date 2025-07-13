#!/usr/bin/env bun
/**
 * API Test Script
 * Tests the actual APIs available in each module and creates working examples
 */

import * as modules from '../index';

async function testModuleAPIs() {
  console.log('🧪 Testing Module APIs\n');

  // Test Utils module first
  console.log('🛠️ Utils Module API:');
  console.log('Available functions:', Object.keys(modules.utils));
  
  // Test weighted array API
  if (modules.utils.weightedArray) {
    console.log('Weighted Array methods:', Object.keys(modules.utils.weightedArray));
    
    // Test the actual API
    const items = [
      { item: 'apple', weight: 10 },
      { item: 'banana', weight: 30 },
      { item: 'cherry', weight: 60 }
    ];
    
    try {
      const picked = modules.utils.weightedArray.pickWeighted(['apple', 'banana', 'cherry'], [10, 30, 60]);
      console.log('✓ Weighted pick:', picked);
    } catch (error) {
      console.log('❌ Weighted pick error:', error.message);
    }
  }

  // Test Storage module
  console.log('\n💾 Storage Module API:');
  console.log('Available functions:', Object.keys(modules.storage));
  
  try {
    await modules.storage.setData('test', 'value');
    const value = await modules.storage.getData('test');
    console.log('✓ Storage test:', value);
    
    // Try to get keys with correct API
    if (modules.storage.getKeys) {
      const keys = await modules.storage.getKeys();
      console.log('✓ Storage keys:', keys);
    }
    
    // Try to clear with correct API
    if (modules.storage.clear) {
      await modules.storage.clear();
      console.log('✓ Storage cleared');
    }
  } catch (error) {
    console.log('❌ Storage error:', error.message);
  }

  // Test Debug module timers
  console.log('\n🐛 Debug Module Timers:');
  try {
    const timerResult = modules.debug.timer('test-timer');
    console.log('✓ Timer result type:', typeof timerResult, timerResult);
    
    if (typeof timerResult === 'object' && timerResult.end) {
      setTimeout(() => {
        const elapsed = timerResult.end();
        console.log('✓ Timer elapsed:', elapsed);
      }, 100);
    }
  } catch (error) {
    console.log('❌ Timer error:', error.message);
  }

  // Test Events module
  console.log('\n⚡ Events Module API:');
  try {
    modules.events.on('test-event', (data) => {
      console.log('✓ Event received:', data);
    });
    
    modules.events.emit('test-event', { message: 'Test successful' });
    
    const eventNames = modules.events.eventNames();
    console.log('✓ Event names:', eventNames);
  } catch (error) {
    console.log('❌ Events error:', error.message);
  }

  console.log('\n✅ API testing completed!');
}

// Run the test
if (import.meta.main) {
  await testModuleAPIs();
}
