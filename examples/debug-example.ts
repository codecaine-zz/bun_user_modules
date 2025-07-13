#!/usr/bin/env bun
/**
 * Debug Module Example
 * Demonstrates logging, performance measurement, memory monitoring, and debugging tools
 */

import { debug } from '../index';

async function runDebugExample() {
  console.log('🐛 Debug Module Example\n');

  // Basic logging at different levels
  console.log('📝 Basic Logging:');
  debug.info('This is an info message');
  debug.warn('This is a warning message');
  debug.error('This is an error message');
  debug.debug('This is a debug message (may not show if level too high)');

  // Log level management
  console.log('\n🎚️ Log Level Management:');
  console.log('Current log level:', debug.getLogLevel());
  
  debug.setLogLevel('debug');
  debug.debug('Debug message now visible');
  
  debug.setLogLevel('info');
  debug.debug('Debug message now hidden');

  // Structured logging with data
  console.log('\n📊 Structured Logging:');
  debug.info('User login', { 
    userId: 123, 
    email: 'user@example.com', 
    timestamp: new Date().toISOString() 
  });

  // Performance measurement with timers
  console.log('\n⏱️ Performance Measurement:');
  debug.timer('database-query');
  
  // Simulate some work
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const elapsed = debug.timer('database-query');
  console.log('Database query took:', elapsed, 'ms');

  // Function execution measurement
  console.log('\n🚀 Function Measurement:');
  const slowFunction = async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return 'Function completed';
  };

  const result = await debug.measure('slow-operation', slowFunction);
  console.log('Function result:', result);

  // Memory monitoring
  console.log('\n🧠 Memory Monitoring:');
  const memoryBefore = debug.memorySnapshot();
  console.log('Memory before allocation:', {
    used: Math.round(memoryBefore.used / 1024 / 1024 * 100) / 100 + ' MB',
    heapUsed: Math.round(memoryBefore.heapUsed / 1024 / 1024 * 100) / 100 + ' MB'
  });

  // Allocate some memory
  const largeArray = new Array(100000).fill('test data');
  
  debug.logMemoryUsage('After allocation');

  // Function tracing
  console.log('\n🔍 Function Tracing:');
  const tracedFunction = debug.trace((x: number, y: number) => {
    return x + y;
  }, 'add-function');

  const sum = tracedFunction(5, 3);
  console.log('Traced function result:', sum);

  // Async function tracing
  const asyncTracedFunction = debug.trace(async (delay: number) => {
    await new Promise(resolve => setTimeout(resolve, delay));
    return `Completed after ${delay}ms`;
  }, 'async-function');

  const asyncResult = await asyncTracedFunction(30);
  console.log('Async traced result:', asyncResult);

  // Log history and filtering
  console.log('\n📚 Log History:');
  const recentLogs = debug.getLogHistory(undefined, 5);
  console.log('Recent logs count:', recentLogs.length);

  const errorLogs = debug.getLogHistory('error', 10);
  console.log('Recent error logs:', errorLogs.length);

  // Creating a prefixed logger
  console.log('\n🏷️ Prefixed Loggers:');
  const apiLogger = debug.createLogger('API');
  const dbLogger = debug.createLogger('DATABASE');

  apiLogger.info('Request received', { endpoint: '/users', method: 'GET' });
  dbLogger.warn('Slow query detected', { duration: 1500, query: 'SELECT * FROM users' });

  // Logging state management
  console.log('\n🔧 Logging Control:');
  debug.setEnabled(true);
  debug.info('Logging enabled');
  
  debug.setEnabled(false);
  debug.info('This message should not appear');
  
  debug.setEnabled(true);
  debug.info('Logging re-enabled');

  // Configuration
  console.log('\n⚙️ Debug Configuration:');
  const config = debug.config;
  console.log('Debug config enabled:', config.enabled);

  // Log export for analysis
  console.log('\n📤 Log Export:');
  const exportedLogs = debug.exportLogs();
  console.log('Exported logs sample:', exportedLogs.slice(0, 2));

  // Performance comparison
  console.log('\n📈 Performance Comparison:');
  
  // Measure multiple implementations
  const implementations = {
    'forEach': (arr: number[]) => {
      let sum = 0;
      arr.forEach(n => sum += n);
      return sum;
    },
    'reduce': (arr: number[]) => {
      return arr.reduce((sum, n) => sum + n, 0);
    },
    'for-loop': (arr: number[]) => {
      let sum = 0;
      for (let i = 0; i < arr.length; i++) {
        sum += arr[i] || 0;
      }
      return sum;
    }
  };

  const testArray = Array.from({ length: 10000 }, (_, i) => i);
  
  for (const [name, impl] of Object.entries(implementations)) {
    const startTime = debug.timer(`implementation-${name}`);
    impl(testArray);
    const endTime = debug.timer(`implementation-${name}`);
    console.log(`${name}: ${endTime}ms`);
  }

  // Debug session for grouped operations
  console.log('\n📋 Debug Session:');
  const session = new debug.DebugSession('user-registration');
  
  session.log('debug', 'Validating user input');
  session.log('info', 'Creating user account');
  session.log('warn', 'Password strength could be improved');
  session.log('info', 'User registration completed');
  
  const sessionSummary = session.end();
  console.log('Session duration:', sessionSummary.duration.toFixed(2), 'ms');
  console.log('Session logs count:', sessionSummary.logs.length);

  // Memory cleanup
  largeArray.splice(0); // Clear the large array

  console.log('\n✅ Debug module example completed!');
}

// Run the example
if (import.meta.main) {
  await runDebugExample();
}
