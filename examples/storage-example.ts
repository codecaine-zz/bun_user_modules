#!/usr/bin/env bun
/**
 * Storage Module Example
 * Demonstrates local data storage and persistence
 */

import { storage } from '../index';

async function runStorageExample() {
  console.log('💾 Storage Module Example\n');

  try {
    // Basic storage operations
    console.log('📦 Basic Storage Operations:');
    
    // Set data
    await storage.setData('username', 'john_doe');
    await storage.setData('userAge', 25);
    await storage.setData('preferences', { theme: 'dark', language: 'en' });
    console.log('✓ Data stored');

    // Get data
    const username = await storage.getData('username');
    const userAge = await storage.getData('userAge');
    const preferences = await storage.getData('preferences');
    
    console.log('✓ Username:', username);
    console.log('✓ User age:', userAge);
    console.log('✓ Preferences:', preferences);

    // Check if data exists
    const hasUsername = await storage.hasData('username');
    const hasInvalidKey = await storage.hasData('nonexistent');
    console.log('✓ Has username:', hasUsername);
    console.log('✓ Has invalid key:', hasInvalidKey);

    // Get all keys
    console.log('\n🔑 Key Management:');
    const allKeys = await storage.getAllKeys();
    console.log('✓ All keys:', allKeys);

    // Storage statistics
    const stats = await storage.getStats();
    console.log('✓ Storage stats:', stats);

    // Import/Export
    console.log('\n📤 Import/Export:');
    const exportedData = await storage.exportData();
    console.log('✓ Exported data keys:', Object.keys(exportedData));

    // Namespaced storage
    console.log('\n🏷️ Namespaced Storage:');
    const userStorage = storage.createNamespacedStorage('user');
    const appStorage = storage.createNamespacedStorage('app');

    await userStorage.setData('profile', { name: 'John', email: 'john@example.com' });
    await appStorage.setData('config', { version: '1.0.0', debug: false });

    const userProfile = await userStorage.getData('profile');
    const appConfig = await appStorage.getData('config');

    console.log('✓ User profile:', userProfile);
    console.log('✓ App config:', appConfig);

    // Clear specific data
    console.log('\n🧹 Data Cleanup:');
    await storage.removeData('userAge');
    console.log('✓ Removed userAge');

    const remainingKeys = await storage.getAllKeys();
    console.log('✓ Remaining keys:', remainingKeys);

    console.log('\n✅ Storage module example completed!');

  } catch (error) {
    console.error('❌ Error in storage example:', error);
  } finally {
    // Cleanup
    try {
      await storage.clearAll();
      console.log('✓ Storage cleared');
    } catch (error) {
      console.log('⚠️ Cleanup warning:', error);
    }
  }
}

// Run the example
if (import.meta.main) {
  await runStorageExample();
}
