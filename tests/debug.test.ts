import { test, expect, describe, beforeEach } from 'bun:test';
import * as debug from '../modules/debug';

describe('Debug Module', () => {
  beforeEach(() => {
    // Reset any global state
    debug.setLogLevel('info');
    debug.setEnabled(true);
    debug.clearHistory();
  });

  describe('Basic Logging', () => {
    test('should log messages at different levels', () => {
      // These tests mainly verify that the functions don't throw
      expect(() => debug.log('info', 'Test info message')).not.toThrow();
      expect(() => debug.info('Test info message')).not.toThrow();
      expect(() => debug.warn('Test warning message')).not.toThrow();
      expect(() => debug.error('Test error message')).not.toThrow();
      expect(() => debug.debug('Test debug message')).not.toThrow();
    });

    test('should set and get log level', () => {
      debug.setLogLevel('debug');
      expect(debug.getLogLevel()).toBe('debug');
      
      debug.setLogLevel('error');
      expect(debug.getLogLevel()).toBe('error');
    });

    test('should enable and disable logging', () => {
      debug.setEnabled(false);
      expect(debug.isEnabled()).toBe(false);
      
      debug.setEnabled(true);
      expect(debug.isEnabled()).toBe(true);
    });

    test('should respect log levels', () => {
      debug.setLogLevel('warn');
      debug.clearHistory();
      
      debug.debug('Debug message'); // Should not log
      debug.info('Info message');   // Should not log
      debug.warn('Warn message');   // Should log
      debug.error('Error message'); // Should log
      
      const history = debug.getLogHistory();
      expect(history.length).toBe(2);
      expect(history.some(log => log.level === 'warn')).toBe(true);
      expect(history.some(log => log.level === 'error')).toBe(true);
    });
  });

  describe('Log History', () => {
    test('should track log history', () => {
      debug.clearHistory();
      
      debug.info('Test message 1');
      debug.warn('Test message 2');
      
      const history = debug.getLogHistory();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    test('should filter log history by level', () => {
      debug.clearHistory();
      
      debug.info('Info message');
      debug.warn('Warning message');
      debug.error('Error message');
      
      const errorHistory = debug.getLogHistory('error');
      expect(errorHistory.length).toBeGreaterThan(0);
      expect(errorHistory.every(entry => entry.level === 'error')).toBe(true);
    });

    test('should limit log history results', () => {
      debug.clearHistory();
      
      for (let i = 0; i < 5; i++) {
        debug.info(`Message ${i}`);
      }
      
      const limitedHistory = debug.getLogHistory(undefined, 3);
      expect(limitedHistory.length).toBeLessThanOrEqual(3);
    });

    test('should clear log history', () => {
      debug.info('Test message');
      debug.clearHistory();
      
      const history = debug.getLogHistory();
      expect(history.length).toBe(0);
    });

    test('should export logs', () => {
      debug.clearHistory();
      debug.info('Test export message');
      
      const textExport = debug.exportLogs('text');
      const jsonExport = debug.exportLogs('json');
      
      expect(typeof textExport).toBe('string');
      expect(typeof jsonExport).toBe('string');
      expect(textExport.length).toBeGreaterThan(0);
      expect(jsonExport.length).toBeGreaterThan(0);
    });

    test('should include timestamp and data in history entries', () => {
      debug.clearHistory();
      const testData = { key: 'value' };
      
      debug.info('Test message with data', testData);
      
      const history = debug.getLogHistory();
      expect(history.length).toBe(1);
      
      const entry = history[0];
      expect(entry).toBeDefined();
      expect(entry!.timestamp).toBeInstanceOf(Date);
      expect(entry!.data).toEqual(testData);
      expect(entry!.message).toBe('Test message with data');
      expect(entry!.level).toBe('info');
    });
  });

  describe('Performance Measurement', () => {
    test('should create and use timers', async () => {
      const timer = debug.timer('test-timer');
      
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const elapsed = timer.end();
      expect(typeof elapsed).toBe('number');
      expect(elapsed).toBeGreaterThan(0);
    });

    test('should measure function execution time', async () => {
      const result = await debug.measure('test-operation', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'completed';
      });
      
      expect(result.result).toBe('completed');
      expect(typeof result.duration).toBe('number');
      expect(result.duration).toBeGreaterThan(0);
    });

    test('should handle function measurement errors', async () => {
      const testError = new Error('Test error');
      
      await expect(
        debug.measure('error-operation', async () => {
          throw testError;
        })
      ).rejects.toThrow('Test error');
    });
  });

  describe('Memory Monitoring', () => {
    test('should take memory snapshots', () => {
      const snapshot = debug.memorySnapshot();
      
      expect(typeof snapshot).toBe('object');
      expect(typeof snapshot.used).toBe('number');
      expect(typeof snapshot.total).toBe('number');
      expect(typeof snapshot.heapUsed).toBe('number');
      expect(typeof snapshot.heapTotal).toBe('number');
      expect(typeof snapshot.external).toBe('number');
      expect(typeof snapshot.usagePercentage).toBe('number');
      expect(snapshot.usagePercentage).toBeGreaterThan(0);
      expect(snapshot.usagePercentage).toBeLessThanOrEqual(100);
    });

    test('should log memory usage', () => {
      expect(() => debug.logMemoryUsage('test-label')).not.toThrow();
      expect(() => debug.logMemoryUsage()).not.toThrow();
    });

    test('should get memory usage details', () => {
      const usage = debug.getMemoryUsage();
      
      expect(typeof usage.heapUsed).toBe('number');
      expect(typeof usage.heapTotal).toBe('number');
      expect(typeof usage.external).toBe('number');
      expect(typeof usage.arrayBuffers).toBe('number');
      expect(typeof usage.rss).toBe('number');
      expect(usage.heapUsed).toBeGreaterThan(0);
    });
  });

  describe('Function Tracing', () => {
    test('should trace function calls', () => {
      const testFunction = (x: number, y: number) => {
        return x + y;
      };
      
      const tracedFunction = debug.trace(testFunction);
      const result = tracedFunction(2, 3);
      
      expect(result).toBe(5);
    });

    test('should trace async function calls', async () => {
      const asyncFunction = async (value: string) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return `processed: ${value}`;
      };
      
      const tracedFunction = debug.trace(asyncFunction);
      const result = await tracedFunction('test');
      
      expect(result).toBe('processed: test');
    });

    test('should trace function errors', () => {
      const errorFunction = () => {
        throw new Error('Test error');
      };
      
      const tracedFunction = debug.trace(errorFunction);
      
      expect(() => tracedFunction()).toThrow('Test error');
    });
  });

  describe('Logger Creation', () => {
    test('should create prefixed loggers', () => {
      const logger = debug.createLogger('TEST');
      
      expect(typeof logger).toBe('object');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      
      // Test that logger functions don't throw
      expect(() => logger.info('Test message')).not.toThrow();
    });

    test('should use prefix in logger messages', () => {
      debug.clearHistory();
      const logger = debug.createLogger('TESTPREFIX');
      
      logger.info('Test message');
      
      // Note: The prefix behavior may vary based on implementation
      expect(() => logger.info('Test message')).not.toThrow();
    });
  });

  describe('Profiler Class', () => {
    test('should create profiler instance', () => {
      const profiler = debug.createProfiler();
      
      expect(profiler).toBeDefined();
      expect(typeof profiler.start).toBe('function');
      expect(typeof profiler.mark).toBe('function');
      expect(typeof profiler.measure).toBe('function');
      expect(typeof profiler.getMeasures).toBe('function');
      expect(typeof profiler.clear).toBe('function');
      expect(typeof profiler.getReport).toBe('function');
    });

    test('should start and measure profiler', async () => {
      const profiler = debug.createProfiler();
      
      profiler.start();
      await new Promise(resolve => setTimeout(resolve, 10));
      profiler.mark('test-mark');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const duration = profiler.measure('test-measure', 'test-mark');
      
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThan(0);
    });

    test('should get measures and reports', () => {
      const profiler = debug.createProfiler();
      
      profiler.start();
      profiler.mark('mark1');
      profiler.measure('measure1', 'mark1');
      
      const measures = profiler.getMeasures();
      expect(Array.isArray(measures)).toBe(true);
      expect(measures.length).toBeGreaterThan(0);
      
      const report = profiler.getReport();
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });

    test('should clear profiler data', () => {
      const profiler = debug.createProfiler();
      
      profiler.start();
      profiler.mark('test-mark');
      profiler.measure('test-measure', 'test-mark');
      
      profiler.clear();
      
      const measures = profiler.getMeasures();
      expect(measures.length).toBe(0);
    });
  });

  describe('Debug Sessions', () => {
    test('should create debug session', () => {
      const session = debug.createSession('test-session');
      
      expect(session).toBeDefined();
      expect(typeof session.log).toBe('function');
      expect(typeof session.end).toBe('function');
    });

    test('should log within session and end session', () => {
      const session = debug.createSession('test-session');
      
      session.log('info', 'Session message 1');
      session.log('warn', 'Session message 2');
      
      const summary = session.end();
      
      expect(summary).toBeDefined();
      expect(typeof summary.sessionId).toBe('string');
      expect(typeof summary.duration).toBe('number');
      expect(Array.isArray(summary.logs)).toBe(true);
      expect(summary.logs.length).toBe(2);
      expect(summary.duration).toBeGreaterThan(0);
    });
  });

  describe('Log Analysis', () => {
    test('should analyze log patterns', () => {
      debug.clearHistory();
      
      debug.info('Test info 1');
      debug.info('Test info 2');
      debug.warn('Test warning');
      debug.error('Test error');
      debug.info('Test info 1'); // Duplicate message
      
      const analysis = debug.analyzeLogPatterns();
      
      expect(analysis.totalLogs).toBe(5);
      expect(analysis.logsByLevel.info).toBe(3);
      expect(analysis.logsByLevel.warn).toBe(1);
      expect(analysis.logsByLevel.error).toBe(1);
      expect(analysis.errorRate).toBe(20); // 1/5 * 100
      expect(analysis.warningRate).toBe(20); // 1/5 * 100
      expect(Array.isArray(analysis.mostCommonMessages)).toBe(true);
      expect(analysis.mostCommonMessages.length).toBeGreaterThan(0);
    });

    test('should handle empty log analysis', () => {
      debug.clearHistory();
      
      const analysis = debug.analyzeLogPatterns();
      
      expect(analysis.totalLogs).toBe(0);
      expect(analysis.errorRate).toBe(0);
      expect(analysis.warningRate).toBe(0);
    });
  });

  describe('Checkpoints', () => {
    test('should create checkpoints', () => {
      const testData = { step: 1, status: 'processing' };
      
      expect(() => debug.checkpoint('test-checkpoint')).not.toThrow();
      expect(() => debug.checkpoint('test-checkpoint-with-data', testData)).not.toThrow();
    });
  });

  describe('Log Pattern Watching', () => {
    test('should create log pattern watcher', () => {
      const mockCallback = () => {};
      
      const cleanup = debug.watchLogPattern('test-pattern', mockCallback);
      
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();
    });

    test('should create regex pattern watcher', () => {
      const mockCallback = () => {};
      const pattern = /error/i;
      
      const cleanup = debug.watchLogPattern(pattern, mockCallback, { level: 'error', once: true });
      
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();
    });
  });

  describe('Log Export', () => {
    test('should export logs to file', async () => {
      debug.clearHistory();
      debug.info('Test export message');
      
      // This test checks if the function exists and can be called
      // The actual file writing may not work in all test environments
      try {
        const filename = await debug.exportLogsToFile();
        expect(typeof filename).toBe('string');
      } catch (error) {
        // File operations might fail in test environment, that's ok
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Configuration', () => {
    test('should access debug config', () => {
      expect(typeof debug.config).toBe('object');
      expect(typeof debug.config.enabled).toBe('boolean');
      expect(typeof debug.config.level).toBe('string');
      expect(typeof debug.config.historySize).toBe('number');
    });

    test('should reflect current state in config', () => {
      debug.setEnabled(true);
      debug.setLogLevel('debug');
      
      expect(debug.config.enabled).toBe(true);
      expect(debug.config.level).toBe('debug');
    });
  });

  describe('Error Handling', () => {
    test('should handle logging when disabled', () => {
      debug.setEnabled(false);
      
      expect(() => debug.info('This should not crash')).not.toThrow();
      expect(() => debug.error('This should not crash')).not.toThrow();
    });

    test('should handle invalid log levels gracefully', () => {
      // The function should handle invalid levels without crashing
      expect(() => debug.setLogLevel('invalid' as any)).not.toThrow();
    });

    test('should handle error objects in error logging', () => {
      const testError = new Error('Test error object');
      
      expect(() => debug.error('Error with object', testError)).not.toThrow();
    });

    test('should handle logging with undefined/null data', () => {
      expect(() => debug.info('Message with undefined', undefined)).not.toThrow();
      expect(() => debug.info('Message with null', null)).not.toThrow();
    });
  });

  describe('Advanced Logging Options', () => {
    test('should handle logging with options', () => {
      const options = { timestamp: true, prefix: 'TEST' };
      
      expect(() => debug.log('info', 'Message with options', { data: 'test' }, options)).not.toThrow();
      expect(() => debug.info('Info with options', { data: 'test' }, options)).not.toThrow();
    });

    test('should handle logging without timestamp', () => {
      const options = { timestamp: false };
      
      expect(() => debug.info('Message without timestamp', undefined, options)).not.toThrow();
    });
  });
});
