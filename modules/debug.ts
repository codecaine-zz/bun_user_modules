import type { LogLevel, LogOptions } from '../types';

// Debug state
let debugEnabled = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';
let logLevel: LogLevel = 'info';

// Log history for debugging
const logHistory: Array<{
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
}> = [];

// Maximum log history entries
const MAX_LOG_HISTORY = 1000;

/**
 * Sets the debug enabled state
 */
export function setEnabled(enabled: boolean): void {
  debugEnabled = enabled;
}

/**
 * Gets the debug enabled state
 */
export function isEnabled(): boolean {
  return debugEnabled;
}

/**
 * Sets the log level
 */
export function setLogLevel(level: LogLevel): void {
  logLevel = level;
}

/**
 * Gets the current log level
 */
export function getLogLevel(): LogLevel {
  return logLevel;
}

/**
 * Checks if a log level should be output based on current log level
 */
function shouldLog(level: LogLevel): boolean {
  const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
  const currentLevelIndex = levels.indexOf(logLevel);
  const messageLevelIndex = levels.indexOf(level);
  return messageLevelIndex >= currentLevelIndex;
}

/**
 * Adds a log entry to history
 */
function addToHistory(level: LogLevel, message: string, data?: any): void {
  logHistory.push({
    level,
    message,
    timestamp: new Date(),
    data
  });
  
  // Keep history size manageable
  if (logHistory.length > MAX_LOG_HISTORY) {
    logHistory.shift();
  }
}

/**
 * Formats a log message with timestamp and level
 */
function formatMessage(level: LogLevel, message: string, options: LogOptions = {}): string {
  const { timestamp = true, prefix } = options;
  
  let formatted = '';
  
  if (timestamp) {
    formatted += `[${new Date().toISOString()}] `;
  }
  
  formatted += `[${level.toUpperCase()}] `;
  
  if (prefix) {
    formatted += `[${prefix}] `;
  }
  
  formatted += message;
  
  return formatted;
}

/**
 * Logs a debug message
 */
export function debug(message: string, data?: any, options: LogOptions = {}): void {
  if (!debugEnabled || !shouldLog('debug')) return;
  
  const formatted = formatMessage('debug', message, options);
  console.debug(formatted, data || '');
  addToHistory('debug', message, data);
}

/**
 * Logs an info message
 */
export function info(message: string, data?: any, options: LogOptions = {}): void {
  if (!debugEnabled || !shouldLog('info')) return;
  
  const formatted = formatMessage('info', message, options);
  console.info(formatted, data || '');
  addToHistory('info', message, data);
}

/**
 * Logs a warning message
 */
export function warn(message: string, data?: any, options: LogOptions = {}): void {
  if (!debugEnabled || !shouldLog('warn')) return;
  
  const formatted = formatMessage('warn', message, options);
  console.warn(formatted, data || '');
  addToHistory('warn', message, data);
}

/**
 * Logs an error message
 */
export function error(message: string, error?: Error | any, options: LogOptions = {}): void {
  if (!debugEnabled || !shouldLog('error')) return;
  
  const formatted = formatMessage('error', message, options);
  console.error(formatted, error || '');
  addToHistory('error', message, error);
}

/**
 * Generic log function
 */
export function log(level: LogLevel, message: string, data?: any, options: LogOptions = {}): void {
  switch (level) {
    case 'debug':
      debug(message, data, options);
      break;
    case 'info':
      info(message, data, options);
      break;
    case 'warn':
      warn(message, data, options);
      break;
    case 'error':
      error(message, data, options);
      break;
  }
}

/**
 * Gets the log history
 */
export function getLogHistory(level?: LogLevel, limit?: number): Array<{
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
}> {
  let filtered = logHistory;
  
  if (level) {
    filtered = logHistory.filter(entry => entry.level === level);
  }
  
  if (limit && limit > 0) {
    filtered = filtered.slice(-limit);
  }
  
  return [...filtered];
}

/**
 * Clears the log history
 */
export function clearHistory(): void {
  logHistory.length = 0;
}

/**
 * Exports log history to a string
 */
export function exportLogs(format: 'text' | 'json' = 'text'): string {
  if (format === 'json') {
    return JSON.stringify(logHistory, null, 2);
  }
  
  return logHistory
    .map(entry => {
      const timestamp = entry.timestamp.toISOString();
      const level = entry.level.toUpperCase();
      const data = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
      return `[${timestamp}] [${level}] ${entry.message}${data}`;
    })
    .join('\n');
}

/**
 * Creates a performance timer
 */
export function timer(label: string): {
  end: () => number;
  lap: (lapLabel?: string) => number;
} {
  const startTime = performance.now();
  let lastLapTime = startTime;
  
  return {
    end(): number {
      const endTime = performance.now();
      const duration = endTime - startTime;
      debug(`Timer '${label}' completed in ${duration.toFixed(2)}ms`);
      return duration;
    },
    
    lap(lapLabel?: string): number {
      const currentTime = performance.now();
      const lapDuration = currentTime - lastLapTime;
      const totalDuration = currentTime - startTime;
      
      const label2 = lapLabel ? ` - ${lapLabel}` : '';
      debug(`Timer '${label}'${label2}: lap ${lapDuration.toFixed(2)}ms, total ${totalDuration.toFixed(2)}ms`);
      
      lastLapTime = currentTime;
      return lapDuration;
    }
  };
}

/**
 * Measures the execution time of a function
 */
export async function measure<T>(
  label: string,
  fn: () => T | Promise<T>
): Promise<{ result: T; duration: number }> {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    debug(`Function '${label}' executed in ${duration.toFixed(2)}ms`);
    
    return { result, duration };
  } catch (err) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    error(`Function '${label}' failed after ${duration.toFixed(2)}ms`, err);
    throw err;
  }
}

/**
 * Creates a memory usage snapshot
 */
export function memorySnapshot(): {
  used: number;
  total: number;
  usagePercentage: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
} {
  const memUsage = process.memoryUsage();
  
  return {
    used: memUsage.rss,
    total: memUsage.rss + memUsage.heapTotal,
    usagePercentage: (memUsage.rss / (memUsage.rss + memUsage.heapTotal)) * 100,
    heapUsed: memUsage.heapUsed,
    heapTotal: memUsage.heapTotal,
    external: memUsage.external,
    arrayBuffers: memUsage.arrayBuffers
  };
}

/**
 * Logs memory usage
 */
export function logMemoryUsage(label?: string): void {
  const snapshot = memorySnapshot();
  const prefix = label ? `[${label}] ` : '';
  
  debug(`${prefix}Memory usage: ${(snapshot.used / 1024 / 1024).toFixed(2)}MB used, ${(snapshot.heapUsed / 1024 / 1024).toFixed(2)}MB heap`);
}

/**
 * Creates a logger with a specific prefix
 */
export function createLogger(prefix: string) {
  return {
    debug: (message: string, data?: any) => debug(message, data, { prefix }),
    info: (message: string, data?: any) => info(message, data, { prefix }),
    warn: (message: string, data?: any) => warn(message, data, { prefix }),
    error: (message: string, error?: any) => error(message, error, { prefix }),
    log: (level: LogLevel, message: string, data?: any) => log(level, message, data, { prefix }),
    timer: (label: string) => timer(`${prefix}:${label}`),
    measure: <T>(label: string, fn: () => T | Promise<T>) => measure(`${prefix}:${label}`, fn),
    memorySnapshot,
    logMemoryUsage: (label?: string) => logMemoryUsage(label ? `${prefix}:${label}` : prefix)
  };
}

/**
 * Traces function calls and execution times
 */
export function trace<T extends (...args: any[]) => any>(
  fn: T,
  label?: string
): T {
  const functionName = label || fn.name || 'anonymous';
  
  return ((...args: Parameters<T>) => {
    debug(`Entering function '${functionName}'`, args);
    const startTime = performance.now();
    
    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result
          .then((value) => {
            const duration = performance.now() - startTime;
            debug(`Function '${functionName}' completed in ${duration.toFixed(2)}ms`, value);
            return value;
          })
          .catch((error) => {
            const duration = performance.now() - startTime;
            error(`Function '${functionName}' failed after ${duration.toFixed(2)}ms`, error);
            throw error;
          });
      } else {
        const duration = performance.now() - startTime;
        debug(`Function '${functionName}' completed in ${duration.toFixed(2)}ms`, result);
        return result;
      }
    } catch (err) {
      const duration = performance.now() - startTime;
      error(`Function '${functionName}' failed after ${duration.toFixed(2)}ms`, err);
      throw err;
    }
  }) as T;
}

/**
 * Debug configuration
 */
export const config = {
  get enabled() { return debugEnabled; },
  set enabled(value: boolean) { setEnabled(value); },
  
  get level() { return logLevel; },
  set level(value: LogLevel) { setLogLevel(value); },
  
  get historySize() { return MAX_LOG_HISTORY; }
};

/**
 * Performance profiler for measuring execution time
 */
export class Profiler {
  private startTime: number = 0;
  private marks: Map<string, number> = new Map();
  private measures: Array<{ name: string; duration: number; timestamp: Date }> = [];
  
  /**
   * Starts the profiler
   */
  start(): void {
    this.startTime = performance.now();
    info('Profiler started');
  }
  
  /**
   * Marks a specific point in time
   */
  mark(name: string): void {
    const time = performance.now();
    this.marks.set(name, time);
    debug(`Mark '${name}' at ${time.toFixed(2)}ms`);
  }
  
  /**
   * Measures time between two marks or from start
   */
  measure(name: string, startMark?: string, endMark?: string): number {
    const endTime = endMark ? this.marks.get(endMark) || performance.now() : performance.now();
    const startTime = startMark ? this.marks.get(startMark) || this.startTime : this.startTime;
    
    const duration = endTime - startTime;
    this.measures.push({
      name,
      duration,
      timestamp: new Date()
    });
    
    info(`Measure '${name}': ${duration.toFixed(2)}ms`);
    return duration;
  }
  
  /**
   * Gets all measurements
   */
  getMeasures(): Array<{ name: string; duration: number; timestamp: Date }> {
    return [...this.measures];
  }
  
  /**
   * Clears all marks and measures
   */
  clear(): void {
    this.marks.clear();
    this.measures.length = 0;
    this.startTime = 0;
    debug('Profiler cleared');
  }
  
  /**
   * Gets profiler report
   */
  getReport(): string {
    const totalTime = performance.now() - this.startTime;
    let report = `Profiler Report (Total: ${totalTime.toFixed(2)}ms)\n`;
    report += '='.repeat(50) + '\n';
    
    this.measures.forEach(measure => {
      report += `${measure.name}: ${measure.duration.toFixed(2)}ms\n`;
    });
    
    return report;
  }
}

/**
 * Creates a new profiler instance
 */
export function createProfiler(): Profiler {
  return new Profiler();
}

/**
 * Memory usage tracker
 */
export function getMemoryUsage(): {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  rss: number;
} {
  const usage = process.memoryUsage();
  return {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100, // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100,
    external: Math.round(usage.external / 1024 / 1024 * 100) / 100,
    arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024 * 100) / 100,
    rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100
  };
}



/**
 * Creates a debug session for grouping related logs
 */
export class DebugSession {
  private sessionId: string;
  private startTime: number;
  private logs: Array<{ level: LogLevel; message: string; timestamp: Date; data?: any }> = [];
  
  constructor(name: string) {
    this.sessionId = `${name}-${Date.now()}`;
    this.startTime = performance.now();
    info(`Debug session '${name}' started (${this.sessionId})`);
  }
  
  /**
   * Logs a message within this session
   */
  log(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date();
    this.logs.push({ level, message, timestamp, data });
    
    const sessionTime = performance.now() - this.startTime;
    const prefix = `[${this.sessionId}] [+${sessionTime.toFixed(2)}ms]`;
    
    switch (level) {
      case 'debug': debug(`${prefix} ${message}`, data); break;
      case 'info': info(`${prefix} ${message}`, data); break;
      case 'warn': warn(`${prefix} ${message}`, data); break;
      case 'error': error(`${prefix} ${message}`, data); break;
    }
  }
  
  /**
   * Ends the session and returns a summary
   */
  end(): {
    sessionId: string;
    duration: number;
    logs: Array<{ level: LogLevel; message: string; timestamp: Date; data?: any }>;
  } {
    const duration = performance.now() - this.startTime;
    info(`Debug session ended (${this.sessionId}) - Duration: ${duration.toFixed(2)}ms`);
    
    return {
      sessionId: this.sessionId,
      duration,
      logs: [...this.logs]
    };
  }
}

/**
 * Creates a new debug session
 */
export function createSession(name: string): DebugSession {
  return new DebugSession(name);
}

/**
 * Exports logs to a file (for Node.js/Bun environments)
 */
export async function exportLogsToFile(filePath?: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = filePath || `debug-logs-${timestamp}.json`;
  
  const exportData = {
    timestamp: new Date(),
    logLevel,
    debugEnabled,
    logs: logHistory
  };
  
  try {
    const fs = await import('fs/promises');
    await fs.writeFile(fileName, JSON.stringify(exportData, null, 2));
    info(`Logs exported to ${fileName}`);
    return fileName;
  } catch (err) {
    error('Failed to export logs:', err);
    throw err;
  }
}

/**
 * Analyzes log patterns and provides insights
 */
export function analyzeLogPatterns(): {
  totalLogs: number;
  logsByLevel: Record<LogLevel, number>;
  errorRate: number;
  warningRate: number;
  averageLogsPerMinute: number;
  mostCommonMessages: Array<{ message: string; count: number }>;
} {
  const analysis = {
    totalLogs: logHistory.length,
    logsByLevel: { debug: 0, info: 0, warn: 0, error: 0 } as Record<LogLevel, number>,
    errorRate: 0,
    warningRate: 0,
    averageLogsPerMinute: 0,
    mostCommonMessages: [] as Array<{ message: string; count: number }>
  };
  
  if (logHistory.length === 0) return analysis;
  
  // Count logs by level
  const messageCounts = new Map<string, number>();
  
  logHistory.forEach(log => {
    analysis.logsByLevel[log.level]++;
    
    // Count message frequency
    const count = messageCounts.get(log.message) || 0;
    messageCounts.set(log.message, count + 1);
  });
  
  // Calculate rates
  analysis.errorRate = (analysis.logsByLevel.error / analysis.totalLogs) * 100;
  analysis.warningRate = (analysis.logsByLevel.warn / analysis.totalLogs) * 100;
  
  // Calculate average logs per minute
  if (logHistory.length > 1) {
    const oldestLog = logHistory[logHistory.length - 1];
    const newestLog = logHistory[0];
    if (oldestLog && newestLog) {
      const durationMinutes = (newestLog.timestamp.getTime() - oldestLog.timestamp.getTime()) / (1000 * 60);
      analysis.averageLogsPerMinute = analysis.totalLogs / Math.max(durationMinutes, 1);
    }
  }
  
  // Get most common messages
  analysis.mostCommonMessages = Array.from(messageCounts.entries())
    .map(([message, count]) => ({ message, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return analysis;
}

/**
 * Creates a debug checkpoint that can be used to measure progress
 */
export function checkpoint(name: string, data?: any): void {
  const timestamp = new Date();
  info(`Checkpoint: ${name}`, { timestamp, data });
}

/**
 * Watches for specific log patterns and triggers callbacks
 */
export function watchLogPattern(
  pattern: RegExp | string,
  callback: (log: { level: LogLevel; message: string; timestamp: Date; data?: any }) => void,
  options: { level?: LogLevel; once?: boolean } = {}
): () => void {
  let triggered = false;
  
  const originalLog = (level: LogLevel, message: string, data?: any) => {
    if (options.level && level !== options.level) return;
    if (options.once && triggered) return;
    
    const matches = typeof pattern === 'string' 
      ? message.includes(pattern)
      : pattern.test(message);
    
    if (matches) {
      triggered = true;
      callback({ level, message, timestamp: new Date(), data });
    }
  };
  
  // This is a simplified implementation - in a real scenario,
  // you'd need to hook into the actual logging system
  return () => {
    // Cleanup function
  };
}
