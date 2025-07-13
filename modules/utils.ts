// Use Bun's optimized crypto APIs
import { randomBytes, createHash, createHmac } from 'crypto';
import { promisify } from 'util';

/**
 * Generates a random UUID v4 using Bun's crypto.randomUUID for better performance
 */
export function generateUUID(): string {
  // Use Bun's built-in crypto.randomUUID() for optimal performance
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback to custom implementation
  const bytes = randomBytes(16);
  
  // Set version (4) and variant bits
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  
  const hex = bytes.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-');
}

/**
 * Generates a random string of specified length using Bun's optimized crypto
 */
export function generateRandomString(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
  // Use Bun's crypto.getRandomValues for better performance when available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[array[i]! % charset.length];
    }
    return result;
  }
  
  // Fallback to Node.js crypto
  const bytes = randomBytes(length);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += charset[bytes[i]! % charset.length];
  }
  
  return result;
}

/**
 * Generates a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates a random float between min and max
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Shuffles an array in place using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j]!;
    result[j] = temp!;
  }
  
  return result;
}

/**
 * Picks random elements from an array
 */
export function pickRandom<T>(array: T[], count: number = 1): T[] {
  if (count >= array.length) {
    return shuffleArray(array);
  }
  
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
}

/**
 * Calculates MD5 hash of a string
 */
export function md5(input: string): string {
  return createHash('md5').update(input).digest('hex');
}

/**
 * Calculates SHA1 hash of a string
 */
export function sha1(input: string): string {
  return createHash('sha1').update(input).digest('hex');
}

/**
 * Calculates SHA256 hash of a string using Bun's optimized crypto
 */
export function sha256(input: string): string {
  // Use Web Crypto API when available (Bun supports this)
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    // For synchronous operation, fallback to Node.js crypto for now
    // Web Crypto API is async, but we want to maintain sync interface
    return createHash('sha256').update(input).digest('hex');
  }
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Calculates SHA256 hash of a string asynchronously using Bun's Web Crypto API
 */
export async function sha256Async(input: string): Promise<string> {
  // Use Bun's Web Crypto API for optimal performance
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback to Node.js crypto
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Calculates SHA512 hash of a string
 */
export function sha512(input: string): string {
  return createHash('sha512').update(input).digest('hex');
}

/**
 * Calculates HMAC of a string with a secret key
 */
export function hmac(algorithm: string, key: string, input: string): string {
  return createHmac(algorithm, key).update(input).digest('hex');
}

/**
 * Encodes a string to Base64 using optimized method
 */
export function base64Encode(input: string): string {
  // Use Bun's built-in btoa when available for better performance
  if (typeof btoa !== 'undefined') {
    return btoa(input);
  }
  return Buffer.from(input, 'utf8').toString('base64');
}

/**
 * Decodes a Base64 string using optimized method
 */
export function base64Decode(input: string): string {
  // Use Bun's built-in atob when available for better performance
  if (typeof atob !== 'undefined') {
    return atob(input);
  }
  return Buffer.from(input, 'base64').toString('utf8');
}

/**
 * URL encodes a string
 */
export function urlEncode(input: string): string {
  return encodeURIComponent(input);
}

/**
 * URL decodes a string
 */
export function urlDecode(input: string): string {
  return decodeURIComponent(input);
}

/**
 * Escapes HTML entities in a string
 */
export function escapeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };
  
  return input.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Unescapes HTML entities in a string
 */
export function unescapeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&#x2F;': '/'
  };
  
  return input.replace(/&(amp|lt|gt|quot|#39|#x2F);/g, (match) => htmlEntities[match] || match);
}

/**
 * Validates an email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates an IP address (IPv4 or IPv6)
 */
export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Formats bytes to human readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formats a duration in milliseconds to human readable string
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else if (seconds > 0) {
    return `${seconds}s`;
  } else {
    return `${ms}ms`;
  }
}

/**
 * Debounces a function call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | undefined;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Throttles a function call
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= interval) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Creates a retry function with exponential backoff
 */
export function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2
  } = options;
  
  return new Promise(async (resolve, reject) => {
    let attempt = 1;
    let delay = initialDelay;
    
    while (attempt <= maxAttempts) {
      try {
        const result = await fn();
        resolve(result);
        return;
      } catch (error) {
        if (attempt === maxAttempts) {
          reject(error);
          return;
        }
        
        await sleep(delay);
        delay = Math.min(delay * backoffFactor, maxDelay);
        attempt++;
      }
    }
  });
}

/**
 * Creates a sleep/delay function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a timeout promise that rejects after a specified time
 */
export function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
    })
  ]);
}

/**
 * Deep clones an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    Object.keys(obj).forEach(key => {
      (cloned as any)[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  
  return obj;
}

/**
 * Deep merges objects
 */
export function deepMerge<T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T {
  if (!sources.length) return target;
  
  const source = sources.shift();
  if (!source) return target;
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key] as any, source[key] as any);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }
  
  return deepMerge(target, ...sources);
}

/**
 * Checks if a value is an object
 */
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Flattens a nested object
 */
export function flattenObject(obj: Record<string, any>, prefix: string = '', separator: string = '.'): Record<string, any> {
  const flattened: Record<string, any> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}${separator}${key}` : key;
      
      if (isObject(obj[key]) && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], newKey, separator));
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }
  
  return flattened;
}

/**
 * Unflatten a flattened object
 */
export function unflattenObject(obj: Record<string, any>, separator: string = '.'): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const keys = key.split(separator);
      let current = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i]!;
        if (!(k in current)) {
          current[k] = {};
        }
        current = current[k];
      }
      
      const lastKey = keys[keys.length - 1]!;
      current[lastKey] = obj[key];
    }
  }
  
  return result;
}

/**
 * Chunks an array into smaller arrays of specified size
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  
  return chunks;
}

/**
 * Groups array elements by a key function
 */
export function groupBy<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

/**
 * Removes duplicates from an array
 */
export function unique<T>(array: T[], keyFn?: (item: T) => any): T[] {
  if (!keyFn) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Creates a range of numbers
 */
export function range(start: number, end?: number, step: number = 1): number[] {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  
  const result: number[] = [];
  
  if (step > 0) {
    for (let i = start; i < end; i += step) {
      result.push(i);
    }
  } else {
    for (let i = start; i > end; i += step) {
      result.push(i);
    }
  }
  
  return result;
}

/**
 * Gets a nested property from an object using dot notation
 */
export function get(obj: any, path: string, defaultValue?: any): any {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
}

/**
 * Sets a nested property in an object using dot notation
 */
export function set(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]!;
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  const lastKey = keys[keys.length - 1]!;
  current[lastKey] = value;
}

/**
 * Advanced utility functions
 */

/**
 * Circuit breaker pattern implementation
 */
export class CircuitBreaker<T> {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private fn: () => Promise<T>,
    private options: {
      failureThreshold?: number;
      timeout?: number;
      resetTimeout?: number;
    } = {}
  ) {}
  
  async execute(): Promise<T> {
    const { failureThreshold = 5, timeout = 60000, resetTimeout = 30000 } = this.options;
    
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await Promise.race([
        this.fn(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Operation timeout')), timeout)
        )
      ]);
      
      // Reset on success
      this.failures = 0;
      this.state = 'closed';
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailureTime = Date.now();
      
      if (this.failures >= failureThreshold) {
        this.state = 'open';
      }
      
      throw error;
    }
  }
  
  getState(): { state: string; failures: number; lastFailureTime: number } {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime
    };
  }
  
  reset(): void {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'closed';
  }
}

/**
 * Creates a circuit breaker
 */
export function createCircuitBreaker<T>(
  fn: () => Promise<T>,
  options?: {
    failureThreshold?: number;
    timeout?: number;
    resetTimeout?: number;
  }
): CircuitBreaker<T> {
  return new CircuitBreaker(fn, options);
}

/**
 * Memoization decorator with TTL support
 */
export function memoize<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  options: {
    ttl?: number; // Time to live in milliseconds
    maxSize?: number; // Maximum cache size
    keyGenerator?: (...args: TArgs) => string;
  } = {}
): (...args: TArgs) => TReturn {
  const { ttl, maxSize = 100, keyGenerator = (...args) => JSON.stringify(args) } = options;
  
  const cache = new Map<string, { value: TReturn; timestamp: number }>();
  
  return (...args: TArgs): TReturn => {
    const key = keyGenerator(...args);
    const now = Date.now();
    
    // Check if cached value exists and is not expired
    const cached = cache.get(key);
    if (cached && (!ttl || now - cached.timestamp < ttl)) {
      return cached.value;
    }
    
    // Compute new value
    const value = fn(...args);
    
    // Store in cache
    cache.set(key, { value, timestamp: now });
    
    // Evict oldest entries if cache is too large
    if (cache.size > maxSize) {
      const entries = Array.from(cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      for (let i = 0; i < entries.length - maxSize; i++) {
        cache.delete(entries[i]![0]);
      }
    }
    
    return value;
  };
}

/**
 * Lazy initialization utility
 */
export class Lazy<T> {
  private initialized = false;
  private value: T | undefined;
  
  constructor(private factory: () => T) {}
  
  get(): T {
    if (!this.initialized) {
      this.value = this.factory();
      this.initialized = true;
    }
    return this.value as T;
  }
  
  isInitialized(): boolean {
    return this.initialized;
  }
  
  reset(): void {
    this.initialized = false;
    this.value = undefined;
  }
}

/**
 * Creates a lazy value
 */
export function lazy<T>(factory: () => T): Lazy<T> {
  return new Lazy(factory);
}

/**
 * Event emitter utility
 */
export class EventEmitter<TEvents extends Record<string, any>> {
  private listeners = new Map<keyof TEvents, Array<(data: any) => void>>();
  
  on<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }
  
  off<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
  
  emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }
  
  once<K extends keyof TEvents>(event: K, listener: (data: TEvents[K]) => void): void {
    const onceListener = (data: TEvents[K]) => {
      listener(data);
      this.off(event, onceListener);
    };
    this.on(event, onceListener);
  }
  
  removeAllListeners<K extends keyof TEvents>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
  
  listenerCount<K extends keyof TEvents>(event: K): number {
    return this.listeners.get(event)?.length || 0;
  }
}

/**
 * Creates a typed event emitter
 */
export function createEventEmitter<TEvents extends Record<string, any>>(): EventEmitter<TEvents> {
  return new EventEmitter<TEvents>();
}

/**
 * URL parameter utilities
 */
export const urlParams = {
  /**
   * Parses URL parameters from a query string
   */
  parse(queryString: string): Record<string, string | string[]> {
    const params: Record<string, string | string[]> = {};
    const searchParams = new URLSearchParams(queryString.startsWith('?') ? queryString.slice(1) : queryString);
    
    for (const [key, value] of searchParams.entries()) {
      if (params[key]) {
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    }
    
    return params;
  },
  
  /**
   * Stringifies parameters to a query string
   */
  stringify(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else if (value !== null && value !== undefined) {
        searchParams.set(key, String(value));
      }
    });
    
    return searchParams.toString();
  }
};

/**
 * Color utilities
 */
export const colors = {
  /**
   * Converts hex color to RGB
   */
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1]!, 16),
      g: parseInt(result[2]!, 16),
      b: parseInt(result[3]!, 16)
    } : null;
  },
  
  /**
   * Converts RGB to hex color
   */
  rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  },
  
  /**
   * Generates a random hex color
   */
  random(): string {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  },
  
  /**
   * Lighten/darken a hex color
   */
  adjust(hex: string, percent: number): string {
    const rgb = colors.hexToRgb(hex);
    if (!rgb) return hex;
    
    const adjust = (value: number) => {
      const adjusted = value + (value * percent / 100);
      return Math.max(0, Math.min(255, Math.round(adjusted)));
    };
    
    return colors.rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
  }
};

/**
 * Validation utilities
 */
export const validate = {
  /**
   * Validates an email address
   */
  email(email: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  },
  
  /**
   * Validates a URL
   */
  url(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  /**
   * Validates a phone number (basic)
   */
  phone(phone: string): boolean {
    const pattern = /^\+?[\d\s\-\(\)]{10,}$/;
    return pattern.test(phone);
  },
  
  /**
   * Validates a credit card number using Luhn algorithm
   */
  creditCard(number: string): boolean {
    const digits = number.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]!);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  },
  
  /**
   * Validates a strong password
   */
  password(password: string, options: {
    minLength?: number;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
  } = {}): { valid: boolean; errors: string[] } {
    const {
      minLength = 8,
      requireNumbers = true,
      requireSpecialChars = true,
      requireUppercase = true,
      requireLowercase = true
    } = options;
    
    const errors: string[] = [];
    
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    
    if (requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};

/**
 * Performance utilities
 */
export const performance = {
  /**
   * Measures execution time of a function
   */
  measure<T>(fn: () => T, label?: string): T {
    const start = Date.now();
    const result = fn();
    const duration = Date.now() - start;
    
    if (label) {
      console.log(`${label}: ${duration}ms`);
    }
    
    return result;
  },
  
  /**
   * Measures execution time of an async function
   */
  async measureAsync<T>(fn: () => Promise<T>, label?: string): Promise<T> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    
    if (label) {
      console.log(`${label}: ${duration}ms`);
    }
    
    return result;
  },
  
  /**
   * Creates a simple benchmark
   */
  benchmark(fn: () => void, iterations: number = 1000): {
    averageTime: number;
    totalTime: number;
    iterations: number;
  } {
    const start = Date.now();
    
    for (let i = 0; i < iterations; i++) {
      fn();
    }
    
    const totalTime = Date.now() - start;
    
    return {
      averageTime: totalTime / iterations,
      totalTime,
      iterations
    };
  }
};

/**
 * Weighted array utilities
 */
export const weightedArray = {
  /**
   * Picks a random element from an array based on weights
   */
  pickWeighted<T>(items: T[], weights: number[]): T | null {
    if (items.length !== weights.length || items.length === 0) {
      return null;
    }
    
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight <= 0) return null;
    
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i]!;
      if (random <= 0) {
        return items[i]!;
      }
    }
    
    return items[items.length - 1]!;
  },
  
  /**
   * Picks multiple random elements from an array based on weights (with replacement)
   */
  pickMultipleWeighted<T>(items: T[], weights: number[], count: number): T[] {
    const result: T[] = [];
    for (let i = 0; i < count; i++) {
      const picked = weightedArray.pickWeighted(items, weights);
      if (picked !== null) {
        result.push(picked);
      }
    }
    return result;
  },
  
  /**
   * Creates a weighted distribution from items and their weights
   */
  createDistribution<T>(items: Array<{ item: T; weight: number }>): {
    pick(): T | null;
    pickMultiple(count: number): T[];
    getItems(): T[];
    getWeights(): number[];
  } {
    const itemArray = items.map(x => x.item);
    const weightArray = items.map(x => x.weight);
    
    return {
      pick: () => weightedArray.pickWeighted(itemArray, weightArray),
      pickMultiple: (count: number) => weightedArray.pickMultipleWeighted(itemArray, weightArray, count),
      getItems: () => [...itemArray],
      getWeights: () => [...weightArray]
    };
  }
};

/**
 * Math utilities
 */
export const math = {
  /**
   * Clamps a number between min and max
   */
  clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  },
  
  /**
   * Linear interpolation between two values
   */
  lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  },
  
  /**
   * Maps a value from one range to another
   */
  map(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number {
    const normalized = (value - fromMin) / (fromMax - fromMin);
    return toMin + normalized * (toMax - toMin);
  },
  
  /**
   * Calculates the distance between two points
   */
  distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  },
  
  /**
   * Converts degrees to radians
   */
  degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  },
  
  /**
   * Converts radians to degrees
   */
  radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  },
  
  /**
   * Calculates the greatest common divisor
   */
  gcd(a: number, b: number): number {
    while (b !== 0) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return Math.abs(a);
  },
  
  /**
   * Calculates the least common multiple
   */
  lcm(a: number, b: number): number {
    return Math.abs(a * b) / math.gcd(a, b);
  },
  
  /**
   * Checks if a number is prime
   */
  isPrime(n: number): boolean {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  },
  
  /**
   * Calculates factorial
   */
  factorial(n: number): number {
    if (n < 0) throw new Error('Factorial is not defined for negative numbers');
    if (n === 0 || n === 1) return 1;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  },
  
  /**
   * Calculates Fibonacci number at position n
   */
  fibonacci(n: number): number {
    if (n < 0) throw new Error('Fibonacci is not defined for negative numbers');
    if (n <= 1) return n;
    
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  },
  
  /**
   * Rounds to specified decimal places
   */
  round(value: number, decimals: number = 0): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  },
  
  /**
   * Calculates average of numbers
   */
  average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  },
  
  /**
   * Calculates median of numbers
   */
  median(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    return sorted.length % 2 === 0
      ? (sorted[mid - 1]! + sorted[mid]!) / 2
      : sorted[mid]!;
  },
  
  /**
   * Calculates mode of numbers
   */
  mode(numbers: number[]): number[] {
    if (numbers.length === 0) return [];
    
    const frequency: Record<number, number> = {};
    let maxFreq = 0;
    
    for (const num of numbers) {
      frequency[num] = (frequency[num] || 0) + 1;
      maxFreq = Math.max(maxFreq, frequency[num]!);
    }
    
    return Object.keys(frequency)
      .filter(key => frequency[Number(key)] === maxFreq)
      .map(Number);
  },
  
  /**
   * Calculates standard deviation
   */
  standardDeviation(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    
    const mean = math.average(numbers);
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    const avgSquaredDiff = math.average(squaredDiffs);
    
    return Math.sqrt(avgSquaredDiff);
  }
};

/**
 * Date utilities
 */
export const dateUtils = {
  /**
   * Formats a date to ISO string with timezone
   */
  toISOStringWithTimezone(date: Date): string {
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? '+' : '-';
    const pad = (num: number) => String(num).padStart(2, '0');
    
    return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds()) +
      sign + pad(Math.floor(Math.abs(offset) / 60)) +
      ':' + pad(Math.abs(offset) % 60);
  },
  
  /**
   * Adds days to a date
   */
  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
  
  /**
   * Adds months to a date
   */
  addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  },
  
  /**
   * Adds years to a date
   */
  addYears(date: Date, years: number): Date {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  },
  
  /**
   * Gets the difference between two dates in various units
   */
  diff(date1: Date, date2: Date, unit: 'ms' | 'seconds' | 'minutes' | 'hours' | 'days' = 'ms'): number {
    const diffMs = Math.abs(date1.getTime() - date2.getTime());
    
    switch (unit) {
      case 'seconds': return diffMs / 1000;
      case 'minutes': return diffMs / (1000 * 60);
      case 'hours': return diffMs / (1000 * 60 * 60);
      case 'days': return diffMs / (1000 * 60 * 60 * 24);
      default: return diffMs;
    }
  },
  
  /**
   * Checks if a year is a leap year
   */
  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  },
  
  /**
   * Gets the number of days in a month
   */
  getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  },
  
  /**
   * Formats a date relative to now (e.g., "2 hours ago")
   */
  timeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    if (diffMs < 0) return 'in the future';
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    if (diffSeconds > 0) return `${diffSeconds} second${diffSeconds > 1 ? 's' : ''} ago`;
    
    return 'just now';
  },
  
  /**
   * Formats a date in various common formats
   */
  format(date: Date, format: string): string {
    const pad = (num: number) => String(num).padStart(2, '0');
    
    const replacements: Record<string, string> = {
      'YYYY': String(date.getFullYear()),
      'YY': String(date.getFullYear()).slice(-2),
      'MM': pad(date.getMonth() + 1),
      'M': String(date.getMonth() + 1),
      'DD': pad(date.getDate()),
      'D': String(date.getDate()),
      'HH': pad(date.getHours()),
      'H': String(date.getHours()),
      'mm': pad(date.getMinutes()),
      'm': String(date.getMinutes()),
      'ss': pad(date.getSeconds()),
      's': String(date.getSeconds())
    };
    
    let result = format;
    Object.entries(replacements).forEach(([pattern, replacement]) => {
      result = result.replace(new RegExp(pattern, 'g'), replacement);
    });
    
    return result;
  }
};

/**
 * String manipulation utilities
 */
export const stringUtils = {
  /**
   * Capitalizes the first letter of a string
   */
  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  
  /**
   * Converts string to title case
   */
  titleCase(str: string): string {
    return str.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  },
  
  /**
   * Converts string to camelCase
   */
  camelCase(str: string): string {
    return str.toLowerCase()
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
  },
  
  /**
   * Converts string to snake_case
   */
  snakeCase(str: string): string {
    return str.replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('_');
  },
  
  /**
   * Converts string to kebab-case
   */
  kebabCase(str: string): string {
    return str.replace(/\W+/g, ' ')
      .split(/ |\B(?=[A-Z])/)
      .map(word => word.toLowerCase())
      .join('-');
  },
  
  /**
   * Truncates a string to a specified length with ellipsis
   */
  truncate(str: string, maxLength: number, suffix: string = '...'): string {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
  },
  
  /**
   * Removes extra whitespace and normalizes spaces
   */
  normalize(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
  },
  
  /**
   * Counts occurrences of a substring
   */
  count(str: string, substring: string): number {
    if (!substring) return 0;
    let count = 0;
    let index = 0;
    
    while ((index = str.indexOf(substring, index)) !== -1) {
      count++;
      index += substring.length;
    }
    
    return count;
  },
  
  /**
   * Reverses a string
   */
  reverse(str: string): string {
    return str.split('').reverse().join('');
  },
  
  /**
   * Checks if a string is a palindrome
   */
  isPalindrome(str: string): boolean {
    const normalized = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalized === stringUtils.reverse(normalized);
  },
  
  /**
   * Generates a slug from a string
   */
  slug(str: string): string {
    return str.toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
  
  /**
   * Extracts words from a string
   */
  words(str: string): string[] {
    return str.match(/\b\w+\b/g) || [];
  },
  
  /**
   * Word wrap a string to specified width
   */
  wordWrap(str: string, width: number): string {
    if (width <= 0) return str;
    
    const words = str.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    return lines.join('\n');
  }
};

/**
 * Advanced array utilities
 */
export const arrayUtils = {
  /**
   * Creates a matrix (2D array) filled with a value
   */
  createMatrix<T>(rows: number, cols: number, fill: T): T[][] {
    return Array(rows).fill(null).map(() => Array(cols).fill(fill));
  },
  
  /**
   * Transposes a matrix
   */
  transpose<T>(matrix: T[][]): T[][] {
    if (matrix.length === 0) return [];
    return matrix[0]!.map((_, colIndex) => matrix.map(row => row[colIndex]!));
  },
  
  /**
   * Flattens a nested array to specified depth
   */
  flattenDeep<T>(arr: any[], depth: number = Infinity): T[] {
    return depth > 0 ? arr.reduce((acc, val) => 
      acc.concat(Array.isArray(val) ? arrayUtils.flattenDeep(val, depth - 1) : val), []
    ) : arr.slice();
  },
  
  /**
   * Creates intersection of multiple arrays
   */
  intersection<T>(...arrays: T[][]): T[] {
    if (arrays.length === 0) return [];
    if (arrays.length === 1) return [...arrays[0]!];
    
    return arrays.reduce((acc, curr) => 
      acc.filter(item => curr.includes(item))
    );
  },
  
  /**
   * Creates union of multiple arrays (removes duplicates)
   */
  union<T>(...arrays: T[][]): T[] {
    const combined = arrays.flat();
    return [...new Set(combined)];
  },
  
  /**
   * Creates difference between arrays (items in first but not in others)
   */
  difference<T>(first: T[], ...others: T[][]): T[] {
    const othersFlat = others.flat();
    return first.filter(item => !othersFlat.includes(item));
  },
  
  /**
   * Partitions array into two arrays based on predicate
   */
  partition<T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] {
    const truthy: T[] = [];
    const falsy: T[] = [];
    
    for (const item of array) {
      if (predicate(item)) {
        truthy.push(item);
      } else {
        falsy.push(item);
      }
    }
    
    return [truthy, falsy];
  },
  
  /**
   * Creates all possible combinations of array elements
   */
  combinations<T>(array: T[], size: number): T[][] {
    if (size === 0) return [[]];
    if (size > array.length) return [];
    
    const result: T[][] = [];
    
    function generateCombinations(start: number, current: T[]) {
      if (current.length === size) {
        result.push([...current]);
        return;
      }
      
      for (let i = start; i < array.length; i++) {
        current.push(array[i]!);
        generateCombinations(i + 1, current);
        current.pop();
      }
    }
    
    generateCombinations(0, []);
    return result;
  },
  
  /**
   * Creates all permutations of array elements
   */
  permutations<T>(array: T[]): T[][] {
    if (array.length === 0) return [[]];
    if (array.length === 1) return [array];
    
    const result: T[][] = [];
    
    for (let i = 0; i < array.length; i++) {
      const current = array[i]!;
      const remaining = array.slice(0, i).concat(array.slice(i + 1));
      const perms = arrayUtils.permutations(remaining);
      
      for (const perm of perms) {
        result.push([current, ...perm]);
      }
    }
    
    return result;
  },
  
  /**
   * Rotates array elements by n positions
   */
  rotate<T>(array: T[], n: number): T[] {
    if (array.length === 0) return array;
    
    const len = array.length;
    const rotateBy = ((n % len) + len) % len;
    
    return array.slice(rotateBy).concat(array.slice(0, rotateBy));
  },
  
  /**
   * Finds the longest increasing subsequence
   */
  longestIncreasingSubsequence(numbers: number[]): number[] {
    if (numbers.length === 0) return [];
    
    const dp: number[] = Array(numbers.length).fill(1);
    const prev: number[] = Array(numbers.length).fill(-1);
    
    for (let i = 1; i < numbers.length; i++) {
      for (let j = 0; j < i; j++) {
        if (numbers[j]! < numbers[i]! && dp[j]! + 1 > dp[i]!) {
          dp[i] = dp[j]! + 1;
          prev[i] = j;
        }
      }
    }
    
    // Find the index with maximum length
    let maxLength = Math.max(...dp);
    let maxIndex = dp.indexOf(maxLength);
    
    // Reconstruct the sequence
    const result: number[] = [];
    let current = maxIndex;
    
    while (current !== -1) {
      result.unshift(numbers[current]!);
      current = prev[current]!;
    }
    
    return result;
  }
};

/**
 * Object utilities for common operations
 */
export const objectUtils = {
  /**
   * Picks specified keys from an object
   */
  pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }
    return result;
  },
  
  /**
   * Omits specified keys from an object
   */
  omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const result = { ...obj };
    for (const key of keys) {
      delete result[key];
    }
    return result;
  },
  
  /**
   * Inverts an object (keys become values, values become keys)
   */
  invert<T extends Record<string | number, string | number>>(obj: T): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[String(value)] = key;
    }
    return result;
  },
  
  /**
   * Maps over object values while keeping keys
   */
  mapValues<T, U>(obj: Record<string, T>, mapper: (value: T, key: string) => U): Record<string, U> {
    const result: Record<string, U> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = mapper(value, key);
    }
    return result;
  },
  
  /**
   * Maps over object keys while keeping values
   */
  mapKeys<T>(obj: Record<string, T>, mapper: (key: string, value: T) => string): Record<string, T> {
    const result: Record<string, T> = {};
    for (const [key, value] of Object.entries(obj)) {
      const newKey = mapper(key, value);
      result[newKey] = value;
    }
    return result;
  },
  
  /**
   * Checks if object has nested property
   */
  hasPath(obj: any, path: string): boolean {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current == null || typeof current !== 'object' || !(key in current)) {
        return false;
      }
      current = current[key];
    }
    
    return true;
  },
  
  /**
   * Gets all paths (dot notation) from an object
   */
  getPaths(obj: Record<string, any>, prefix: string = ''): string[] {
    const paths: string[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      
      if (isObject(value) && !Array.isArray(value)) {
        paths.push(...objectUtils.getPaths(value, currentPath));
      } else {
        paths.push(currentPath);
      }
    }
    
    return paths;
  },
  
  /**
   * Merges objects with custom merge function
   */
  mergeWith<T>(
    target: T,
    source: Partial<T>,
    customizer: (targetValue: any, sourceValue: any, key: string) => any
  ): T {
    const result = { ...target };
    
    for (const [key, sourceValue] of Object.entries(source)) {
      const targetValue = (result as any)[key];
      const customResult = customizer(targetValue, sourceValue, key);
      
      if (customResult !== undefined) {
        (result as any)[key] = customResult;
      } else {
        (result as any)[key] = sourceValue;
      }
    }
    
    return result;
  }
};
