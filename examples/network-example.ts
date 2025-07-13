#!/usr/bin/env bun
/**
 * Network Module Example
 * Demonstrates HTTP requests, WebSockets, and networking utilities
 */

import { network } from '../index';

async function runNetworkExample() {
  console.log('🌐 Network Module Example\n');

  try {
    // Basic HTTP requests
    console.log('📡 HTTP Requests:');
    
    // GET request
    const getResponse = await network.get('https://httpbin.org/get?test=value');
    console.log('✓ GET request status:', getResponse.status);
    console.log('✓ GET response type:', typeof getResponse.data);

    // POST request with JSON
    const postData = { name: 'Test User', timestamp: Date.now() };
    const postResponse = await network.postJson('https://httpbin.org/post', postData);
    console.log('✓ POST JSON status:', postResponse.status);

    // Network utilities
    console.log('\n🔧 Network Utilities:');
    
    // Ping a URL
    const pingResult = await network.ping('https://httpbin.org');
    console.log('✓ Ping result:', pingResult);

    // Get public IP
    try {
      const publicIP = await network.getPublicIP();
      console.log('✓ Public IP:', publicIP);
    } catch (error) {
      console.log('⚠️ Could not get public IP');
    }

    // Get local IP addresses
    const localIP = network.getLocalIP();
    console.log('✓ Local IP:', localIP);

    // URL utilities
    console.log('\n🔗 URL Utilities:');
    
    const baseUrl = 'https://api.example.com/users';
    const params = { page: 1, limit: 10, search: 'john doe' };
    const builtUrl = network.buildUrl(baseUrl, params);
    console.log('✓ Built URL:', builtUrl);

    const parsedUrl = network.parseUrl(builtUrl);
    console.log('✓ Parsed URL hostname:', parsedUrl.hostname);
    console.log('✓ Parsed URL pathname:', parsedUrl.pathname);

    // Form data encoding
    const formData = network.encodeFormData({ username: 'test', password: 'secret' });
    console.log('✓ Form data encoded:', formData);

    console.log('\n✅ Network module example completed!');

  } catch (error) {
    console.error('❌ Error in network example:', error);
  }
}

// Run the example
if (import.meta.main) {
  await runNetworkExample();
}
