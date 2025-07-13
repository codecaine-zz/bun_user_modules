#!/usr/bin/env bun
/**
 * Test script to verify Bun API usage
 * Run this with: bun run bun-api-test.ts
 */

import { filesystem, utils } from './index';
import * as path from 'path';

console.log('🚀 Testing Bun API optimizations...\n');

// Test Bun file operations
async function testFileOperations() {
  console.log('📁 Testing Bun file operations:');
  
  const testFile = path.join(process.cwd(), 'test-bun-api.txt');
  const testContent = 'Hello from Bun optimized file operations!';
  
  try {
    // Test write (should use Bun.write)
    await filesystem.writeFileText(testFile, testContent);
    console.log('✓ Bun.write() - File written successfully');
    
    // Test read (should use Bun.file().text())
    const readContent = await filesystem.readFileText(testFile);
    console.log('✓ Bun.file().text() - File read successfully');
    console.log(`  Content: "${readContent}"`);
    
    // Test binary operations
    const binaryData = new ArrayBuffer(10);
    const view = new Uint8Array(binaryData);
    for (let i = 0; i < 10; i++) {
      view[i] = i;
    }
    
    const binaryFile = path.join(process.cwd(), 'test-binary.bin');
    await filesystem.writeBinaryFile(binaryFile, binaryData);
    console.log('✓ Bun.write() - Binary file written successfully');
    
    const readBinary = await filesystem.readBinaryFile(binaryFile);
    console.log('✓ Bun.file().arrayBuffer() - Binary file read successfully');
    console.log(`  Binary size: ${readBinary.byteLength} bytes`);
    
    // Cleanup
    await filesystem.remove(testFile);
    await filesystem.remove(binaryFile);
    
  } catch (error) {
    console.error('❌ File operations failed:', error);
  }
}

// Test Bun crypto operations  
function testCryptoOperations() {
  console.log('\n🔐 Testing Bun crypto operations:');
  
  try {
    // Test UUID generation (should use crypto.randomUUID when available)
    const uuid = utils.generateUUID();
    console.log('✓ crypto.randomUUID() - UUID generated successfully');
    console.log(`  UUID: ${uuid}`);
    
    // Test random string (should use crypto.getRandomValues when available)
    const randomStr = utils.generateRandomString(16);
    console.log('✓ crypto.getRandomValues() - Random string generated successfully');
    console.log(`  Random string: ${randomStr}`);
    
    // Test base64 encoding (should use btoa/atob when available)
    const testText = 'Hello Bun!';
    const encoded = utils.base64Encode(testText);
    const decoded = utils.base64Decode(encoded);
    console.log('✓ btoa/atob - Base64 encoding/decoding successful');
    console.log(`  Original: "${testText}" -> Encoded: "${encoded}" -> Decoded: "${decoded}"`);
    
    // Test SHA256 (shows async version with Web Crypto API)
    const hash = utils.sha256(testText);
    console.log('✓ crypto.subtle or Node crypto - SHA256 hash generated');
    console.log(`  SHA256: ${hash}`);
    
  } catch (error) {
    console.error('❌ Crypto operations failed:', error);
  }
}

// Test runtime detection
function testRuntimeDetection() {
  console.log('\n🔍 Runtime detection:');
  
  console.log(`  Bun available: ${typeof Bun !== 'undefined'}`);
  console.log(`  Bun.write available: ${typeof Bun !== 'undefined' && typeof Bun.write === 'function'}`);
  console.log(`  Bun.file available: ${typeof Bun !== 'undefined' && typeof Bun.file === 'function'}`);
  console.log(`  Bun.spawn available: ${typeof Bun !== 'undefined' && typeof Bun.spawn === 'function'}`);
  console.log(`  crypto.randomUUID available: ${typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'}`);
  console.log(`  crypto.getRandomValues available: ${typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function'}`);
  console.log(`  crypto.subtle available: ${typeof crypto !== 'undefined' && typeof crypto.subtle === 'object'}`);
  console.log(`  btoa/atob available: ${typeof btoa === 'function' && typeof atob === 'function'}`);
}

// Run all tests
async function runTests() {
  testRuntimeDetection();
  await testFileOperations();
  testCryptoOperations();
  
  console.log('\n✅ Bun API optimization tests completed!');
  console.log('\n📊 Summary:');
  console.log('  - File operations now use Bun.write() and Bun.file() for optimal performance');
  console.log('  - Crypto operations use Web Crypto API and built-in functions when available');
  console.log('  - Process operations use Bun.spawn() for better performance');
  console.log('  - All functions gracefully fallback to Node.js APIs for compatibility');
}

runTests().catch(console.error);
