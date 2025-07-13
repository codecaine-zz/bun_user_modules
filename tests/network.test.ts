import { describe, test, expect } from 'bun:test';
import * as network from '../modules/network';

describe('Network Module', () => {
  describe('HTTP Methods', () => {
    test('should make GET request', async () => {
      const response = await network.get('https://httpbin.org/get');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(typeof response.success).toBe('boolean');
      expect(typeof response.data).toBe('string');
      expect(typeof response.statusText).toBe('string');
      expect(typeof response.headers).toBe('object');
    });

    test('should make POST request with string body', async () => {
      const testData = JSON.stringify({ message: 'Hello, World!' });
      const response = await network.post('https://httpbin.org/post', testData, {
        'Content-Type': 'application/json'
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(typeof response.success).toBe('boolean');
      expect(typeof response.data).toBe('string');
    });

    test('should make PUT request with string body', async () => {
      const testData = JSON.stringify({ update: 'data' });
      const response = await network.put('https://httpbin.org/put', testData, {
        'Content-Type': 'application/json'
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(typeof response.success).toBe('boolean');
      expect(typeof response.data).toBe('string');
    });

    test('should make DELETE request', async () => {
      const response = await network.del('https://httpbin.org/delete');
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(typeof response.success).toBe('boolean');
      expect(typeof response.data).toBe('string');
    });

    test('should make PATCH request with string body', async () => {
      const testData = JSON.stringify({ patch: 'data' });
      const response = await network.patch('https://httpbin.org/patch', testData, {
        'Content-Type': 'application/json'
      });
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(typeof response.success).toBe('boolean');
      expect(typeof response.data).toBe('string');
    });
  });

  describe('Request with Headers', () => {
    test('should send custom headers', async () => {
      const headers = {
        'User-Agent': 'BunUserModules/1.0',
        'X-Custom-Header': 'test-value'
      };
      
      const response = await network.get('https://httpbin.org/headers', headers);
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(typeof response.data).toBe('string');
    });
  });

  describe('POST Variants', () => {
    test('should post JSON data', async () => {
      const jsonData = { type: 'json', value: 123 };
      const response = await network.postJson('https://httpbin.org/post', jsonData);
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(typeof response.data).toBe('string');
    });

    test('should post form data', async () => {
      const formData = { field1: 'value1', field2: 'value2' };
      const response = await network.postForm('https://httpbin.org/post', formData);
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(typeof response.data).toBe('string');
    });

    test('should post multipart data', async () => {
      const multipartData = { text_field: 'value', number_field: '42' };
      const response = await network.postMultipart('https://httpbin.org/post', multipartData);
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(typeof response.data).toBe('string');
    });
  });

  describe('File Operations', () => {
    test('should download binary data', async () => {
      // Download a small binary file
      const buffer = await network.downloadBinary('https://httpbin.org/bytes/100');
      
      expect(buffer instanceof ArrayBuffer).toBe(true);
      expect(buffer.byteLength).toBeGreaterThan(0);
    });

    test('should download file to disk', async () => {
      const tempPath = './test-download.tmp';
      
      try {
        await network.downloadFile('https://httpbin.org/bytes/50', tempPath);
        
        // Check if file exists
        const { exists } = await import('../modules/filesystem');
        expect(await exists(tempPath)).toBe(true);
      } finally {
        // Clean up
        try {
          const { remove } = await import('../modules/filesystem');
          await remove(tempPath);
        } catch {
          // Ignore cleanup errors
        }
      }
    });
  });

  describe('Network Utilities', () => {
    test('should ping a URL', async () => {
      const isReachable = await network.ping('https://httpbin.org');
      expect(typeof isReachable).toBe('boolean');
    });

    test('should ping with timeout', async () => {
      // Test with a very short timeout
      const isReachable = await network.ping('https://httpbin.org/delay/10', 100);
      expect(typeof isReachable).toBe('boolean');
    }, 10000);

    test('should get public IP address', async () => {
      const ip = await network.getPublicIP();
      
      expect(typeof ip).toBe('string');
      // Should either be a valid IP or an error message
      expect(ip.length).toBeGreaterThan(0);
    });

    test('should get local IP addresses', () => {
      const ips = network.getLocalIP();
      
      expect(Array.isArray(ips)).toBe(true);
      expect(ips.length).toBeGreaterThan(0);
      ips.forEach(ip => {
        expect(typeof ip).toBe('string');
        expect(ip.length).toBeGreaterThan(0);
      });
    });
  });

  describe('URL Utilities', () => {
    test('should have URL utility functions', () => {
      expect(typeof network.buildUrl).toBe('function');
      expect(typeof network.parseUrl).toBe('function');
      expect(typeof network.encodeFormData).toBe('function');
      expect(typeof network.createFormData).toBe('function');
    });

    test('should build URL with query parameters', () => {
      const baseUrl = 'https://example.com/api';
      const params = { page: '1', limit: '10', search: 'test query' };
      
      const url = network.buildUrl(baseUrl, params);
      expect(url).toContain('page=1');
      expect(url).toContain('limit=10');
      expect(url).toContain('search=test+query'); // URL encoding uses + for spaces
    });

    test('should parse URL', () => {
      const url = 'https://example.com:8080/path?query=value#fragment';
      const parsed = network.parseUrl(url);
      
      expect(parsed.protocol).toBe('https:');
      expect(parsed.hostname).toBe('example.com');
      expect(parsed.port).toBe('8080');
      expect(parsed.pathname).toBe('/path');
      expect(parsed.search).toBe('?query=value');
      expect(parsed.hash).toBe('#fragment');
    });

    test('should encode form data', () => {
      const data = { name: 'John Doe', email: 'john@example.com', count: 42, active: true };
      const encoded = network.encodeFormData(data);
      
      expect(encoded).toContain('name=John+Doe'); // Form encoding uses + for spaces
      expect(encoded).toContain('email=john%40example.com');
      expect(encoded).toContain('count=42');
      expect(encoded).toContain('active=true');
    });

    test('should create FormData object', () => {
      const data = { name: 'John Doe', email: 'john@example.com' };
      const formData = network.createFormData(data);
      
      expect(formData instanceof FormData).toBe(true);
      expect(formData.get('name')).toBe('John Doe');
      expect(formData.get('email')).toBe('john@example.com');
    });
  });

  describe('WebSocket Client', () => {
    test('should have WebSocket client function', () => {
      expect(typeof network.createWebSocket).toBe('function');
    });

    test('should create WebSocket client', () => {
      const ws = network.createWebSocket('wss://echo.websocket.org');
      
      expect(ws instanceof WebSocket).toBe(true);
      expect(typeof ws.send).toBe('function');
      expect(typeof ws.close).toBe('function');
    });
  });

  describe('HTTP Server', () => {
    test('should have server creation functions', () => {
      expect(typeof network.createServer).toBe('function');
      expect(typeof network.createWebSocketServer).toBe('function');
    });

    test('should create HTTP server', () => {
      const server = network.createServer();
      
      expect(typeof server.stop).toBe('function');
      expect(typeof server.port).toBe('number');
      expect(typeof server.hostname).toBe('string');
      expect(typeof server.url).toBe('string');
    });

    test('should create WebSocket server', () => {
      const server = network.createWebSocketServer({ port: 8080 });
      
      expect(typeof server.stop).toBe('function');
      expect(typeof server.port).toBe('number');
      expect(typeof server.hostname).toBe('string');
      expect(typeof server.url).toBe('string');
    });
  });

  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      const response = await network.get('https://nonexistent-domain-12345.com');
      
      expect(response.success).toBe(false);
      expect(typeof response.data).toBe('string');
    });

    test('should handle malformed URLs', async () => {
      const response = await network.get('not-a-valid-url');
      
      expect(response.success).toBe(false);
      expect(typeof response.data).toBe('string');
    });

    test('should handle 404 errors', async () => {
      const response = await network.get('https://httpbin.org/status/404');
      
      expect(response.status).toBe(404);
      expect(response.success).toBe(false);
    });

    test('should handle server errors', async () => {
      const response = await network.get('https://httpbin.org/status/500');
      
      expect(response.status).toBe(500);
      expect(response.success).toBe(false);
    });
  });

  describe('Custom Requests', () => {
    test('should make custom request with fetch function', async () => {
      const request = {
        url: 'https://httpbin.org/get',
        method: 'GET' as const,
        headers: { 'X-Test': 'custom-request' }
      };
      
      const response = await network.fetch(request);
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(typeof response.success).toBe('boolean');
      expect(typeof response.data).toBe('string');
    });

    test('should handle request with body', async () => {
      const request = {
        url: 'https://httpbin.org/post',
        method: 'POST' as const,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' })
      };
      
      const response = await network.fetch(request);
      
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(typeof response.data).toBe('string');
    });
  });
});
