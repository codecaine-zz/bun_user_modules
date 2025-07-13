# 📚 Bun User Modules - Complete API Documentation

> **Enterprise-grade system interaction APIs for Bun runtime** - A comprehensive toolkit inspired by NeutralinoJS with advanced functionality for production applications.

[![Bun](https://img.shields.io/badge/Bun-1.0+-000000?style=flat&logo=bun)](https://bun.sh/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [📋 Core Modules](#-core-modules)
  - [🔧 Utils Module](#-utils-module)
  - [💾 Storage Module](#-storage-module)
  - [🏗️ App Module](#️-app-module)
- [🟡 System Modules](#-system-modules)
  - [📁 Filesystem Module](#-filesystem-module)
  - [🌐 Network Module](#-network-module)
  - [💻 Computer Module](#-computer-module)
  - [🐛 Debug Module](#-debug-module)
  - [📋 Clipboard Module](#-clipboard-module)
- [🔴 Advanced Modules](#-advanced-modules)
  - [⚡ Events Module](#-events-module)
  - [🖥️ OS Module](#️-os-module)
- [📦 Type Definitions](#-type-definitions)
- [🎯 Examples](#-examples)

---

## 🚀 Quick Start

```typescript
// Import all modules
import * as BunUserModules from './bun_user_modules';

// Or import specific modules
import { utils, storage, events } from './bun_user_modules';

// Use the APIs
const uuid = utils.generateUUID();
await storage.setData('user-id', uuid);
events.emit('user:created', { id: uuid });
```

---

## 📋 Core Modules

### 🔧 Utils Module

**Purpose**: Comprehensive utility functions for everyday development tasks.

#### Namespaces

##### `weightedArray` - Probability-based Selection
```typescript
// Functions
weightedArray.pickWeighted<T>(items: T[], weights: number[]): T
weightedArray.createDistribution<T>(items: Array<{item: T, weight: number}>): Distribution<T>

// Usage
const items = ['common', 'rare', 'legendary'];
const weights = [70, 25, 5];
const picked = weightedArray.pickWeighted(items, weights);

const distribution = weightedArray.createDistribution([
  { item: 'sword', weight: 10 },
  { item: 'potion', weight: 50 }
]);
const loot = distribution.pick();
```

##### `math` - Advanced Mathematical Operations
```typescript
// Basic Operations
math.clamp(value: number, min: number, max: number): number
math.lerp(start: number, end: number, t: number): number
math.map(value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number
math.distance(x1: number, y1: number, x2: number, y2: number): number

// Statistics
math.average(numbers: number[]): number
math.median(numbers: number[]): number
math.standardDeviation(numbers: number[]): number
math.variance(numbers: number[]): number

// Number Theory
math.isPrime(n: number): boolean
math.factorial(n: number): number
math.fibonacci(n: number): number
math.gcd(a: number, b: number): number
math.lcm(a: number, b: number): number

// Usage
const clamped = math.clamp(150, 0, 100); // 100
const distance = math.distance(0, 0, 3, 4); // 5
const isPrime = math.isPrime(17); // true
```

##### `stringUtils` - String Manipulation
```typescript
// Case Conversion
stringUtils.camelCase(str: string): string
stringUtils.snakeCase(str: string): string
stringUtils.kebabCase(str: string): string
stringUtils.titleCase(str: string): string
stringUtils.slug(str: string): string

// Text Processing
stringUtils.truncate(str: string, length: number, suffix?: string): string
stringUtils.reverse(str: string): string
stringUtils.wordWrap(str: string, width: number): string
stringUtils.removeAccents(str: string): string

// Usage
const camelCase = stringUtils.camelCase('hello-world'); // "helloWorld"
const slug = stringUtils.slug('Hello World!'); // "hello-world"
const truncated = stringUtils.truncate('Long text', 10, '...'); // "Long te..."
```

##### `arrayUtils` - Array Operations
```typescript
// Set Operations
arrayUtils.intersection<T>(arr1: T[], arr2: T[]): T[]
arrayUtils.union<T>(arr1: T[], arr2: T[]): T[]
arrayUtils.difference<T>(arr1: T[], arr2: T[]): T[]

// Matrix Operations
arrayUtils.transpose<T>(matrix: T[][]): T[][]
arrayUtils.flatten<T>(array: any[], depth?: number): T[]

// Algorithms
arrayUtils.chunk<T>(array: T[], size: number): T[][]
arrayUtils.unique<T>(array: T[]): T[]

// Usage
const intersection = arrayUtils.intersection([1, 2, 3], [2, 3, 4]); // [2, 3]
const flattened = arrayUtils.flatten([[1, 2], [3, [4, 5]]], 2); // [1, 2, 3, 4, 5]
```

##### `objectUtils` - Object Manipulation
```typescript
// Object Selection
objectUtils.pick<T>(obj: T, keys: (keyof T)[]): Partial<T>
objectUtils.omit<T>(obj: T, keys: (keyof T)[]): Partial<T>

// Object Transformation
objectUtils.invert(obj: Record<string, any>): Record<string, string>
objectUtils.mapValues<T, U>(obj: Record<string, T>, fn: (value: T) => U): Record<string, U>
objectUtils.hasPath(obj: any, path: string): boolean

// Usage
const picked = objectUtils.pick(user, ['name', 'email']);
const inverted = objectUtils.invert({ a: 1, b: 2 }); // { '1': 'a', '2': 'b' }
```

##### `dateUtils` - Date Manipulation
```typescript
// Date Arithmetic
dateUtils.addDays(date: Date, days: number): Date
dateUtils.addHours(date: Date, hours: number): Date
dateUtils.addMinutes(date: Date, minutes: number): Date
dateUtils.addYears(date: Date, years: number): Date

// Date Comparison
dateUtils.diff(date1: Date, date2: Date, unit: 'days' | 'hours' | 'minutes' | 'seconds'): number
dateUtils.isSameDay(date1: Date, date2: Date): boolean
dateUtils.isLeapYear(year: number): boolean

// Formatting
dateUtils.format(date: Date, format: string): string
dateUtils.timeAgo(date: Date): string

// Usage
const nextWeek = dateUtils.addDays(new Date(), 7);
const daysDiff = dateUtils.diff(date1, date2, 'days');
const formatted = dateUtils.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
```

##### `validate` - Data Validation
```typescript
// Format Validation
validate.email(email: string): boolean
validate.url(url: string): boolean
validate.ipAddress(ip: string): boolean
validate.phoneNumber(phone: string): boolean

// Password Validation
validate.password(password: string, options?: {
  minLength?: number;
  requireNumbers?: boolean;
  requireSpecialChars?: boolean;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
}): { valid: boolean; errors: string[] }

// Usage
const isValidEmail = validate.email('user@example.com'); // true
const passwordCheck = validate.password('MyPass123!', {
  minLength: 8,
  requireNumbers: true
});
```

##### `colors` - Color Utilities
```typescript
// Color Conversion
colors.hexToRgb(hex: string): { r: number; g: number; b: number } | null
colors.rgbToHex(r: number, g: number, b: number): string

// Color Generation
colors.random(): string
colors.adjust(color: string, amount: number): string

// Usage
const rgb = colors.hexToRgb('#ff0000'); // { r: 255, g: 0, b: 0 }
const randomColor = colors.random(); // "#a3c2f1"
const lighter = colors.adjust('#0066cc', 20); // 20% lighter
```

##### `performance` - Performance Measurement
```typescript
// Basic Measurement
performance.measure<T>(fn: () => T, label?: string): T
performance.measureAsync<T>(fn: () => Promise<T>, label?: string): Promise<T>

// Benchmarking
performance.benchmark(fn: () => void, iterations: number): {
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
}

// Usage
const result = performance.measure(() => expensiveOperation(), 'Operation');
const benchmark = performance.benchmark(() => quickFunction(), 1000);
```

#### Advanced Patterns

##### Circuit Breaker
```typescript
createCircuitBreaker<T>(
  operation: () => Promise<T>,
  options?: {
    failureThreshold?: number;
    timeout?: number;
    resetTimeout?: number;
  }
): CircuitBreaker<T>

// Usage
const breaker = createCircuitBreaker(async () => {
  return await fetch('https://api.example.com/data');
}, {
  failureThreshold: 5,
  timeout: 10000,
  resetTimeout: 30000
});

try {
  const result = await breaker.execute();
} catch (error) {
  console.log('Circuit breaker is open or operation failed');
}
```

##### Memoization
```typescript
memoize<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => TReturn,
  options?: {
    ttl?: number;
    maxSize?: number;
  }
): (...args: TArgs) => TReturn

// Usage
const memoizedFn = memoize((x: number, y: number) => {
  return expensiveCalculation(x, y);
}, { ttl: 60000, maxSize: 100 });
```

##### Lazy Initialization
```typescript
lazy<T>(factory: () => T): { get(): T }

// Usage
const heavyResource = lazy(() => new ExpensiveResource());
const resource = heavyResource.get(); // Only created when first accessed
```

#### Core Functions

```typescript
// Random Generation
generateUUID(): string
generateRandomString(length: number, charset?: string): string
randomInt(min: number, max: number): number
randomFloat(min: number, max: number): number

// Array Utilities
shuffleArray<T>(array: T[]): T[]
pickRandom<T>(array: T[], count?: number): T[]
chunkArray<T>(array: T[], size: number): T[][]

// Object Utilities
deepClone<T>(obj: T): T
deepMerge<T>(target: T, ...sources: Partial<T>[]): T
flattenObject(obj: Record<string, any>, prefix?: string, separator?: string): Record<string, any>

// Async Utilities
sleep(ms: number): Promise<void>
timeout<T>(promise: Promise<T>, ms: number): Promise<T>
retry<T>(fn: () => Promise<T>, attempts: number, delay?: number): Promise<T>

// Cryptography
md5(data: string): string
sha256(data: string): string
hmacSha256(data: string, key: string): string
base64Encode(data: string): string
base64Decode(data: string): string
```

---

### 💾 Storage Module

**Purpose**: Advanced data persistence with encryption, TTL, versioning, and migrations.

#### Core Functions

```typescript
// Basic Operations
setData<T>(key: string, value: T): Promise<void>
getData<T>(key: string): Promise<T | null>
hasData(key: string): Promise<boolean>
removeData(key: string): Promise<void>
clear(): Promise<void>

// Management
getKeys(): Promise<string[]>
getStats(): Promise<{ totalKeys: number; totalSize: number; cacheSize: number }>
exportData(): Promise<Record<string, any>>
importData(data: Record<string, any>): Promise<void>

// Namespaces
createNamespace(namespace: string): NamespaceStorage
```

#### Advanced Storage Types

##### Secure Storage (Encrypted)
```typescript
createSecureStorage(encryptionKey: string): SecureStorage

interface SecureStorage {
  setSecure<T>(key: string, value: T, options?: { compress?: boolean }): Promise<void>
  getSecure<T>(key: string): Promise<T | null>
  removeSecure(key: string): Promise<void>
}

// Usage
const secureStorage = createSecureStorage('my-secret-key');
await secureStorage.setSecure('sensitive-data', { 
  apiKey: 'secret123',
  userInfo: { id: 1, email: 'user@example.com' }
}, { compress: true });
```

##### TTL Storage (Time-To-Live)
```typescript
createTTLStorage(): TTLStorage

interface TTLStorage {
  set<T>(key: string, value: T, ttlMs: number): Promise<void>
  get<T>(key: string): Promise<T | null>
  remove(key: string): Promise<void>
  getTimeToLive(key: string): Promise<number>
  extend(key: string, additionalMs: number): Promise<boolean>
  cleanup(): Promise<number>
}

// Usage
const ttlStorage = createTTLStorage();
await ttlStorage.set('session-token', 'abc123', 30 * 60 * 1000); // 30 minutes
const timeLeft = await ttlStorage.getTimeToLive('session-token');
```

##### Observable Storage (Event-driven)
```typescript
createObservableStorage(): ObservableStorage

interface ObservableStorage {
  set<T>(key: string, value: T): Promise<void>
  get<T>(key: string): Promise<T | null>
  remove(key: string): Promise<void>
  
  // Event Listeners
  on<T>(key: string, listener: (newValue: T | null, oldValue: T | null) => void): () => void
  onAny(listener: (key: string, newValue: any, oldValue: any) => void): () => void
  off(key: string, listener?: Function): void
}

// Usage
const observableStorage = createObservableStorage();
const unsubscribe = observableStorage.on('user-preferences', (newValue, oldValue) => {
  console.log('Preferences changed:', { newValue, oldValue });
});
```

##### Versioned Storage (Audit Trail)
```typescript
createVersionedStorage(maxVersions: number): VersionedStorage

interface VersionedStorage {
  set<T>(key: string, value: T, description?: string): Promise<void>
  get<T>(key: string): Promise<T | null>
  remove(key: string): Promise<void>
  
  // Version Management
  getVersionHistory(key: string): Promise<Array<{
    version: number;
    data: any;
    timestamp: number;
    description?: string;
  }>>
  getVersion<T>(key: string, versionIndex: number): Promise<T | null>
  restoreVersion(key: string, versionIndex: number): Promise<boolean>
}

// Usage
const versionedStorage = createVersionedStorage(5); // Keep 5 versions
await versionedStorage.set('config', newConfig, 'Updated API endpoint');
const versions = await versionedStorage.getVersionHistory('config');
```

#### Storage Migrations
```typescript
storageMigrations: {
  migrate(migrations: Array<{
    version: number;
    up: (data: Record<string, any>) => Record<string, any>;
  }>): Promise<void>
  
  backup(): Promise<string>
  restore(backupKey: string): Promise<void>
}

// Usage
await storageMigrations.migrate([
  {
    version: 1,
    up: (data) => {
      // Transform data structure
      return { ...data, version: 1 };
    }
  }
]);
```

---

### 🏗️ App Module

**Purpose**: Application lifecycle management, configuration, and environment handling.

#### Core Functions

```typescript
// Application Information
getAppInfo(): Promise<{
  name?: string;
  version?: string;
  author?: string;
  description?: string;
}>

// Process Management
exit(code?: number): Promise<void>
restart(): Promise<void>
getCommandLineArgs(): string[]

// Environment Management
getEnvironmentVariable(key: string): string | undefined
setEnvironmentVariable(key: string, value: string): void
getEnvironmentVariables(): Record<string, string>

// Configuration
getConfig(): Promise<AppConfig>
setConfig(config: Partial<AppConfig>): Promise<void>

// System Paths
getSystemPath(name: 'home' | 'temp' | 'data' | 'config' | 'cache'): Promise<string>

// Development/Production Detection
isDevelopment(): boolean
isProduction(): boolean
```

#### Configuration Management
```typescript
interface AppConfig {
  name?: string;
  version?: string;
  debug?: boolean;
  theme?: string;
  language?: string;
  autoUpdate?: boolean;
  telemetry?: boolean;
  customSettings?: Record<string, any>;
}

// Usage
const config = await app.getConfig();
await app.setConfig({ debug: true, theme: 'dark' });
```

#### CLI Argument Processing
```typescript
// Parse command line arguments
const args = app.getCommandLineArgs();
const parsedArgs = app.parseArguments(args);

// Check for specific flags
if (parsedArgs.includes('--verbose')) {
  enableVerboseLogging();
}
```

---

## 🟡 System Modules

### 📁 Filesystem Module

**Purpose**: Comprehensive file and directory operations with advanced features.

#### Core File Operations

```typescript
// File Reading/Writing
readFile(path: string, encoding?: 'utf8' | 'binary'): Promise<string | Uint8Array>
writeFile(path: string, data: string | Uint8Array): Promise<void>
appendFile(path: string, data: string): Promise<void>
copyFile(src: string, dest: string): Promise<void>
moveFile(src: string, dest: string): Promise<void>
deleteFile(path: string): Promise<void>

// File Information
exists(path: string): Promise<boolean>
getStats(path: string): Promise<FileStats>
getPermissions(path: string): Promise<FilePermissions>
setPermissions(path: string, permissions: FilePermissions): Promise<void>
```

#### Directory Operations

```typescript
// Directory Management
createDirectory(path: string, recursive?: boolean): Promise<void>
readDirectory(path: string): Promise<DirectoryEntry[]>
deleteDirectory(path: string, recursive?: boolean): Promise<void>
copyDirectory(src: string, dest: string): Promise<void>
moveDirectory(src: string, dest: string): Promise<void>

// Directory Watching
watchDirectory(path: string, callback: (event: WatchEvent) => void): Promise<FileWatcher>
```

#### Advanced Features

##### File Search
```typescript
// Find files by pattern
findFiles(directory: string, pattern: RegExp | string, options?: {
  recursive?: boolean;
  includeDirectories?: boolean;
  maxDepth?: number;
}): Promise<string[]>

// Usage
const jsFiles = await findFiles('./src', /\.ts$/, { recursive: true });
```

##### File Synchronization
```typescript
// Sync directories
syncDirectories(source: string, destination: string, options?: {
  deleteExtraneous?: boolean;
  preserveTimestamps?: boolean;
  excludePatterns?: RegExp[];
}): Promise<{
  copied: string[];
  deleted: string[];
  errors: Array<{ file: string; error: string }>;
}>
```

##### Archive Operations
```typescript
// Create and extract archives
createArchive(files: string[], outputPath: string, format?: 'zip' | 'tar'): Promise<void>
extractArchive(archivePath: string, outputDirectory: string): Promise<string[]>
```

#### Path Utilities

```typescript
// Path manipulation
joinPath(...parts: string[]): string
resolvePath(path: string): string
relativePath(from: string, to: string): string
parsePath(path: string): PathParts
getExtension(path: string): string
getBasename(path: string): string
getDirname(path: string): string
```

---

### 🌐 Network Module

**Purpose**: HTTP requests, networking utilities, and API interactions with advanced features.

#### HTTP Client

```typescript
// Basic HTTP Methods
get(url: string, options?: RequestOptions): Promise<NetworkResponse>
post(url: string, data?: any, options?: RequestOptions): Promise<NetworkResponse>
put(url: string, data?: any, options?: RequestOptions): Promise<NetworkResponse>
delete(url: string, options?: RequestOptions): Promise<NetworkResponse>
patch(url: string, data?: any, options?: RequestOptions): Promise<NetworkResponse>

// Generic Request
request(request: NetworkRequest): Promise<NetworkResponse>

interface NetworkRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

interface NetworkResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  url: string;
  responseTime?: number;
}
```

#### Advanced HTTP Features

##### Robust HTTP Client
```typescript
class RobustHttpClient {
  constructor(options?: {
    baseURL?: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    headers?: Record<string, string>;
  })
  
  async request(request: NetworkRequest): Promise<NetworkResponse>
}

// Usage
const client = new RobustHttpClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  retries: 3
});
```

##### Rate Limiting
```typescript
class RateLimiter {
  constructor(maxRequests: number, windowMs: number)
  
  canMakeRequest(): boolean
  recordRequest(): void
  getTimeUntilReset(): number
  waitForSlot(): Promise<void>
}

// Usage
const limiter = new RateLimiter(100, 60000); // 100 requests per minute
if (limiter.canMakeRequest()) {
  await makeAPICall();
  limiter.recordRequest();
}
```

##### Monitored Client
```typescript
createMonitoredClient(): {
  client: RobustHttpClient;
  monitor: NetworkMonitor;
}

class NetworkMonitor {
  recordRequest(url: string, responseTime: number, success: boolean, size?: number): void
  getStats(timeframe?: number): NetworkStats
  clear(): void
}

// Usage
const { client, monitor } = createMonitoredClient();
const response = await client.get('/api/data');
const stats = monitor.getStats(); // Get performance statistics
```

#### Network Utilities

```typescript
class NetworkUtils {
  // Connectivity Testing
  static async isReachable(url: string, timeout?: number): Promise<boolean>
  static async getPublicIP(): Promise<string>
  
  // Health Checking
  static async healthCheck(urls: string[], timeout?: number): Promise<Array<{
    url: string;
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
    error?: string;
  }>>
  
  // File Operations
  static async downloadFile(url: string, destinationPath: string, options?: {
    onProgress?: (downloaded: number, total: number) => void;
    timeout?: number;
  }): Promise<void>
  
  static async uploadFile(url: string, filePath: string, options?: {
    method?: 'POST' | 'PUT';
    fieldName?: string;
    additionalFields?: Record<string, string>;
    onProgress?: (uploaded: number, total: number) => void;
  }): Promise<NetworkResponse>
}

// Usage
const isOnline = await NetworkUtils.isReachable('https://google.com');
const publicIP = await NetworkUtils.getPublicIP();

await NetworkUtils.downloadFile(
  'https://example.com/file.zip',
  './downloads/file.zip',
  {
    onProgress: (downloaded, total) => {
      console.log(`Progress: ${(downloaded/total*100).toFixed(1)}%`);
    }
  }
);
```

#### WebSocket Support

```typescript
// WebSocket client with reconnection
createWebSocketClient(url: string, options?: {
  protocols?: string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
}): WebSocketClient

interface WebSocketClient {
  connect(): Promise<void>
  disconnect(): void
  send(data: any): void
  on(event: 'open' | 'message' | 'close' | 'error', listener: Function): void
  off(event: string, listener: Function): void
}
```

---

### 💻 Computer Module

**Purpose**: System monitoring, hardware information, and performance tracking.

#### System Information

```typescript
// Basic System Info
getCpuInfo(): {
  model: string;
  count: number;
  speed: number;
  usage?: number;
}

getMemoryInfo(): {
  total: number;
  used: number;
  free: number;
  usagePercentage: number;
}

getDiskInfo(): {
  total: number;
  used: number;
  free: number;
  usagePercentage: number;
}

getSystemInfo(): SystemInfo

// Detailed System Information
getDetailedSystemInfo(): {
  platform: string;
  architecture: string;
  hostname: string;
  uptime: number;
  loadAverage: number[];
  network: Record<string, any[]>;
  user: any;
}
```

#### System Health & Performance

```typescript
// Health Scoring (0-100)
getSystemHealthScore(): {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  factors: {
    cpu: number;
    memory: number;
    disk: number;
    uptime: number;
  };
}

// Performance Monitoring
startPerformanceMonitoring(intervalMs?: number): () => void // Returns stop function

getCurrentPerformance(): {
  cpu: number;
  memory: {
    percentage: number;
    used: number;
    total: number;
  };
  timestamp: number;
}

getPerformanceHistory(): Array<{
  cpu: number;
  memory: { percentage: number; used: number; total: number };
  timestamp: number;
}>
```

#### Process Management

```typescript
// Process Information
getProcessInfo(): {
  pid: number;
  ppid: number;
  name: string;
  cpu: number;
  memory: number;
}

getProcessList(): Array<{
  pid: number;
  name: string;
  cpu: number;
  memory: number;
}>

// Process Control
killProcess(pid: number, signal?: string): Promise<void>
```

#### Resource Monitoring

```typescript
// Create resource monitor with alerts
createResourceMonitor(options?: {
  cpuThreshold?: number;
  memoryThreshold?: number;
  diskThreshold?: number;
  checkInterval?: number;
}): ResourceMonitor

interface ResourceMonitor {
  start(): void
  stop(): void
  onAlert(callback: (alert: ResourceAlert) => void): void
  getStats(): ResourceStats
}

// Usage
const monitor = createResourceMonitor({
  cpuThreshold: 80,
  memoryThreshold: 90
});

monitor.onAlert((alert) => {
  console.log(`Resource alert: ${alert.type} at ${alert.value}%`);
});

monitor.start();
```

---

### 🐛 Debug Module

**Purpose**: Professional debugging tools with profiling, sessions, and analytics.

#### Logging Functions

```typescript
// Basic Logging
debug(message: string, data?: any, options?: LogOptions): void
info(message: string, data?: any, options?: LogOptions): void
warn(message: string, data?: any, options?: LogOptions): void
error(message: string, error?: Error | any, options?: LogOptions): void
log(level: LogLevel, message: string, data?: any, options?: LogOptions): void

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogOptions {
  timestamp?: boolean;
  prefix?: string;
  color?: boolean;
  metadata?: Record<string, any>;
}
```

#### Performance Profiling

```typescript
// Timer Functions
timer(label: string): {
  end: () => number;
  lap: (lapLabel?: string) => number;
}

measure<T>(label: string, fn: () => T | Promise<T>): Promise<{
  result: T;
  duration: number;
}>

// Profiler Class
class Profiler {
  start(): void
  mark(name: string): void
  measure(name: string, startMark?: string, endMark?: string): number
  getMeasures(): Array<{ name: string; duration: number }>
  getReport(): string
  clear(): void
}

createProfiler(): Profiler

// Usage
const profiler = createProfiler();
profiler.start();
await doSomeWork();
profiler.mark('work-complete');
const duration = profiler.measure('total-work');
```

#### Debug Sessions

```typescript
// Debug Session for grouped logging
class DebugSession {
  constructor(name: string)
  
  log(level: LogLevel, message: string, data?: any): void
  end(): {
    name: string;
    duration: number;
    logs: Array<{ level: LogLevel; message: string; timestamp: Date; data?: any }>;
  }
}

createSession(name: string): DebugSession

// Usage
const session = createSession('user-login');
session.log('info', 'Login attempt started');
session.log('warn', 'Password complexity low');
session.log('info', 'Login successful');

const report = session.end();
console.log(`Session completed in ${report.duration.toFixed(2)}ms`);
```

#### Memory Monitoring

```typescript
// Memory Usage
getMemoryUsage(): {
  used: number;
  total: number;
  usagePercentage: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  rss: number;
}

logMemoryUsage(label?: string): void
memorySnapshot(): MemorySnapshot

// Function Tracing
trace<T extends (...args: any[]) => any>(fn: T, label?: string): T

// Usage
const tracedFunction = trace(expensiveFunction, 'Expensive Operation');
const result = tracedFunction(arg1, arg2); // Automatically logged
```

#### Log Management

```typescript
// Log History
getLogHistory(level?: LogLevel, limit?: number): Array<{
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
}>

clearHistory(): void

// Export/Import
exportLogs(format?: 'text' | 'json'): string
exportLogsToFile(filePath?: string): Promise<string>

// Log Analysis
analyzeLogPatterns(): {
  totalLogs: number;
  logsByLevel: Record<LogLevel, number>;
  errorRate: number;
  warningRate: number;
  averageLogsPerMinute: number;
  mostCommonMessages: Array<{ message: string; count: number }>;
}
```

#### Configuration

```typescript
// Debug Configuration
config: {
  enabled: boolean;
  level: LogLevel;
  historySize: number;
}

// Logger Creation
createLogger(prefix: string): {
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, error?: any) => void;
}
```

---

### 📋 Clipboard Module

**Purpose**: System clipboard operations with advanced features.

#### Basic Operations

```typescript
// Text Operations
writeText(text: string): Promise<void>
readText(): Promise<string>
clear(): Promise<void>

// Format Detection
getAvailableFormats(): Promise<string[]>
hasText(): Promise<boolean>
hasImage(): Promise<boolean>
hasFiles(): Promise<boolean>
```

#### Advanced Features

##### HTML Content
```typescript
// HTML Support
writeHTML(html: string, fallbackText?: string): Promise<void>
readHTML(): Promise<string | null>

// Usage
await writeHTML('<b>Bold text</b>', 'Bold text');
const htmlContent = await readHTML();
```

##### Clipboard History
```typescript
// History Tracking
startHistoryTracking(maxItems?: number): () => void // Returns stop function
getHistory(): Promise<Array<{
  content: string;
  timestamp: Date;
  type: 'text' | 'html' | 'image';
}>>
clearHistory(): Promise<void>

// Usage
const stopTracking = startHistoryTracking(50);
const history = await getHistory();
console.log(`Clipboard history: ${history.length} items`);
```

##### Clipboard Monitoring
```typescript
// Real-time Monitoring
watchClipboard(callback: (content: ClipboardContent) => void): () => void

interface ClipboardContent {
  type: 'text' | 'html' | 'image' | 'files';
  data: any;
  timestamp: Date;
}

// Usage
const stopWatching = watchClipboard((content) => {
  console.log('Clipboard changed:', content.type, content.data);
});
```

##### Search and Management
```typescript
// Search clipboard history
searchHistory(query: string): Promise<Array<{
  content: string;
  timestamp: Date;
  type: string;
  relevance: number;
}>>

// Clipboard state management
getClipboardState(): Promise<{
  hasContent: boolean;
  contentType: string;
  lastModified: Date;
  size: number;
}>
```

---

## 🔴 Advanced Modules

### ⚡ Events Module

**Purpose**: Advanced event system with middleware, aggregation, and monitoring.

#### Core Event Emitter

```typescript
// Simple Event Emitter
class SimpleEventEmitter {
  on<T>(event: string, listener: EventListener<T>): void
  off(event: string, listener?: EventListener): void
  emit<T>(event: string, data?: T): void
  once<T>(event: string, listener: EventListener<T>): void
}

type EventListener<T = any> = (data: T) => void
```

#### Advanced Event Emitter

```typescript
// Enhanced Event Emitter with middleware
class AdvancedEventEmitter extends SimpleEventEmitter {
  use(middleware: EventMiddleware): void
  setMaxListeners(max: number): void
  listenerCount(event: string): number
  eventNames(): string[]
}

type EventMiddleware = (event: string, data: any, next: () => void) => void

// Usage
const emitter = new AdvancedEventEmitter();

// Add logging middleware
emitter.use((event, data, next) => {
  console.log(`Event: ${event}`, data);
  next();
});

emitter.on('user-action', (data) => {
  console.log('User performed:', data.action);
});

emitter.emit('user-action', { action: 'login', userId: 123 });
```

#### Event Aggregator

```typescript
// Event Aggregator for complex scenarios
class EventAggregator {
  subscribe<T>(event: string, listener: EventListener<T>): string // Returns subscription ID
  unsubscribe(subscriptionId: string): void
  publish<T>(event: string, data?: T): void
  clear(): void
  
  // Pattern-based subscriptions
  subscribePattern(pattern: RegExp, listener: EventListener): string
}

// Usage
const aggregator = new EventAggregator();
const subscriptionId = aggregator.subscribe('data-update', (data) => {
  updateUI(data);
});

// Later...
aggregator.unsubscribe(subscriptionId);
```

#### Specialized Emitters

```typescript
// Throttled Event Emitter
createThrottledEmitter(delay?: number): {
  emit: (event: string, data?: any) => void;
  on: (event: string, listener: EventListener) => void;
  off: (event: string, listener: EventListener) => void;
}

// Debounced Event Emitter  
createDebouncedEmitter(delay?: number): {
  emit: (event: string, data?: any) => void;
  on: (event: string, listener: EventListener) => void;
  off: (event: string, listener: EventListener) => void;
}

// Usage
const throttledEmitter = createThrottledEmitter(100); // Max once per 100ms
throttledEmitter.on('scroll', updateScrollPosition);
throttledEmitter.emit('scroll', { top: 100 }); // Will be throttled
```

#### Global Event Bus

```typescript
// Global Event Bus for app-wide communication
class GlobalEventBus extends AdvancedEventEmitter {
  broadcast<T>(event: string, data?: T): void
  onBroadcast<T>(event: string, listener: EventListener<T>): void
}

getGlobalEventBus(): GlobalEventBus

// Usage
const globalBus = getGlobalEventBus();
globalBus.broadcast('system-notification', 'System updated');

globalBus.onBroadcast('system-notification', (message) => {
  showNotification(message);
});
```

#### Event Utilities

```typescript
// Promise-based event waiting
waitForEvent<T>(
  emitter: SimpleEventEmitter,
  event: string,
  timeout?: number
): Promise<T>

// Event monitoring and statistics
class EventStats {
  recordEvent(event: string): void
  getStats(): {
    totalEvents: number;
    eventCounts: Record<string, number>;
    eventsPerSecond: number;
    topEvents: Array<{ event: string; count: number }>;
  }
  clear(): void
}

createMonitoredEmitter(): {
  emitter: SimpleEventEmitter;
  stats: EventStats;
}

// Usage
const result = await waitForEvent(emitter, 'operation-complete', 5000);

const { emitter: monitored, stats } = createMonitoredEmitter();
const eventStats = stats.getStats();
```

#### System Events

```typescript
// Predefined system events
SystemEvents: {
  APP_START: 'app:start';
  APP_EXIT: 'app:exit';
  CONFIG_CHANGE: 'config:change';
  STORAGE_SET: 'storage:set';
  STORAGE_REMOVE: 'storage:remove';
  CLIPBOARD_CHANGED: 'clipboard:changed';
  ERROR: 'error';
  WARNING: 'warning';
  INFO: 'info';
  DEBUG: 'debug';
}

emitSystemEvent(type: keyof typeof SystemEvents, data?: any): void
```

---

### 🖥️ OS Module

**Purpose**: Operating system integration, command execution, and environment management.

#### Command Execution

```typescript
// Execute commands
executeCommand(command: string, options?: {
  cwd?: string;
  env?: Record<string, string>;
  timeout?: number;
  shell?: boolean;
}): Promise<CommandResult>

interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  signal?: string;
  timedOut: boolean;
}

// Spawn processes
spawnProcess(command: string, args?: string[], options?: {
  cwd?: string;
  env?: Record<string, string>;
  detached?: boolean;
}): Promise<SpawnedProcess>

interface SpawnedProcess {
  pid: number;
  kill(signal?: string): boolean;
  wait(): Promise<number>;
}
```

#### Environment Management

```typescript
// Environment Variables
const envManager = {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
  getAll(): Record<string, string>;
  
  // Advanced operations
  getByPrefix(prefix: string): Record<string, string>;
  setMany(vars: Record<string, string>): void;
  backup(): Record<string, string>;
  restore(backup: Record<string, string>): void;
}

// Usage
const nodeVars = envManager.getByPrefix('NODE_');
envManager.setMany({
  'MY_APP_ENV': 'production',
  'MY_APP_DEBUG': 'false'
});
```

#### System Information

```typescript
// Detailed system information
const systemInfo = {
  getDetailed(): {
    platform: string;
    architecture: string;
    hostname: string;
    uptime: number;
    loadAverage: number[];
    network: Record<string, any[]>;
    user: any;
  };
  
  async getLimits(): Promise<{
    maxFileDescriptors?: number;
    maxProcesses?: number;
    maxMemory?: number;
  }>;
}
```

#### Directory Paths

```typescript
// System directory paths
getSystemDirectories(): {
  home: string;
  temp: string;
  data: string;
  config: string;
  cache: string;
  desktop: string;
  documents: string;
  downloads: string;
}

// Usage
const dirs = getSystemDirectories();
const configPath = path.join(dirs.config, 'myapp', 'settings.json');
```

#### Process Management

```typescript
// Advanced process management
const processManager = {
  // List processes
  list(filter?: { name?: string; user?: string }): Promise<ProcessInfo[]>;
  
  // Find processes
  findByName(name: string): Promise<ProcessInfo[]>;
  findByPort(port: number): Promise<ProcessInfo[]>;
  
  // Process control
  kill(pid: number, signal?: string): Promise<boolean>;
  killByName(name: string, signal?: string): Promise<number>; // Returns count
  
  // Process monitoring
  monitor(pid: number, callback: (info: ProcessInfo) => void): () => void;
}

interface ProcessInfo {
  pid: number;
  ppid: number;
  name: string;
  cpu: number;
  memory: number;
  startTime: Date;
  command: string;
}
```

#### Performance Monitoring

```typescript
// System performance monitoring
const performanceMonitor = {
  start(intervalMs?: number): void;
  stop(): void;
  
  getCurrent(): {
    cpu: number;
    memory: { percentage: number; used: number; total: number };
    timestamp: number;
  } | null;
  
  getAverage(timeframeMs?: number): {
    cpu: number;
    memory: number;
  };
  
  getHistory(): Array<{
    cpu: number;
    memory: { percentage: number; used: number; total: number };
    timestamp: number;
  }>;
  
  clear(): void;
}
```

#### Cross-platform Clipboard

```typescript
// Alternative clipboard implementation
const clipboard = {
  async read(): Promise<string>;
  async write(text: string): Promise<void>;
}
```

---

## 📦 Type Definitions

### Core Types

```typescript
// File System Types
interface DirectoryEntry {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
  size: number;
  modifiedAt: Date;
  createdAt: Date;
}

interface FileStats {
  size: number;
  isDirectory: boolean;
  isFile: boolean;
  modifiedAt: Date;
  createdAt: Date;
  accessedAt: Date;
  permissions: FilePermissions;
}

interface FilePermissions {
  readable: boolean;
  writable: boolean;
  executable: boolean;
  mode: number;
}

// Watch Types
interface WatchEvent {
  type: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir';
  path: string;
  stats?: FileStats;
}

interface FileWatcher {
  close(): Promise<void>;
  add(path: string): void;
  unwatch(path: string): void;
}

// Network Types
interface NetworkRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}

interface NetworkResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  url: string;
  responseTime?: number;
}

// Debug Types
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  timestamp?: boolean;
  prefix?: string;
  color?: boolean;
  metadata?: Record<string, any>;
}

// Event Types
interface EventListener<T = any> {
  (data: T): void;
}

// App Types
interface AppConfig {
  name?: string;
  version?: string;
  debug?: boolean;
  theme?: string;
  language?: string;
  autoUpdate?: boolean;
  telemetry?: boolean;
  customSettings?: Record<string, any>;
}
```

---

## 🎯 Examples

### Quick Usage Examples

#### Basic Module Usage
```typescript
import { utils, storage, events } from './bun_user_modules';

// Generate unique identifier
const id = utils.generateUUID();

// Store data with encryption
await storage.setData('user-session', { id, timestamp: Date.now() });

// Emit event
events.emit('session:created', { id });
```

#### File Operations
```typescript
import { filesystem } from './bun_user_modules';

// Read and process files
const content = await filesystem.readFile('./config.json', 'utf8');
const config = JSON.parse(content);

// Watch for changes
const watcher = await filesystem.watchDirectory('./config', (event) => {
  console.log(`File ${event.type}: ${event.path}`);
});
```

#### Network Operations
```typescript
import { network } from './bun_user_modules';

// Simple HTTP request
const response = await network.get('https://api.example.com/data');

// With monitoring
const { client, monitor } = network.createMonitoredClient();
const data = await client.post('/api/users', { name: 'John' });
const stats = monitor.getStats();
```

#### Performance Monitoring
```typescript
import { debug, computer } from './bun_user_modules';

// Profile operations
const profiler = debug.createProfiler();
profiler.start();

// Do work...
await performExpensiveOperation();

profiler.mark('operation-complete');
const duration = profiler.measure('total-time');

// System health
const health = computer.getSystemHealthScore();
console.log(`System health: ${health.score}/100 (${health.status})`);
```

### Running Examples

Each module includes comprehensive examples:

```bash
# Run individual examples
bun run examples/utils-example.ts
bun run examples/storage-example.ts
bun run examples/network-example.ts

# Run all examples
bun run examples/run-all.ts

# Run with filters
bun run examples/run-all.ts --difficulty "Beginner"
bun run examples/run-all.ts --category "Core"
bun run examples/run-all.ts --parallel --concurrency 3
```

---

## 📚 Additional Resources

- **[GitHub Repository](https://github.com/codecaine-zz/bun_user_modules)** - Source code and issues
- **[Examples Directory](./examples/)** - Comprehensive usage examples
- **[Type Definitions](./types.ts)** - Complete TypeScript definitions
- **[Enhancement Summary](./ENHANCEMENT_SUMMARY.md)** - Detailed feature overview

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

*Last updated: July 13, 2025*
