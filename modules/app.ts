// Use Bun's optimized APIs where available
import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as os from 'os';
import type { AppConfig, CommandResult } from '../types';

const execAsync = promisify(exec);

// Helper function to execute commands using Bun when available
async function execCommand(command: string): Promise<void> {
  if (typeof Bun !== 'undefined' && Bun.spawn) {
    // Use Bun's spawn for better performance
    const proc = Bun.spawn(['sh', '-c', command], {
      stdout: 'ignore',
      stderr: 'ignore'
    });
    await proc.exited;
  } else {
    // Fallback to Node.js exec
    await execAsync(command);
  }
}

// Global app configuration
let appConfig: AppConfig = {
  name: 'BunApp',
  version: '1.0.0',
  description: 'A Bun application',
  author: 'Developer',
  platform: process.platform,
  arch: process.arch,
  dataPath: path.join(os.homedir(), '.bun-app'),
  configPath: path.join(os.homedir(), '.bun-app', 'config.json'),
  logPath: path.join(os.homedir(), '.bun-app', 'logs'),
  tempPath: os.tmpdir(),
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production'
};

/**
 * Gets the current application configuration
 */
export function getConfig(): AppConfig {
  return { ...appConfig };
}

/**
 * Updates the application configuration
 */
export function setConfig(config: Partial<AppConfig>): void {
  appConfig = { ...appConfig, ...config };
}

/**
 * Gets the current working directory
 */
export function getCurrentWorkingDirectory(): string {
  return process.cwd();
}

/**
 * Sets the current working directory
 */
export function setCurrentWorkingDirectory(path: string): void {
  process.chdir(path);
}

/**
 * Gets environment variables
 */
export function getEnvironmentVariables(): Record<string, string | undefined> {
  return process.env;
}

/**
 * Gets a specific environment variable
 */
export function getEnvironmentVariable(name: string, defaultValue?: string): string | undefined {
  return process.env[name] || defaultValue;
}

/**
 * Sets an environment variable
 */
export function setEnvironmentVariable(name: string, value: string): void {
  process.env[name] = value;
}

/**
 * Gets command line arguments
 */
export function getCommandLineArguments(): string[] {
  return process.argv.slice(2);
}

/**
 * Gets parsed command line arguments as key-value pairs
 */
export function getParsedArguments(): Record<string, string | boolean> {
  const args = getCommandLineArguments();
  const parsed: Record<string, string | boolean> = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg?.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      
      if (nextArg && !nextArg.startsWith('-')) {
        parsed[key] = nextArg;
        i++; // Skip next argument
      } else {
        parsed[key] = true;
      }
    } else if (arg?.startsWith('-')) {
      const key = arg.slice(1);
      parsed[key] = true;
    }
  }
  
  return parsed;
}

/**
 * Exits the application with an optional exit code
 */
export function exit(code: number = 0): never {
  process.exit(code);
}

/**
 * Restarts the application
 */
export async function restart(): Promise<void> {
  const execPath = process.execPath;
  const args = process.argv.slice(1);
  
  spawn(execPath, args, {
    detached: true,
    stdio: 'inherit'
  }).unref();
  
  exit(0);
}

/**
 * Gets the application's process ID
 */
export function getProcessId(): number {
  return process.pid;
}

/**
 * Gets the parent process ID
 */
export function getParentProcessId(): number {
  return process.ppid;
}

/**
 * Gets memory usage information
 */
export function getMemoryUsage(): NodeJS.MemoryUsage {
  return process.memoryUsage();
}

/**
 * Gets CPU usage information
 */
export function getCpuUsage(): NodeJS.CpuUsage {
  return process.cpuUsage();
}

/**
 * Gets the application uptime in seconds
 */
export function getUptime(): number {
  return process.uptime();
}

/**
 * Gets the Node.js/Bun version
 */
export function getRuntimeVersion(): string {
  return process.version;
}

/**
 * Gets the runtime versions object
 */
export function getRuntimeVersions(): NodeJS.ProcessVersions {
  return process.versions;
}

/**
 * Broadcasts a message to all application windows/processes
 */
export async function broadcast(eventName: string, data?: any): Promise<void> {
  // Implementation would depend on the specific app architecture
  // For now, we'll emit to process if available
  if (process.emit) {
    process.emit(eventName as any, data);
  }
}

/**
 * Shows a system notification
 */
export async function showNotification(title: string, body: string, options?: {
  icon?: string;
  timeout?: number;
  urgency?: 'low' | 'normal' | 'critical';
}): Promise<void> {
  const platform = process.platform;
  
  try {
    if (platform === 'darwin') {
      // macOS
      const script = `display notification "${body}" with title "${title}"`;
      await execCommand(`osascript -e '${script}'`);
    } else if (platform === 'win32') {
      // Windows - using PowerShell
      const script = `[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null; [System.Windows.Forms.MessageBox]::Show('${body}', '${title}')`;
      await execCommand(`powershell -Command "${script}"`);
    } else {
      // Linux - using notify-send
      const timeout = options?.timeout ? `-t ${options.timeout}` : '';
      const urgency = options?.urgency ? `-u ${options.urgency}` : '';
      const icon = options?.icon ? `-i "${options.icon}"` : '';
      
      await execCommand(`notify-send ${timeout} ${urgency} ${icon} "${title}" "${body}"`);
    }
  } catch (err) {
    console.warn('Failed to show notification:', err);
  }
}

/**
 * Opens a URL in the default browser using optimized command execution
 */
export async function openUrl(url: string): Promise<void> {
  const platform = process.platform;
  
  try {
    if (platform === 'darwin') {
      await execCommand(`open "${url}"`);
    } else if (platform === 'win32') {
      await execCommand(`start "" "${url}"`);
    } else {
      await execCommand(`xdg-open "${url}"`);
    }
  } catch (err) {
    throw new Error(`Failed to open URL: ${err}`);
  }
}

/**
 * Opens a file or directory in the default application using optimized command execution
 */
export async function openPath(filePath: string): Promise<void> {
  const platform = process.platform;
  
  try {
    if (platform === 'darwin') {
      await execCommand(`open "${filePath}"`);
    } else if (platform === 'win32') {
      await execCommand(`start "" "${filePath}"`);
    } else {
      await execCommand(`xdg-open "${filePath}"`);
    }
  } catch (err) {
    throw new Error(`Failed to open path: ${err}`);
  }
}

/**
 * Gets system information
 */
export function getSystemInfo(): {
  platform: string;
  arch: string;
  release: string;
  hostname: string;
  username: string;
  homedir: string;
  tmpdir: string;
  totalmem: number;
  freemem: number;
  cpus: os.CpuInfo[];
  loadavg: number[];
  uptime: number;
} {
  return {
    platform: os.platform(),
    arch: os.arch(),
    release: os.release(),
    hostname: os.hostname(),
    username: os.userInfo().username,
    homedir: os.homedir(),
    tmpdir: os.tmpdir(),
    totalmem: os.totalmem(),
    freemem: os.freemem(),
    cpus: os.cpus(),
    loadavg: os.loadavg(),
    uptime: os.uptime()
  };
}

/**
 * Checks if the application is running in development mode
 */
export function isDevelopment(): boolean {
  return appConfig.isDevelopment;
}

/**
 * Checks if the application is running in production mode
 */
export function isProduction(): boolean {
  return appConfig.isProduction;
}

/**
 * Gets the application data directory
 */
export function getDataPath(): string {
  return appConfig.dataPath;
}

/**
 * Gets the application configuration file path
 */
export function getConfigPath(): string {
  return appConfig.configPath;
}

/**
 * Gets the application log directory
 */
export function getLogPath(): string {
  return appConfig.logPath;
}

/**
 * Gets the temporary directory
 */
export function getTempPath(): string {
  return appConfig.tempPath;
}

/**
 * Gracefully handles application shutdown
 */
export function onExit(callback: () => void | Promise<void>): void {
  const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  
  signals.forEach(signal => {
    process.on(signal, async () => {
      try {
        await callback();
      } catch (err) {
        console.error('Error during shutdown:', err);
      } finally {
        exit(0);
      }
    });
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', async (err) => {
    console.error('Uncaught exception:', err);
    try {
      await callback();
    } catch (cleanupErr) {
      console.error('Error during shutdown cleanup:', cleanupErr);
    } finally {
      exit(1);
    }
  });
}

/**
 * Sets up signal handlers for graceful shutdown
 */
export function setupGracefulShutdown(): void {
  onExit(() => {
    console.log('Application shutting down gracefully...');
  });
}

/**
 * Prevents the application from exiting
 */
export function keepAlive(): void {
  setInterval(() => {
    // Keep the event loop alive
  }, 1000);
}
