import { test, expect, describe, beforeEach } from 'bun:test';
import * as debug from '../modules/debug';

describe('Debug Module', () => {
  beforeEach(() => {
    // Reset any global state
    debug.setLogLevel('info');
    debug.setEnabled(true);
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
    });

    test('should log memory usage', () => {
      expect(() => debug.logMemoryUsage('test-label')).not.toThrow();
      expect(() => debug.logMemoryUsage()).not.toThrow();
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
  });

  describe('Configuration', () => {
    test('should access debug config', () => {
      expect(typeof debug.config).toBe('object');
      expect(typeof debug.config.enabled).toBe('boolean');
      expect(typeof debug.config.level).toBe('string');
      expect(typeof debug.config.historySize).toBe('number');
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
  });
});
