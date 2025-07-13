import { test, expect, describe, beforeEach, afterEach } from 'bun:test';
import * as events from '../modules/events';

describe('Events Module', () => {
  beforeEach(() => {
    // Clear all listeners before each test
    events.removeAllListeners();
  });

  afterEach(() => {
    // Clean up after each test
    events.removeAllListeners();
  });

  describe('Basic Event Operations', () => {
    test('should add and emit events', () => {
      let received: any = null;
      
      events.on('test', (data) => {
        received = data;
      });
      
      events.emit('test', 'hello world');
      expect(received).toBe('hello world');
    });

    test('should handle multiple listeners', () => {
      const results: string[] = [];
      
      events.on('multi', (data) => results.push(`listener1: ${data}`));
      events.on('multi', (data) => results.push(`listener2: ${data}`));
      
      events.emit('multi', 'test');
      
      expect(results).toEqual([
        'listener1: test',
        'listener2: test'
      ]);
    });

    test('should remove listeners', () => {
      let received: any = null;
      
      const listener = (data: any) => {
        received = data;
      };
      
      events.on('remove-test', listener);
      events.emit('remove-test', 'first');
      expect(received).toBe('first');
      
      events.off('remove-test', listener);
      events.emit('remove-test', 'second');
      expect(received).toBe('first'); // Should not change
    });

    test('should handle once listeners', () => {
      let count = 0;
      
      events.once('once-test', () => {
        count++;
      });
      
      events.emit('once-test');
      events.emit('once-test');
      events.emit('once-test');
      
      expect(count).toBe(1);
    });
  });

  describe('Event Utilities', () => {
    test('should get event names', () => {
      events.on('event1', () => {});
      events.on('event2', () => {});
      events.once('event3', () => {});
      
      const names = events.eventNames();
      expect(names.sort()).toEqual(['event1', 'event2', 'event3']);
    });

    test('should count listeners', () => {
      events.on('count-test', () => {});
      events.on('count-test', () => {});
      events.once('count-test', () => {});
      
      expect(events.listenerCount('count-test')).toBe(3);
      expect(events.listenerCount('nonexistent')).toBe(0);
    });

    test('should remove all listeners for specific event', () => {
      events.on('remove-all-1', () => {});
      events.on('remove-all-1', () => {});
      events.on('remove-all-2', () => {});
      
      expect(events.listenerCount('remove-all-1')).toBe(2);
      expect(events.listenerCount('remove-all-2')).toBe(1);
      
      events.removeAllListeners('remove-all-1');
      
      expect(events.listenerCount('remove-all-1')).toBe(0);
      expect(events.listenerCount('remove-all-2')).toBe(1);
    });

    test('should remove all listeners globally', () => {
      events.on('global-1', () => {});
      events.on('global-2', () => {});
      
      expect(events.eventNames().length).toBe(2);
      
      events.removeAllListeners();
      
      expect(events.eventNames().length).toBe(0);
    });
  });

  describe('Advanced Event Features', () => {
    test('should wait for event', async () => {
      setTimeout(() => {
        events.emit('wait-test', 'waited-data');
      }, 10);
      
      const result = await events.waitFor('wait-test');
      expect(result).toBe('waited-data');
    });

    test('should timeout when waiting for event', async () => {
      const promise = events.waitFor('timeout-test', 50);
      
      await expect(promise).rejects.toThrow("Timeout waiting for event 'timeout-test'");
    });

    test('should wait for multiple events', async () => {
      setTimeout(() => {
        events.emit('multi-1', 'data1');
        events.emit('multi-2', 'data2');
      }, 10);
      
      const results = await events.waitForAll(['multi-1', 'multi-2']);
      
      expect(results).toEqual({
        'multi-1': 'data1',
        'multi-2': 'data2'
      });
    });

    test('should handle threshold events', (done) => {
      let callCount = 0;
      
      events.threshold('threshold-test', 3, () => {
        callCount++;
        expect(callCount).toBe(1);
        done();
      });
      
      // Should not trigger until 3rd emission
      events.emit('threshold-test');
      events.emit('threshold-test');
      expect(callCount).toBe(0);
      
      events.emit('threshold-test'); // This should trigger
    });

    test('should debounce events', (done) => {
      let callCount = 0;
      
      events.debounce('debounce-test', 50, () => {
        callCount++;
        expect(callCount).toBe(1);
        done();
      });
      
      // Rapid emissions should only result in one call
      events.emit('debounce-test');
      events.emit('debounce-test');
      events.emit('debounce-test');
      
      expect(callCount).toBe(0); // Should not have been called yet
    });

    test('should throttle events', (done) => {
      let callCount = 0;
      
      events.throttle('throttle-test', 50, () => {
        callCount++;
      });
      
      // First call should go through immediately
      events.emit('throttle-test');
      expect(callCount).toBe(1);
      
      // Subsequent calls within interval should be ignored
      events.emit('throttle-test');
      events.emit('throttle-test');
      expect(callCount).toBe(1);
      
      // After interval, should allow another call
      setTimeout(() => {
        events.emit('throttle-test');
        expect(callCount).toBe(2);
        done();
      }, 60);
    });
  });

  describe('Event Emitter Creation', () => {
    test('should create independent event emitters', () => {
      const emitter1 = events.createEventEmitter();
      const emitter2 = events.createEventEmitter();
      
      let count1 = 0;
      let count2 = 0;
      
      emitter1.on('test', () => count1++);
      emitter2.on('test', () => count2++);
      
      emitter1.emit('test');
      expect(count1).toBe(1);
      expect(count2).toBe(0);
      
      emitter2.emit('test');
      expect(count1).toBe(1);
      expect(count2).toBe(1);
    });
  });

  describe('System Events', () => {
    test('should emit system events with structured data', () => {
      let received: any = null;
      
      events.on(events.SystemEvents.APP_READY, (data) => {
        received = data;
      });
      
      events.emitSystemEvent('APP_READY', { message: 'app is ready' });
      
      expect(received).toMatchObject({
        type: 'app:ready',
        timestamp: expect.any(Number),
        data: { message: 'app is ready' }
      });
    });

    test('should have all expected system events', () => {
      expect(events.SystemEvents.APP_READY).toBe('app:ready');
      expect(events.SystemEvents.APP_EXIT).toBe('app:exit');
      expect(events.SystemEvents.FILE_CHANGED).toBe('file:changed');
      expect(events.SystemEvents.ERROR).toBe('error');
      expect(events.SystemEvents.INFO).toBe('info');
    });
  });

  describe('Error Handling', () => {
    test('should handle errors in event listeners gracefully', () => {
      const originalConsoleError = console.error;
      let errorCalled = false;
      
      console.error = (...args: any[]) => {
        errorCalled = true;
        expect(args[0]).toContain("Error in event listener for 'error-test'");
        expect(args[1]).toBeInstanceOf(Error);
      };
      
      events.on('error-test', () => {
        throw new Error('Test error');
      });
      
      events.on('error-test', () => {
        // This listener should still be called
      });
      
      // Should not throw
      expect(() => events.emit('error-test')).not.toThrow();
      expect(errorCalled).toBe(true);
      
      console.error = originalConsoleError;
    });
  });
});
