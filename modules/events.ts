import type { EventListener, EventEmitter } from '../types';

/**
 * Simple event emitter implementation
 */
class SimpleEventEmitter implements EventEmitter {
  protected listeners = new Map<string, EventListener[]>();
  protected onceListeners = new Map<string, EventListener[]>();

  /**
   * Adds an event listener
   */
  on<T = any>(event: string, listener: EventListener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  /**
   * Removes an event listener
   */
  off<T = any>(event: string, listener: EventListener<T>): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }

    const onceListeners = this.onceListeners.get(event);
    if (onceListeners) {
      const index = onceListeners.indexOf(listener);
      if (index !== -1) {
        onceListeners.splice(index, 1);
      }
    }
  }

  /**
   * Adds a one-time event listener
   */
  once<T = any>(event: string, listener: EventListener<T>): void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, []);
    }
    this.onceListeners.get(event)!.push(listener);
  }

  /**
   * Emits an event
   */
  emit<T = any>(event: string, data?: T): void {
    // Call regular listeners
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for '${event}':`, error);
        }
      });
    }

    // Call once listeners and remove them
    const onceListeners = this.onceListeners.get(event);
    if (onceListeners) {
      const listenersToCall = [...onceListeners];
      this.onceListeners.delete(event);
      
      listenersToCall.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in once event listener for '${event}':`, error);
        }
      });
    }
  }

  /**
   * Gets all event names that have listeners
   */
  eventNames(): string[] {
    const events = new Set<string>();
    this.listeners.forEach((_, event) => events.add(event));
    this.onceListeners.forEach((_, event) => events.add(event));
    return Array.from(events);
  }

  /**
   * Gets the number of listeners for an event
   */
  listenerCount(event: string): number {
    const regular = this.listeners.get(event)?.length || 0;
    const once = this.onceListeners.get(event)?.length || 0;
    return regular + once;
  }

  /**
   * Removes all listeners for an event, or all listeners if no event is specified
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
      this.onceListeners.delete(event);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  /**
   * Gets all listeners for an event
   */
  getListeners(event: string): EventListener[] {
    const regular = this.listeners.get(event) || [];
    const once = this.onceListeners.get(event) || [];
    return [...regular, ...once];
  }
}

// Global event emitter instance
const globalEmitter = new SimpleEventEmitter();

/**
 * Adds an event listener to the global emitter
 */
export function on<T = any>(event: string, listener: EventListener<T>): void {
  globalEmitter.on(event, listener);
}

/**
 * Removes an event listener from the global emitter
 */
export function off<T = any>(event: string, listener: EventListener<T>): void {
  globalEmitter.off(event, listener);
}

/**
 * Adds a one-time event listener to the global emitter
 */
export function once<T = any>(event: string, listener: EventListener<T>): void {
  globalEmitter.once(event, listener);
}

/**
 * Emits an event on the global emitter
 */
export function emit<T = any>(event: string, data?: T): void {
  globalEmitter.emit(event, data);
}

/**
 * Gets all event names that have listeners
 */
export function eventNames(): string[] {
  return globalEmitter.eventNames();
}

/**
 * Gets the number of listeners for an event
 */
export function listenerCount(event: string): number {
  return globalEmitter.listenerCount(event);
}

/**
 * Removes all listeners for an event, or all listeners if no event is specified
 */
export function removeAllListeners(event?: string): void {
  globalEmitter.removeAllListeners(event);
}

/**
 * Gets all listeners for an event
 */
export function getListeners(event: string): EventListener[] {
  return globalEmitter.getListeners(event);
}

/**
 * Creates a new event emitter instance
 */
export function createEventEmitter(): EventEmitter {
  return new SimpleEventEmitter();
}

/**
 * Waits for an event to be emitted and returns the data
 */
export function waitFor<T = any>(event: string, timeout?: number): Promise<T> {
  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout | undefined;
    
    const listener = (data: T) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      resolve(data);
    };
    
    once(event, listener);
    
    if (timeout && timeout > 0) {
      timeoutId = setTimeout(() => {
        off(event, listener);
        reject(new Error(`Timeout waiting for event '${event}'`));
      }, timeout);
    }
  });
}

/**
 * Creates a promise that resolves when multiple events are emitted
 */
export function waitForAll<T = any>(events: string[], timeout?: number): Promise<Record<string, T>> {
  return new Promise((resolve, reject) => {
    const results: Record<string, T> = {};
    const receivedEvents = new Set<string>();
    let timeoutId: NodeJS.Timeout | undefined;
    
    const checkComplete = () => {
      if (receivedEvents.size === events.length) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        resolve(results);
      }
    };
    
    events.forEach(event => {
      once(event, (data: T) => {
        results[event] = data;
        receivedEvents.add(event);
        checkComplete();
      });
    });
    
    if (timeout && timeout > 0) {
      timeoutId = setTimeout(() => {
        events.forEach(event => {
          if (!receivedEvents.has(event)) {
            off(event, () => {}); // Remove listeners
          }
        });
        reject(new Error(`Timeout waiting for events: ${events.filter(e => !receivedEvents.has(e)).join(', ')}`));
      }, timeout);
    }
  });
}

/**
 * Creates an event listener that only fires after a certain number of emissions
 */
export function threshold<T = any>(event: string, count: number, listener: EventListener<T>): void {
  let currentCount = 0;
  
  const thresholdListener = (data: T) => {
    currentCount++;
    if (currentCount >= count) {
      off(event, thresholdListener);
      listener(data);
    }
  };
  
  on(event, thresholdListener);
}

/**
 * Creates an event listener with debouncing (only fires after a delay with no new events)
 */
export function debounce<T = any>(event: string, delay: number, listener: EventListener<T>): void {
  let timeoutId: NodeJS.Timeout | undefined;
  
  const debouncedListener = (data: T) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      listener(data);
    }, delay);
  };
  
  on(event, debouncedListener);
}

/**
 * Creates an event listener with throttling (only fires at most once per interval)
 */
export function throttle<T = any>(event: string, interval: number, listener: EventListener<T>): void {
  let lastFired = 0;
  
  const throttledListener = (data: T) => {
    const now = Date.now();
    if (now - lastFired >= interval) {
      lastFired = now;
      listener(data);
    }
  };
  
  on(event, throttledListener);
}

/**
 * Creates an event proxy that forwards events from one emitter to another
 */
export function proxy(fromEmitter: SimpleEventEmitter, toEmitter: SimpleEventEmitter, eventMap?: Record<string, string>): void {
  const events = fromEmitter.eventNames();
  
  events.forEach((event: string) => {
    const targetEvent = eventMap?.[event] || event;
    
    fromEmitter.on(event, (data: any) => {
      toEmitter.emit(targetEvent, data);
    });
  });
}

/**
 * System events (predefined event types)
 */
export const SystemEvents = {
  APP_READY: 'app:ready',
  APP_EXIT: 'app:exit',
  FILE_CHANGED: 'file:changed',
  PROCESS_SPAWNED: 'process:spawned',
  PROCESS_EXITED: 'process:exited',
  NETWORK_REQUEST: 'network:request',
  NETWORK_RESPONSE: 'network:response',
  STORAGE_SET: 'storage:set',
  STORAGE_GET: 'storage:get',
  STORAGE_REMOVE: 'storage:remove',
  CLIPBOARD_CHANGED: 'clipboard:changed',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  DEBUG: 'debug'
} as const;

/**
 * Emits a system event with structured data
 */
export function emitSystemEvent(type: keyof typeof SystemEvents, data?: any): void {
  emit(SystemEvents[type], {
    type: SystemEvents[type],
    timestamp: Date.now(),
    data
  });
}

/**
 * Advanced event emitter with middleware support
 */
export class AdvancedEventEmitter extends SimpleEventEmitter {
  private middleware: Array<(event: string, data: any, next: () => void) => void> = [];
  private maxListeners: number = 10;
  
  /**
   * Adds middleware that runs before event emission
   */
  use(middleware: (event: string, data: any, next: () => void) => void): void {
    this.middleware.push(middleware);
  }
  
  /**
   * Sets maximum number of listeners per event
   */
  setMaxListeners(max: number): void {
    this.maxListeners = max;
  }
  
  /**
   * Emits an event through middleware chain
   */
  override emit<T = any>(event: string, data?: T): void {
    let index = 0;
    
    const next = () => {
      if (index < this.middleware.length) {
        const middleware = this.middleware[index++];
        middleware?.(event, data, next);
      } else {
        // Execute original emit after middleware
        super.emit(event, data);
      }
    };
    
    next();
  }
  
  /**
   * Gets listener count for an event
   */
  override listenerCount(event: string): number {
    const listeners = this.listeners.get(event) || [];
    const onceListeners = this.onceListeners.get(event) || [];
    return listeners.length + onceListeners.length;
  }
  
  /**
   * Lists all events with listeners
   */
  override eventNames(): string[] {
    const events = new Set<string>();
    this.listeners.forEach((_, event) => events.add(event));
    this.onceListeners.forEach((_, event) => events.add(event));
    return Array.from(events);
  }
}

/**
 * Event aggregator for complex event handling
 */
export class EventAggregator {
  private emitter = new AdvancedEventEmitter();
  private subscriptions = new Map<string, () => void>();
  
  /**
   * Subscribes to an event with automatic cleanup
   */
  subscribe<T = any>(event: string, listener: EventListener<T>): string {
    const id = `${event}_${Date.now()}_${Math.random()}`;
    this.emitter.on(event, listener);
    
    this.subscriptions.set(id, () => {
      this.emitter.off(event, listener);
    });
    
    return id;
  }
  
  /**
   * Unsubscribes using subscription ID
   */
  unsubscribe(subscriptionId: string): void {
    const cleanup = this.subscriptions.get(subscriptionId);
    if (cleanup) {
      cleanup();
      this.subscriptions.delete(subscriptionId);
    }
  }
  
  /**
   * Publishes an event
   */
  publish<T = any>(event: string, data?: T): void {
    this.emitter.emit(event, data);
  }
  
  /**
   * Clears all subscriptions
   */
  clear(): void {
    this.subscriptions.forEach(cleanup => cleanup());
    this.subscriptions.clear();
  }
  
  /**
   * Gets subscription count
   */
  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }
}

/**
 * Creates a throttled event emitter
 */
export function createThrottledEmitter(delay: number = 100): {
  emit: (event: string, data?: any) => void;
  on: (event: string, listener: EventListener) => void;
  off: (event: string, listener: EventListener) => void;
} {
  const emitter = new SimpleEventEmitter();
  const throttleMap = new Map<string, NodeJS.Timeout>();
  
  return {
    emit(event: string, data?: any) {
      const existing = throttleMap.get(event);
      if (existing) {
        clearTimeout(existing);
      }
      
      const timeout = setTimeout(() => {
        emitter.emit(event, data);
        throttleMap.delete(event);
      }, delay);
      
      throttleMap.set(event, timeout);
    },
    
    on(event: string, listener: EventListener) {
      emitter.on(event, listener);
    },
    
    off(event: string, listener: EventListener) {
      emitter.off(event, listener);
    }
  };
}

/**
 * Creates a debounced event emitter
 */
export function createDebouncedEmitter(delay: number = 300): {
  emit: (event: string, data?: any) => void;
  on: (event: string, listener: EventListener) => void;
  off: (event: string, listener: EventListener) => void;
} {
  const emitter = new SimpleEventEmitter();
  const debounceMap = new Map<string, { timeout: NodeJS.Timeout; data: any }>();
  
  return {
    emit(event: string, data?: any) {
      const existing = debounceMap.get(event);
      if (existing) {
        clearTimeout(existing.timeout);
      }
      
      const timeout = setTimeout(() => {
        emitter.emit(event, data);
        debounceMap.delete(event);
      }, delay);
      
      debounceMap.set(event, { timeout, data });
    },
    
    on(event: string, listener: EventListener) {
      emitter.on(event, listener);
    },
    
    off(event: string, listener: EventListener) {
      emitter.off(event, listener);
    }
  };
}

/**
 * Event bus for global application events
 */
class GlobalEventBus extends AdvancedEventEmitter {
  private static instance: GlobalEventBus;
  
  static getInstance(): GlobalEventBus {
    if (!GlobalEventBus.instance) {
      GlobalEventBus.instance = new GlobalEventBus();
    }
    return GlobalEventBus.instance;
  }
  
  /**
   * Broadcasts to all listeners
   */
  broadcast<T = any>(event: string, data?: T): void {
    this.emit(`broadcast:${event}`, data);
  }
  
  /**
   * Subscribes to broadcast events
   */
  onBroadcast<T = any>(event: string, listener: EventListener<T>): void {
    this.on(`broadcast:${event}`, listener);
  }
}

/**
 * Gets the global event bus instance
 */
export function getGlobalEventBus(): GlobalEventBus {
  return GlobalEventBus.getInstance();
}

/**
 * Promise-based event waiting
 */
export function waitForEvent<T = any>(
  emitter: SimpleEventEmitter,
  event: string,
  timeout?: number
): Promise<T> {
  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout | undefined;
    
    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
    
    const handler = (data: T) => {
      cleanup();
      resolve(data);
    };
    
    emitter.once(event, handler);
    
    if (timeout) {
      timeoutId = setTimeout(() => {
        emitter.off(event, handler);
        reject(new Error(`Event '${event}' timeout after ${timeout}ms`));
      }, timeout);
    }
  });
}

/**
 * Event statistics and monitoring
 */
export class EventStats {
  private eventCounts = new Map<string, number>();
  private lastEmission = new Map<string, Date>();
  private totalEvents = 0;
  
  /**
   * Records an event emission
   */
  recordEvent(event: string): void {
    this.eventCounts.set(event, (this.eventCounts.get(event) || 0) + 1);
    this.lastEmission.set(event, new Date());
    this.totalEvents++;
  }
  
  /**
   * Gets statistics for all events
   */
  getStats(): {
    totalEvents: number;
    eventCounts: Record<string, number>;
    mostFrequent: Array<{ event: string; count: number }>;
    recentEvents: Array<{ event: string; lastEmission: Date }>;
  } {
    const eventCounts: Record<string, number> = {};
    this.eventCounts.forEach((count, event) => {
      eventCounts[event] = count;
    });
    
    const mostFrequent = Array.from(this.eventCounts.entries())
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    const recentEvents = Array.from(this.lastEmission.entries())
      .map(([event, lastEmission]) => ({ event, lastEmission }))
      .sort((a, b) => b.lastEmission.getTime() - a.lastEmission.getTime())
      .slice(0, 10);
    
    return {
      totalEvents: this.totalEvents,
      eventCounts,
      mostFrequent,
      recentEvents
    };
  }
  
  /**
   * Resets all statistics
   */
  reset(): void {
    this.eventCounts.clear();
    this.lastEmission.clear();
    this.totalEvents = 0;
  }
}

/**
 * Creates an event emitter with built-in statistics
 */
export function createMonitoredEmitter(): {
  emitter: SimpleEventEmitter;
  stats: EventStats;
} {
  const emitter = new SimpleEventEmitter();
  const stats = new EventStats();
  
  // Override emit to record statistics
  const originalEmit = emitter.emit.bind(emitter);
  emitter.emit = function<T = any>(event: string, data?: T): void {
    stats.recordEvent(event);
    originalEmit(event, data);
  };
  
  return { emitter, stats };
}
