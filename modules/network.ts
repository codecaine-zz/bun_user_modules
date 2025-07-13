import type { NetworkRequest, NetworkResponse, ServerOptions, WebSocketOptions } from '../types';

/**
 * Makes an HTTP request
 */
export async function fetch(request: NetworkRequest): Promise<NetworkResponse> {
  const {
    url,
    method = 'GET',
    headers = {},
    body,
    timeout = 30000
  } = request;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await globalThis.fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    const data = await response.text();

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data,
      success: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      statusText: 'Request failed',
      headers: {},
      data: error instanceof Error ? error.message : 'Unknown error',
      success: false
    };
  }
}

/**
 * Makes a GET request
 */
export async function get(url: string, headers?: Record<string, string>): Promise<NetworkResponse> {
  return fetch({
    url,
    method: 'GET',
    headers
  });
}

/**
 * Makes a POST request
 */
export async function post(
  url: string,
  body?: string | ArrayBuffer | FormData,
  headers?: Record<string, string>
): Promise<NetworkResponse> {
  return fetch({
    url,
    method: 'POST',
    headers,
    body
  });
}

/**
 * Makes a PUT request
 */
export async function put(
  url: string,
  body?: string | ArrayBuffer | FormData,
  headers?: Record<string, string>
): Promise<NetworkResponse> {
  return fetch({
    url,
    method: 'PUT',
    headers,
    body
  });
}

/**
 * Makes a DELETE request
 */
export async function del(url: string, headers?: Record<string, string>): Promise<NetworkResponse> {
  return fetch({
    url,
    method: 'DELETE',
    headers
  });
}

/**
 * Makes a PATCH request
 */
export async function patch(
  url: string,
  body?: string | ArrayBuffer | FormData,
  headers?: Record<string, string>
): Promise<NetworkResponse> {
  return fetch({
    url,
    method: 'PATCH',
    headers,
    body
  });
}

/**
 * Downloads a file from a URL
 */
export async function downloadFile(url: string, filePath: string): Promise<void> {
  const response = await fetch({ url });
  
  if (!response.success) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  await Bun.write(filePath, response.data);
}

/**
 * Downloads a file as binary data
 */
export async function downloadBinary(url: string): Promise<ArrayBuffer> {
  const response = await globalThis.fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to download binary: ${response.statusText}`);
  }

  return response.arrayBuffer();
}

/**
 * Creates a simple HTTP server
 */
export function createServer(options: ServerOptions = {}): {
  port: number;
  hostname: string;
  url: string;
  stop: () => void;
} {
  const {
    port = 3000,
    hostname = 'localhost',
    development = false
  } = options;

  const server = Bun.serve({
    port,
    hostname,
    development,
    fetch(request: Request) {
      return new Response('Hello from Bun server!');
    }
  });

  return {
    port: server.port || port,
    hostname: server.hostname || hostname,
    url: server.url.toString(),
    stop: () => server.stop()
  };
}

/**
 * Creates a WebSocket client connection
 */
export function createWebSocket(
  url: string,
  options: WebSocketOptions = {}
): WebSocket {
  const ws = new WebSocket(url, options.protocols);
  
  // Set headers if provided (note: WebSocket API doesn't support custom headers in browsers)
  if (options.headers && typeof Bun !== 'undefined') {
    // Bun-specific WebSocket with headers support would go here
  }

  return ws;
}

/**
 * Creates a WebSocket server
 */
export function createWebSocketServer(options: ServerOptions = {}): {
  port: number;
  hostname: string;
  url: string;
  stop: () => void;
} {
  const {
    port = 3001,
    hostname = 'localhost',
    development = false
  } = options;

  const server = Bun.serve({
    port,
    hostname,
    development,
    fetch(req, server) {
      // Upgrade to WebSocket
      if (server.upgrade(req)) {
        return; // do not return a Response
      }
      return new Response('Upgrade failed', { status: 500 });
    },
    websocket: {
      message(ws, message) {
        ws.send(`Echo: ${message}`);
      },
      open(ws) {
        console.log('WebSocket connection opened');
      },
      close(ws, code, message) {
        console.log('WebSocket connection closed');
      },
      drain(ws) {
        console.log('WebSocket backpressure drained');
      }
    }
  });

  return {
    port: server.port || port,
    hostname: server.hostname || hostname,
    url: server.url.toString().replace('http', 'ws'),
    stop: () => server.stop()
  };
}

/**
 * Checks if a URL is reachable
 */
export async function ping(url: string, timeout: number = 5000): Promise<boolean> {
  try {
    const response = await fetch({
      url,
      method: 'HEAD',
      timeout
    });
    return response.success;
  } catch {
    return false;
  }
}

/**
 * Gets the local IP address
 */
export function getLocalIP(): string[] {
  const interfaces = require('os').networkInterfaces();
  const addresses: string[] = [];

  Object.keys(interfaces).forEach(interfaceName => {
    const nets = interfaces[interfaceName];
    if (!nets) return;

    nets.forEach((net: any) => {
      // Skip over non-IPv4 and internal addresses
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    });
  });

  return addresses;
}

/**
 * Gets the public IP address
 */
export async function getPublicIP(): Promise<string> {
  try {
    const response = await get('https://api.ipify.org?format=text');
    if (response.success) {
      return response.data.trim();
    }
    throw new Error('Failed to get public IP');
  } catch (error) {
    // Fallback to another service
    try {
      const response = await get('https://icanhazip.com');
      if (response.success) {
        return response.data.trim();
      }
    } catch {
      // Ignore fallback errors
    }
    throw new Error('Failed to get public IP address');
  }
}

/**
 * Parses a URL into its components
 */
export function parseUrl(url: string): {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  searchParams: Record<string, string>;
} {
  const urlObj = new URL(url);
  const searchParams: Record<string, string> = {};
  
  urlObj.searchParams.forEach((value, key) => {
    searchParams[key] = value;
  });

  return {
    protocol: urlObj.protocol,
    hostname: urlObj.hostname,
    port: urlObj.port,
    pathname: urlObj.pathname,
    search: urlObj.search,
    hash: urlObj.hash,
    searchParams
  };
}

/**
 * Builds a URL from components
 */
export function buildUrl(
  base: string,
  params?: Record<string, string | number | boolean>
): string {
  const url = new URL(base);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

/**
 * Encodes data as form URL encoded
 */
export function encodeFormData(data: Record<string, string | number | boolean>): string {
  const params = new URLSearchParams();
  
  Object.entries(data).forEach(([key, value]) => {
    params.append(key, String(value));
  });

  return params.toString();
}

/**
 * Creates a FormData object from a record
 */
export function createFormData(data: Record<string, string | Blob | File>): FormData {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return formData;
}

/**
 * Makes a request with JSON data
 */
export async function postJson(url: string, data: any, headers?: Record<string, string>): Promise<NetworkResponse> {
  return post(url, JSON.stringify(data), {
    'Content-Type': 'application/json',
    ...headers
  });
}

/**
 * Makes a request with form data
 */
export async function postForm(
  url: string,
  data: Record<string, string | number | boolean>,
  headers?: Record<string, string>
): Promise<NetworkResponse> {
  return post(url, encodeFormData(data), {
    'Content-Type': 'application/x-www-form-urlencoded',
    ...headers
  });
}

/**
 * Makes a request with multipart form data
 */
export async function postMultipart(
  url: string,
  data: Record<string, string | Blob | File>,
  headers?: Record<string, string>
): Promise<NetworkResponse> {
  const formData = createFormData(data);
  return post(url, formData, headers);
}

/**
 * Sets up a proxy for requests
 */
export class RequestProxy {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.defaultHeaders = defaultHeaders;
  }

  private buildFullUrl(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  }

  async request(request: Omit<NetworkRequest, 'url'> & { path: string }): Promise<NetworkResponse> {
    const { path, ...requestOptions } = request;
    return fetch({
      url: this.buildFullUrl(path),
      headers: { ...this.defaultHeaders, ...requestOptions.headers },
      ...requestOptions
    });
  }

  async get(path: string, headers?: Record<string, string>): Promise<NetworkResponse> {
    return this.request({ path, method: 'GET', headers });
  }

  async post(path: string, body?: any, headers?: Record<string, string>): Promise<NetworkResponse> {
    return this.request({ path, method: 'POST', body, headers });
  }

  async put(path: string, body?: any, headers?: Record<string, string>): Promise<NetworkResponse> {
    return this.request({ path, method: 'PUT', body, headers });
  }

  async delete(path: string, headers?: Record<string, string>): Promise<NetworkResponse> {
    return this.request({ path, method: 'DELETE', headers });
  }

  async patch(path: string, body?: any, headers?: Record<string, string>): Promise<NetworkResponse> {
    return this.request({ path, method: 'PATCH', body, headers });
  }
}

/**
 * Network utilities and helpers
 */
export class NetworkUtils {
  /**
   * Checks if a URL is reachable
   */
  static async isReachable(url: string, timeout: number = 5000): Promise<boolean> {
    try {
      const response = await fetch({
        url,
        method: 'HEAD',
        timeout
      });
      return response.success;
    } catch {
      return false;
    }
  }
  
  /**
   * Gets the public IP address
   */
  static async getPublicIP(): Promise<string> {
    const services = [
      'https://api.ipify.org',
      'https://ipinfo.io/ip',
      'https://httpbin.org/ip',
      'https://jsonip.com'
    ];
    
    for (const service of services) {
      try {
        const response = await fetch({ url: service, timeout: 5000 });
        if (response.success) {
          if (service.includes('jsonip.com')) {
            const data = JSON.parse(response.data);
            return data.ip;
          } else if (service.includes('httpbin.org')) {
            const data = JSON.parse(response.data);
            return data.origin.split(',')[0].trim();
          }
          return response.data.trim();
        }
      } catch {
        continue;
      }
    }
    
    throw new Error('Failed to get public IP from all services');
  }
  
  /**
   * Downloads a file from a URL
   */
  static async downloadFile(
    url: string,
    destinationPath: string,
    options: {
      onProgress?: (downloaded: number, total: number) => void;
      timeout?: number;
    } = {}
  ): Promise<void> {
    const { timeout = 30000 } = options;
    
    try {
      const response = await fetch({ url, timeout });
      
      if (!response.success) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      
      // Write to file (simplified - in real implementation you'd want streaming)
      const fs = await import('fs/promises');
      await fs.writeFile(destinationPath, response.data);
    } catch (error) {
      throw new Error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Uploads a file to a URL
   */
  static async uploadFile(
    url: string,
    filePath: string,
    options: {
      fieldName?: string;
      additionalFields?: Record<string, string>;
      headers?: Record<string, string>;
      timeout?: number;
    } = {}
  ): Promise<NetworkResponse> {
    const { fieldName = 'file', additionalFields = {}, headers = {}, timeout = 30000 } = options;
    
    try {
      const fs = await import('fs/promises');
      const fileContent = await fs.readFile(filePath);
      
      // Create form data (simplified)
      const formData = new FormData();
      formData.append(fieldName, new Blob([fileContent]));
      
      Object.entries(additionalFields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      
      return await fetch({
        url,
        method: 'POST',
        body: formData,
        headers: {
          ...headers
          // Note: Don't set Content-Type for FormData, let the browser set it
        },
        timeout
      });
    } catch (error) {
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Performs a health check on multiple URLs
   */
  static async healthCheck(urls: string[], timeout: number = 5000): Promise<Array<{
    url: string;
    status: 'healthy' | 'unhealthy' | 'timeout';
    responseTime: number;
    statusCode?: number;
  }>> {
    const results = await Promise.allSettled(
      urls.map(async (url) => {
        const startTime = performance.now();
        
        try {
          const response = await fetch({ url, method: 'HEAD', timeout });
          const responseTime = performance.now() - startTime;
          
          return {
            url,
            status: response.success ? 'healthy' as const : 'unhealthy' as const,
            responseTime,
            statusCode: response.status
          };
        } catch {
          const responseTime = performance.now() - startTime;
          return {
            url,
            status: responseTime >= timeout ? 'timeout' as const : 'unhealthy' as const,
            responseTime
          };
        }
      })
    );
    
    return results.map((result, index) => 
      result.status === 'fulfilled' 
        ? result.value 
        : {
            url: urls[index]!,
            status: 'unhealthy' as const,
            responseTime: timeout
          }
    );
  }
  
  /**
   * Validates if a string is a valid URL
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Parses a URL into its components
   */
  static parseUrl(url: string): {
    protocol: string;
    hostname: string;
    port: string;
    pathname: string;
    search: string;
    hash: string;
    origin: string;
  } | null {
    try {
      const parsed = new URL(url);
      return {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port,
        pathname: parsed.pathname,
        search: parsed.search,
        hash: parsed.hash,
        origin: parsed.origin
      };
    } catch {
      return null;
    }
  }
}

/**
 * Rate limiter for API requests
 */
export class RateLimiter {
  private requests: number[] = [];
  private limit: number;
  private window: number;
  
  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.window = windowMs;
  }
  
  /**
   * Checks if a request can be made
   */
  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.window);
    
    return this.requests.length < this.limit;
  }
  
  /**
   * Records a request
   */
  recordRequest(): void {
    this.requests.push(Date.now());
  }
  
  /**
   * Gets time until next request is allowed
   */
  getTimeUntilReset(): number {
    if (this.requests.length < this.limit) {
      return 0;
    }
    
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.window - (Date.now() - oldestRequest));
  }
  
  /**
   * Waits until a request can be made
   */
  async waitForSlot(): Promise<void> {
    const waitTime = this.getTimeUntilReset();
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

/**
 * HTTP client with built-in rate limiting and retries
 */
export class RobustHttpClient {
  private rateLimiter: RateLimiter;
  private maxRetries: number;
  private retryDelay: number;
  
  constructor(options: {
    rateLimit?: { limit: number; windowMs: number };
    maxRetries?: number;
    retryDelay?: number;
  } = {}) {
    const { rateLimit = { limit: 10, windowMs: 60000 }, maxRetries = 3, retryDelay = 1000 } = options;
    
    this.rateLimiter = new RateLimiter(rateLimit.limit, rateLimit.windowMs);
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }
  
  /**
   * Makes a request with rate limiting and retries
   */
  async request(request: NetworkRequest): Promise<NetworkResponse> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        // Wait for rate limit slot
        await this.rateLimiter.waitForSlot();
        
        // Record the request
        this.rateLimiter.recordRequest();
        
        // Make the request
        const response = await fetch(request);
        
        // Don't retry on successful responses or client errors (4xx)
        if (response.success || (response.status >= 400 && response.status < 500)) {
          return response;
        }
        
        // Server error - retry
        lastError = new Error(`Server error: ${response.status} ${response.statusText}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError || new Error('Request failed after all retries');
  }
}

/**
 * Network performance monitor
 */
export class NetworkMonitor {
  private metrics: Array<{
    url: string;
    timestamp: Date;
    responseTime: number;
    success: boolean;
    size: number;
  }> = [];
  
  private maxMetrics = 1000;
  
  /**
   * Records a network request metric
   */
  recordRequest(url: string, responseTime: number, success: boolean, size: number = 0): void {
    this.metrics.unshift({
      url,
      timestamp: new Date(),
      responseTime,
      success,
      size
    });
    
    // Limit metrics array size
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.splice(this.maxMetrics);
    }
  }
  
  /**
   * Gets network performance statistics
   */
  getStats(timeframe?: number): {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    totalBytesTransferred: number;
    requestsPerMinute: number;
    slowestRequests: Array<{ url: string; responseTime: number; timestamp: Date }>;
  } {
    const now = Date.now();
    const cutoff = timeframe ? now - timeframe : 0;
    
    const relevantMetrics = this.metrics.filter(metric => 
      metric.timestamp.getTime() > cutoff
    );
    
    if (relevantMetrics.length === 0) {
      return {
        totalRequests: 0,
        successRate: 0,
        averageResponseTime: 0,
        totalBytesTransferred: 0,
        requestsPerMinute: 0,
        slowestRequests: []
      };
    }
    
    const successfulRequests = relevantMetrics.filter(m => m.success).length;
    const totalResponseTime = relevantMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    const totalBytes = relevantMetrics.reduce((sum, m) => sum + m.size, 0);
    
    const oldestMetric = relevantMetrics[relevantMetrics.length - 1];
    const timeSpanMinutes = oldestMetric 
      ? (now - oldestMetric.timestamp.getTime()) / (1000 * 60)
      : 1;
    
    const slowestRequests = [...relevantMetrics]
      .sort((a, b) => b.responseTime - a.responseTime)
      .slice(0, 10)
      .map(m => ({
        url: m.url,
        responseTime: m.responseTime,
        timestamp: m.timestamp
      }));
    
    return {
      totalRequests: relevantMetrics.length,
      successRate: (successfulRequests / relevantMetrics.length) * 100,
      averageResponseTime: totalResponseTime / relevantMetrics.length,
      totalBytesTransferred: totalBytes,
      requestsPerMinute: relevantMetrics.length / Math.max(timeSpanMinutes, 1),
      slowestRequests
    };
  }
  
  /**
   * Clears all metrics
   */
  clear(): void {
    this.metrics.length = 0;
  }
}

/**
 * Creates a monitored HTTP client
 */
export function createMonitoredClient(): {
  client: RobustHttpClient;
  monitor: NetworkMonitor;
  request: (request: NetworkRequest) => Promise<NetworkResponse>;
} {
  const client = new RobustHttpClient();
  const monitor = new NetworkMonitor();
  
  const monitoredRequest = async (request: NetworkRequest): Promise<NetworkResponse> => {
    const startTime = performance.now();
    
    try {
      const response = await client.request(request);
      const responseTime = performance.now() - startTime;
      const size = response.data.length || 0;
      
      monitor.recordRequest(request.url, responseTime, response.success, size);
      
      return response;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      monitor.recordRequest(request.url, responseTime, false, 0);
      throw error;
    }
  };
  
  return {
    client,
    monitor,
    request: monitoredRequest
  };
}
