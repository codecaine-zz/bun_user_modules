# Bun User Modules 🚀

**Enterprise-grade system interaction APIs for Bun runtime** - A comprehensive toolkit inspired by NeutralinoJS with advanced functionality for production applications.

[![Bun](https://img.shields.io/badge/Bun-1.0+-000000?style=flat&logo=bun)](https://bun.sh/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ What's New in Enhanced Version

🎉 **Major Enhancement Update!** All modules have been significantly upgraded with production-ready features:

- 🔒 **Security**: Encrypted storage, secure operations, validation
- 📊 **Monitoring**: Performance profiling, system health scoring, resource tracking
- 🔄 **Reliability**: Circuit breakers, retry mechanisms, rate limiting
- 🎯 **Developer Experience**: Advanced debugging, event systems, observability
- 🏢 **Enterprise Features**: Backup/restore, versioning, migration utilities
- 🧮 **Enhanced Utils**: Weighted arrays, advanced math, date/string manipulation, object utilities

## 🌟 Core Features

### **📋 Enhanced Clipboard Module**

Advanced clipboard operations with history, rich content support, and real-time monitoring.

```typescript
import { writeText, writeHtml, getHistory, watchClipboard, searchHistory } from './modules/clipboard';

// Basic operations with history tracking
await writeText('Hello World!');
await writeHtml('<b>Bold text</b>', 'Bold text'); // HTML with fallback

// Rich text with formatting
await writeRichText('Important!', { 
  bold: true, 
  color: '#ff0000' 
});

// History management
const history = getHistory(); // Get all clipboard history
const results = searchHistory('hello'); // Search clipboard history

// Real-time monitoring
const stopWatching = watchClipboard((content) => {
  console.log('Clipboard changed:', content);
}, 500); // Check every 500ms

// File paths and bulk operations
await writeFilePaths(['/path/to/file1.txt', '/path/to/file2.txt']);
const stats = getStats(); // Get clipboard usage statistics
```

### **💻 Enhanced Computer Module**

Comprehensive system monitoring with health scoring and performance tracking.

```typescript
import { 
  getCpuInfo, 
  getMemoryInfo, 
  getSystemHealthScore,
  startPerformanceMonitoring,
  getCurrentPerformance,
  getPerformanceHistory 
} from './modules/computer';

// System information
const cpu = getCpuInfo();
console.log(`${cpu.count} cores, ${cpu.model}`);

const memory = getMemoryInfo();
console.log(`Memory: ${memory.usagePercentage.toFixed(1)}% used`);

// System health scoring (0-100)
const health = getSystemHealthScore();
console.log(`System Health: ${health.score}/100 (${health.status})`);
// Status can be: 'excellent', 'good', 'fair', 'poor', 'critical'

// Performance monitoring
const stopMonitoring = startPerformanceMonitoring(5000); // Every 5 seconds
const currentPerf = getCurrentPerformance();
const history = getPerformanceHistory(); // Historical data

// Advanced system info
const detailedInfo = getDetailedSystemInfo();
const needsRestart = await needsRestart(); // Suggests restart if needed
```

### **🐛 Enhanced Debug Module**

Professional debugging tools with profiling, sessions, and analytics.

```typescript
import { 
  createProfiler, 
  createSession, 
  getMemoryUsage,
  analyzeLogPatterns,
  exportLogs 
} from './modules/debug';

// Performance profiling
const profiler = createProfiler();
profiler.start();

await doSomeWork();
profiler.mark('work-complete');

const duration = profiler.measure('total-work');
console.log(`Work completed in ${duration.toFixed(2)}ms`);

// Debug sessions for grouped logging
const session = createSession('user-login');
session.log('info', 'Login attempt started');
session.log('warn', 'Password complexity low');
session.log('info', 'Login successful');

const report = session.end();
console.log(`Session completed in ${report.duration.toFixed(2)}ms`);

// Memory monitoring
const memUsage = getMemoryUsage();
logMemoryUsage('After heavy operation');

// Log analysis
const patterns = analyzeLogPatterns();
console.log(`Error rate: ${patterns.errorRate.toFixed(2)}%`);

// Export logs for external analysis
const logFile = await exportLogs('./debug-logs.json');
```

### **🎯 Enhanced Events Module**

Advanced event system with middleware, aggregation, and monitoring.

```typescript
import { 
  AdvancedEventEmitter, 
  EventAggregator,
  getGlobalEventBus,
  createThrottledEmitter,
  createMonitoredEmitter,
  waitForEvent 
} from './modules/events';

// Advanced event emitter with middleware
const emitter = new AdvancedEventEmitter();

// Add middleware for logging
emitter.use((event, data, next) => {
  console.log(`Event: ${event}`, data);
  next();
});

emitter.on('user-action', (data) => {
  console.log('User performed:', data.action);
});

emitter.emit('user-action', { action: 'login', userId: 123 });

// Event aggregator for complex scenarios
const aggregator = new EventAggregator();
const subscriptionId = aggregator.subscribe('data-update', (data) => {
  updateUI(data);
});

// Throttled events (useful for UI updates)
const throttledEmitter = createThrottledEmitter(100); // Max once per 100ms
throttledEmitter.on('scroll', updateScrollPosition);

// Global event bus for app-wide communication
const globalBus = getGlobalEventBus();
globalBus.broadcast('system-notification', 'System updated');

// Promise-based event waiting
const result = await waitForEvent(emitter, 'operation-complete', 5000);

// Event monitoring and statistics
const { emitter: monitored, stats } = createMonitoredEmitter();
const eventStats = stats.getStats();
```

### **📁 Enhanced Filesystem Module**

Professional file operations with sync, backup, archiving, and management.

```typescript
import { 
  createFileManager,
  findFiles,
  syncDirectories,
  createTempDir,
  createFileArchiver,
  FileManager 
} from './modules/filesystem';

// Object-oriented file management
const fileManager = createFileManager('/project/root');
const backupPath = await fileManager.backup('important.txt');
await fileManager.safeWrite('config.json', jsonData); // Writes with backup

const humanSize = await fileManager.getHumanSize('large-file.zip');
console.log(`File size: ${humanSize}`);

// Advanced file search with patterns
const tsFiles = await findFiles('.', /\.ts$/, {
  includeDirectories: false,
  maxDepth: 5
});

const configFiles = await findFiles('./src', 'config', {
  includeDirectories: true
});

// Directory synchronization
const syncResult = await syncDirectories('./source', './backup', {
  deleteExtra: true,
  overwriteNewer: true,
  dryRun: false // Set to true for preview
});

console.log(`Synced: ${syncResult.copied.length} files`);
console.log(`Deleted: ${syncResult.deleted.length} files`);

// Temporary file management
const tempDir = await createTempDir('my-app-');
const tempFile = await createTempFile('temporary content', '.txt');
const cleanedFiles = await cleanupTempFiles(24 * 60 * 60 * 1000); // 24 hours

// File archiving with versioning
const archiver = createFileArchiver();
await archiver.archive('./important-config.json');
await archiver.restore('./important-config.json'); // Restore from archive
const archived = archiver.listArchived();
```

### **🔧 Enhanced Utils Module**

Comprehensive utility functions including weighted arrays, advanced math, date manipulation, string processing, and more.

```typescript
import { 
  weightedArray, 
  math, 
  dateUtils, 
  stringUtils, 
  arrayUtils, 
  objectUtils,
  createCircuitBreaker,
  memoize,
  lazy,
  createEventEmitter,
  urlParams,
  colors,
  validate,
  performance
} from './modules/utils';

// Weighted arrays for probability-based selection
const items = ['common', 'rare', 'legendary'];
const weights = [70, 25, 5]; // 70% common, 25% rare, 5% legendary
const selected = weightedArray.pickWeighted(items, weights);

// Create reusable distributions
const lootDistribution = weightedArray.createDistribution([
  { item: 'sword', weight: 10 },
  { item: 'shield', weight: 15 },
  { item: 'potion', weight: 50 }
]);
const loot = lootDistribution.pick();

// Advanced math utilities
const clamped = math.clamp(value, 0, 100); // Keep value between 0-100
const interpolated = math.lerp(start, end, 0.5); // 50% between start and end
const mapped = math.map(value, 0, 255, 0, 1); // Map RGB to 0-1 range
const distance = math.distance(x1, y1, x2, y2); // Euclidean distance

// Number theory and statistics
const isPrime = math.isPrime(17); // true
const factorial = math.factorial(5); // 120
const fibonacci = math.fibonacci(7); // 13
const average = math.average([1, 2, 3, 4, 5]); // 3
const median = math.median([1, 2, 3, 4, 5]); // 3
const stdDev = math.standardDeviation(numbers);

// Date manipulation and formatting
const nextWeek = dateUtils.addDays(new Date(), 7);
const nextYear = dateUtils.addYears(new Date(), 1);
const daysDiff = dateUtils.diff(date1, date2, 'days');
const isLeap = dateUtils.isLeapYear(2024); // true
const timeAgo = dateUtils.timeAgo(pastDate); // "2 hours ago"
const formatted = dateUtils.format(new Date(), 'YYYY-MM-DD HH:mm:ss');

// String manipulation and conversion
const camelCase = stringUtils.camelCase('hello-world'); // "helloWorld"
const snakeCase = stringUtils.snakeCase('HelloWorld'); // "hello_world"
const kebabCase = stringUtils.kebabCase('HelloWorld'); // "hello-world"
const slug = stringUtils.slug('Hello World!'); // "hello-world"
const truncated = stringUtils.truncate(text, 50, '...');
const isPalin = stringUtils.isPalindrome('racecar'); // true
const wordCount = stringUtils.words(text).length;

// Advanced array operations
const matrix = arrayUtils.createMatrix(3, 3, 0); // 3x3 matrix of zeros
const transposed = arrayUtils.transpose(matrix);
const combinations = arrayUtils.combinations([1, 2, 3], 2); // [[1,2], [1,3], [2,3]]
const permutations = arrayUtils.permutations([1, 2, 3]);
const rotated = arrayUtils.rotate([1, 2, 3, 4], 2); // [3, 4, 1, 2]

// Set operations
const intersection = arrayUtils.intersection([1, 2, 3], [2, 3, 4]); // [2, 3]
const union = arrayUtils.union([1, 2], [3, 4]); // [1, 2, 3, 4]
const difference = arrayUtils.difference([1, 2, 3], [2, 3]); // [1]

// Object utilities
const picked = objectUtils.pick(obj, ['name', 'age']);
const omitted = objectUtils.omit(obj, ['password']);
const inverted = objectUtils.invert({ a: 1, b: 2 }); // { '1': 'a', '2': 'b' }
const mappedValues = objectUtils.mapValues(obj, v => v * 2);
const hasNestedPath = objectUtils.hasPath(obj, 'user.profile.name');

// Circuit breaker for resilient operations
const breaker = createCircuitBreaker(unstableOperation, {
  failureThreshold: 5,
  timeout: 30000,
  resetTimeout: 60000
});

try {
  const result = await breaker.execute();
} catch (error) {
  console.log('Operation failed or circuit is open');
}

// Memoization with TTL support
const expensiveFunction = memoize((x, y) => {
  // Expensive computation
  return x * y;
}, { ttl: 60000, maxSize: 100 });

// Lazy initialization
const heavyResource = lazy(() => {
  return new ExpensiveResource();
});
const resource = heavyResource.get(); // Only initialized when accessed

// Type-safe event emitter
const emitter = createEventEmitter<{
  userLogin: { userId: string; timestamp: Date };
  dataUpdate: { table: string; changes: any[] };
}>();

emitter.on('userLogin', (data) => {
  console.log(`User ${data.userId} logged in at ${data.timestamp}`);
});

emitter.emit('userLogin', { userId: '123', timestamp: new Date() });

// URL parameter handling
const params = urlParams.parse('?name=John&age=30&tags=a&tags=b');
// { name: 'John', age: '30', tags: ['a', 'b'] }

const queryString = urlParams.stringify({ name: 'John', tags: ['a', 'b'] });
// "name=John&tags=a&tags=b"

// Color utilities
const rgb = colors.hexToRgb('#ff0000'); // { r: 255, g: 0, b: 0 }
const hex = colors.rgbToHex(255, 0, 0); // "#ff0000"
const randomColor = colors.random(); // "#a3f2c1"
const lighter = colors.adjust('#808080', 20); // 20% lighter

// Validation utilities
const isValidEmail = validate.email('user@example.com'); // true
const isValidUrl = validate.url('https://example.com'); // true
const isValidPhone = validate.phone('+1234567890'); // true
const isValidCard = validate.creditCard('4532015112830366'); // true

const passwordResult = validate.password('StrongPass123!', {
  minLength: 8,
  requireNumbers: true,
  requireSpecialChars: true,
  requireUppercase: true,
  requireLowercase: true
});
// { valid: true, errors: [] }

// Performance measurement
const result = performance.measure(() => {
  // Some operation
  return expensiveComputation();
}, 'Expensive Computation');

const asyncResult = await performance.measureAsync(async () => {
  return await apiCall();
}, 'API Call');

const benchmarkResults = performance.benchmark(() => {
  mathOperation();
}, 1000); // Run 1000 iterations
// { averageTime: 0.5, totalTime: 500, iterations: 1000 }
```

**Key Features:**

- 🎯 **Weighted Arrays**: Probability-based selection with customizable distributions
- 🧮 **Advanced Math**: Statistics, number theory, interpolation, coordinate geometry
- 📅 **Date Utilities**: Manipulation, formatting, relative time, leap year detection
- 📝 **String Processing**: Case conversion, validation, slug generation, word wrapping
- 🗂️ **Array Operations**: Matrix operations, set theory, combinatorics, algorithms
- 🎯 **Object Manipulation**: Deep operations, path handling, functional transformations
- 🔄 **Resilience Patterns**: Circuit breakers, memoization, lazy loading
- 🎭 **Event System**: Type-safe event emitters with listener management
- 🌐 **Web Utilities**: URL parsing, color conversion, validation
- ⚡ **Performance Tools**: Benchmarking, profiling, execution measurement

### **🌐 Enhanced Network Module**

Robust networking with monitoring, rate limiting, and advanced utilities.

```typescript
import { 
  NetworkUtils,
  RobustHttpClient,
  createMonitoredClient,
  RateLimiter 
} from './modules/network';

// Network utilities
const isOnline = await NetworkUtils.isReachable('https://google.com');
const publicIP = await NetworkUtils.getPublicIP();

// Health checking multiple services
const healthResults = await NetworkUtils.healthCheck([
  'https://api.service1.com/health',
  'https://api.service2.com/health'
], 3000);

healthResults.forEach(result => {
  console.log(`${result.url}: ${result.status} (${result.responseTime}ms)`);
});

// File operations
await NetworkUtils.downloadFile(
  'https://example.com/file.zip',
  './downloads/file.zip',
  {
    onProgress: (downloaded, total) => {
      console.log(`Progress: ${(downloaded/total*100).toFixed(1)}%`);
    }
  }
);

await NetworkUtils.uploadFile(
  'https://api.example.com/upload',
  './local-file.pdf',
  { fieldName: 'document', additionalFields: { userId: '123' } }
);

// Robust HTTP client with retries and rate limiting
const client = new RobustHttpClient({
  rateLimit: { limit: 10, windowMs: 60000 }, // 10 requests per minute
  maxRetries: 3,
  retryDelay: 1000
});

const response = await client.request({
  url: 'https://api.example.com/data',
  method: 'GET'
});

// Monitored client with performance tracking
const { client: monitoredClient, monitor } = createMonitoredClient();
const networkStats = monitor.getStats();
console.log(`Success rate: ${networkStats.successRate.toFixed(2)}%`);
```

### **🛠️ Enhanced Utils Module**

Advanced patterns and utilities for robust application development.

```typescript
import { 
  createCircuitBreaker,
  memoize,
  lazy,
  retry,
  validate,
  colors,
  performance 
} from './modules/utils';

// Circuit breaker for fault tolerance
const apiCall = createCircuitBreaker(async () => {
  return await fetch('https://unreliable-api.com/data');
}, {
  failureThreshold: 5,
  timeout: 10000,
  resetTimeout: 30000
});

try {
  const result = await apiCall.execute();
} catch (error) {
  console.log('Circuit breaker is open or API failed');
}

// Memoization with TTL
const expensiveFunction = memoize((id: string) => {
  return computeExpensiveResult(id);
}, { 
  ttl: 60000, // 1 minute cache
  maxSize: 100 
});

// Lazy initialization
const heavyResource = lazy(() => {
  return new HeavyResourceClass();
});

// Only initialized when first accessed
const resource = heavyResource.get();

// Advanced validation
const emailValid = validate.email('user@example.com');
const passwordCheck = validate.password('MyPass123!', {
  minLength: 8,
  requireNumbers: true,
  requireSpecialChars: true
});

if (!passwordCheck.valid) {
  console.log('Password errors:', passwordCheck.errors);
}

// Color utilities
const randomColor = colors.random();
const lighterBlue = colors.adjust('#0066cc', 20); // 20% lighter
const rgb = colors.hexToRgb('#ff6600');

// Performance measurement
const result = performance.measure(() => {
  return heavyComputation();
}, 'Heavy Computation');

const benchmark = performance.benchmark(() => {
  quickFunction();
}, 1000); // Run 1000 times

console.log(`Average time: ${benchmark.averageTime}ms`);
```

### **💾 Enhanced Storage Module**

Advanced storage with encryption, TTL, versioning, and migrations.

```typescript
import { 
  createSecureStorage,
  createTTLStorage,
  createObservableStorage,
  createVersionedStorage,
  storageMigrations 
} from './modules/storage';

// Secure encrypted storage
const secureStorage = createSecureStorage('my-secret-key');
await secureStorage.setSecure('sensitive-data', { 
  apiKey: 'secret123',
  userInfo: { id: 1, email: 'user@example.com' }
}, { compress: true });

const sensitiveData = await secureStorage.getSecure('sensitive-data');

// TTL (Time-To-Live) storage
const ttlStorage = createTTLStorage();
await ttlStorage.set('session-token', 'abc123', 30 * 60 * 1000); // 30 minutes

const token = await ttlStorage.get('session-token');
const timeLeft = await ttlStorage.getTimeToLive('session-token');

// Auto-cleanup expired items
const cleanedCount = await ttlStorage.cleanup();

// Observable storage with change notifications
const observableStorage = createObservableStorage();

// Listen to specific key changes
const unsubscribe = observableStorage.on('user-preferences', (newValue, oldValue) => {
  console.log('Preferences changed:', { newValue, oldValue });
});

// Listen to all changes
const unsubscribeAll = observableStorage.onAny((key, newValue, oldValue) => {
  console.log(`${key} changed from`, oldValue, 'to', newValue);
});

// Versioned storage with automatic backups
const versionedStorage = createVersionedStorage(5); // Keep 5 versions
await versionedStorage.set('config', newConfig, 'Updated API endpoint');

const versions = await versionedStorage.getVersionHistory('config');
await versionedStorage.restoreVersion('config', 1); // Restore previous version

// Storage migrations
await storageMigrations.migrate([
  {
    version: 1,
    up: (data) => {
      // Migrate data structure
      return { ...data, version: 1 };
    }
  },
  {
    version: 2, 
    up: (data) => {
      // Another migration
      return transformDataStructure(data);
    }
  }
]);

// Backup and restore
const backupKey = await storageMigrations.backup();
await storageMigrations.restore(backupKey);
```

### **🖥️ Enhanced OS Module**

Advanced process management, resource monitoring, and system utilities.

```typescript
import { 
  createProcessManager,
  createResourceMonitor,
  envManager,
  systemInfo,
  clipboard 
} from './modules/os';

// Process management
const processManager = createProcessManager();

await processManager.start('web-server', 'npm run dev', {
  cwd: './my-app',
  env: { PORT: '3000' },
  onOutput: (data) => console.log('Server:', data),
  onError: (data) => console.error('Server Error:', data),
  onExit: (code) => console.log('Server exited with code:', code)
});

const status = processManager.getStatus('web-server');
const allProcesses = processManager.list();

// Stop specific process
processManager.stop('web-server', 'SIGTERM');

// Resource monitoring
const monitor = createResourceMonitor();
monitor.start(2000); // Monitor every 2 seconds

const current = monitor.getCurrent();
const average = monitor.getAverage(60000); // Last minute average
const history = monitor.getHistory();

console.log(`Current CPU: ${current?.cpu.toFixed(2)}%`);
console.log(`Memory usage: ${current?.memory.percentage.toFixed(2)}%`);

// Environment management
const nodeVars = envManager.getByPrefix('NODE_');
envManager.setMany({
  'MY_APP_ENV': 'production',
  'MY_APP_DEBUG': 'false'
});

const backup = envManager.backup();
envManager.restore(backup); // Restore environment

// System information
const detailed = systemInfo.getDetailed();
const limits = await systemInfo.getLimits();

console.log(`Platform: ${detailed.platform}`);
console.log(`Max file descriptors: ${limits.maxFileDescriptors}`);

// Cross-platform clipboard (alternative to clipboard module)
await clipboard.write('Hello from OS module!');
const clipboardText = await clipboard.read();
```

## 🚀 Quick Start

```typescript
// Import everything
import * as bun from './index.ts';

// Or import specific modules
import { writeText, getHistory } from './modules/clipboard';
import { getCpuInfo, getSystemHealthScore } from './modules/computer';
import { createProfiler } from './modules/debug';

// Example: System health dashboard
async function createHealthDashboard() {
  const profiler = createProfiler();
  profiler.start();
  
  // Get system metrics
  const health = getSystemHealthScore();
  const cpu = getCpuInfo();
  const clipboard = getHistory();
  
  profiler.mark('metrics-collected');
  
  const dashboard = {
    timestamp: new Date(),
    systemHealth: health,
    hardware: {
      cpu: `${cpu.count} cores - ${cpu.model}`,
      loadAverage: health.factors
    },
    clipboard: {
      totalItems: clipboard.length,
      lastItem: clipboard[0]?.timestamp
    },
    performance: {
      dataCollectionTime: profiler.measure('data-collection', undefined, 'metrics-collected')
    }
  };
  
  console.log('📊 System Health Dashboard:');
  console.log(JSON.stringify(dashboard, null, 2));
  
  return dashboard;
}

await createHealthDashboard();
```

## 📚 Module Reference

| Module | Basic Functions | Enhanced Features |
|--------|----------------|-------------------|
| **📋 Clipboard** | `writeText`, `readText`, `clear` | History tracking, HTML support, monitoring, search |
| **💻 Computer** | `getCpuInfo`, `getMemoryInfo` | Health scoring, performance monitoring, diagnostics |
| **🐛 Debug** | `info`, `warn`, `error` | Profiling, sessions, memory tracking, analytics |
| **🎯 Events** | `on`, `emit`, `off` | Middleware, aggregation, throttling, monitoring |
| **📁 Filesystem** | `readFile`, `writeFile` | Advanced search, sync, archiving, management |
| **🌐 Network** | `fetch`, `get`, `post` | Health checks, monitoring, rate limiting, uploads |
| **🛠️ Utils** | `generateUUID`, `sleep` | Circuit breakers, memoization, validation, performance |
| **💾 Storage** | `setData`, `getData` | Encryption, TTL, versioning, migrations, observability |
| **🖥️ OS** | `execCommand`, `getSystemInfo` | Process management, resource monitoring, env management |

## 🎯 Production Examples

### **Enterprise Application Setup**

```typescript
import { 
  createSecureStorage,
  createResourceMonitor,
  createProcessManager,
  createProfiler,
  getGlobalEventBus 
} from './modules';

class EnterpriseApp {
  private storage = createSecureStorage(process.env.ENCRYPTION_KEY);
  private monitor = createResourceMonitor();
  private processManager = createProcessManager();
  private profiler = createProfiler();
  private eventBus = getGlobalEventBus();
  
  async initialize() {
    // Start system monitoring
    this.monitor.start(5000);
    
    // Load encrypted configuration
    const config = await this.storage.getSecure('app-config');
    
    // Start background processes
    await this.processManager.start('log-processor', 'node ./log-processor.js');
    
    // Set up event handling
    this.eventBus.onBroadcast('system-alert', this.handleSystemAlert.bind(this));
    
    console.log('✅ Enterprise app initialized');
  }
  
  async handleSystemAlert(alert: any) {
    const systemHealth = getSystemHealthScore();
    if (systemHealth.score < 30) {
      await this.storage.setSecure('emergency-backup', await this.createBackup());
      this.eventBus.broadcast('emergency-backup-created', { timestamp: new Date() });
    }
  }
}
```

### **Development Workflow Automation**

```typescript
import { 
  watchClipboard,
  findFiles,
  createMonitoredClient,
  createSession 
} from './modules';

class DevWorkflow {
  async setupDevelopmentEnvironment() {
    const session = createSession('dev-setup');
    
    // Monitor clipboard for API endpoints
    const stopWatching = watchClipboard((content) => {
      if (content.includes('api.') || content.includes('localhost:')) {
        session.log('info', `API endpoint detected: ${content}`);
        this.testApiEndpoint(content);
      }
    });
    
    // Find and process all config files
    const configFiles = await findFiles('.', /\.(json|yaml|env)$/);
    session.log('info', `Found ${configFiles.length} config files`);
    
    // Set up monitored HTTP client for API testing
    const { client, monitor } = createMonitoredClient();
    
    return { session, stopWatching, client, monitor };
  }
  
  async testApiEndpoint(url: string) {
    try {
      const response = await NetworkUtils.isReachable(url, 3000);
      console.log(`🔗 ${url}: ${response ? '✅ Reachable' : '❌ Unreachable'}`);
    } catch (error) {
      console.error(`Failed to test ${url}:`, error);
    }
  }
}
```

## ⚡ Performance Features

- **🔄 Circuit Breakers**: Automatic failure handling and recovery
- **📊 Monitoring**: Real-time system and application metrics
- **💾 Caching**: Intelligent memoization with TTL support
- **🔄 Rate Limiting**: Protect APIs and resources from overload
- **📈 Profiling**: Detailed performance measurement and analysis
- **🔍 Health Scoring**: Automated system health assessment

## 🔒 Security Features

- **🔐 Encryption**: Secure storage with configurable encryption keys
- **✅ Validation**: Comprehensive input validation utilities
- **🛡️ Safe Operations**: Backup-first file operations
- **🔑 Environment Security**: Secure environment variable management
- **📝 Audit Logging**: Comprehensive operation logging and tracking

## 🧪 Testing

```bash
# Run the comprehensive test suite
bun run test_enhanced.ts

# Run individual module tests
bun test tests/
```

## 📖 API Documentation

Each module provides comprehensive TypeScript definitions with JSDoc comments. For detailed API documentation:

1. **IntelliSense**: Full TypeScript support with autocomplete
2. **Type Safety**: Strict typing for all functions and return values
3. **JSDoc Comments**: Detailed documentation for every function
4. **Examples**: Inline code examples in documentation

## 🛠️ Development

```bash
# Install dependencies
bun install

# Type checking
bun run check

# Run development server
bun run dev

# Build for production
bun run build
```

## 🎯 Use Cases

### **Desktop Applications**

- System monitoring dashboards
- File management tools  
- Development utilities
- System automation scripts

### **Server Applications**

- Background job processors
- System health monitoring
- Log processing and analysis
- Resource management tools

### **CLI Tools**

- Advanced command-line utilities
- System administration tools
- Development workflow automation
- File processing pipelines

### **Enterprise Applications**

- Monitoring and alerting systems
- Data processing workflows
- System integration tools
- Performance optimization utilities

## 🗺️ Roadmap

- [ ] **WebSocket Support** - Real-time communication utilities
- [ ] **Database Connectors** - Built-in database integration
- [ ] **Containerization** - Docker and container management
- [ ] **Cloud Integration** - AWS, GCP, Azure utilities
- [ ] **Machine Learning** - Basic ML utilities and integrations
- [ ] **Testing Framework** - Enhanced testing utilities
- [ ] **Plugin System** - Extensible plugin architecture

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 💡 Examples Repository

Check out the [examples repository](./examples) for complete application examples showcasing all the enhanced features.

---

**Built with ❤️ for the Bun ecosystem.** This library provides enterprise-grade foundation for building robust Bun applications with comprehensive system integration capabilities.
