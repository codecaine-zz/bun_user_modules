import { spawn, exec, ChildProcess } from 'child_process';
import { promisify } from 'util';
import { homedir, tmpdir, platform, arch, hostname, uptime, freemem, totalmem, cpus, networkInterfaces, userInfo, loadavg } from 'os';
import { join } from 'path';
import type { 
  CommandResult, 
  SpawnedProcess, 
  SystemInfo, 
  DialogFilter,
  OpenDialogOptions,
  SaveDialogOptions,
  FolderDialogOptions,
  NotificationOptions,
  MessageBoxOptions,
  TrayOptions,
  EventListener 
} from '../types';

const execAsync = promisify(exec);

// Spawned processes storage
const spawnedProcesses = new Map<number, { process: ChildProcess; command: string }>();
let processId = 0;

// Event emitter for process events
const eventListeners = new Map<string, EventListener[]>();

/**
 * Executes a command and returns the output
 */
export async function execCommand(
  command: string, 
  options: {
    background?: boolean;
    stdIn?: string;
    cwd?: string;
    envs?: Record<string, string>;
    timeout?: number;
  } = {}
): Promise<CommandResult> {
  try {
    const { background = false, cwd, envs, timeout = 30000 } = options;
    
    if (background) {
      // Execute in background and return immediately
      const child = spawn('sh', ['-c', command], {
        cwd,
        env: { ...process.env, ...envs },
        detached: true,
        stdio: 'ignore'
      });
      
      child.unref();
      
      return {
        pid: child.pid || 0,
        stdOut: '',
        stdErr: '',
        exitCode: 0,
        success: true
      };
    }
    
    const execOptions: any = {
      cwd,
      env: { ...process.env, ...envs },
      timeout,
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    };
    
    if (options.stdIn) {
      // For commands that need stdin, use spawn instead
      return new Promise((resolve, reject) => {
        const child = spawn('sh', ['-c', command], {
          cwd,
          env: { ...process.env, ...envs },
          stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let stdOut = '';
        let stdErr = '';
        
        child.stdout?.on('data', (data) => {
          stdOut += data.toString();
        });
        
        child.stderr?.on('data', (data) => {
          stdErr += data.toString();
        });
        
        child.on('close', (code) => {
          resolve({
            pid: child.pid || 0,
            stdOut,
            stdErr,
            exitCode: code || 0,
            success: (code || 0) === 0
          });
        });
        
        child.on('error', (error) => {
          reject(new Error(`Command execution failed: ${error.message}`));
        });
        
        // Send stdin if provided
        if (options.stdIn && child.stdin) {
          child.stdin.write(options.stdIn);
          child.stdin.end();
        }
        
        // Handle timeout
        if (timeout > 0) {
          setTimeout(() => {
            child.kill('SIGTERM');
            reject(new Error('Command execution timed out'));
          }, timeout);
        }
      });
    }
    
    const { stdout, stderr } = await execAsync(command, execOptions);
    
    return {
      pid: 0, // exec doesn't provide PID
      stdOut: stdout.toString(),
      stdErr: stderr.toString(),
      exitCode: 0,
      success: true
    };
  } catch (error: any) {
    return {
      pid: 0,
      stdOut: error.stdout || '',
      stdErr: error.stderr || error.message,
      exitCode: error.code || 1,
      success: false
    };
  }
}

/**
 * Spawns a process based on a command in background
 */
export function spawnProcess(
  command: string,
  options: {
    cwd?: string;
    envs?: Record<string, string>;
  } = {}
): SpawnedProcess {
  try {
    const id = ++processId;
    const { cwd, envs } = options;
    
    const child = spawn('sh', ['-c', command], {
      cwd,
      env: { ...process.env, ...envs },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    const processInfo: SpawnedProcess = {
      id,
      pid: child.pid || 0,
      command,
      active: true
    };
    
    spawnedProcesses.set(id, { process: child, command });
    
    // Handle process events
    child.stdout?.on('data', (data) => {
      emitProcessEvent(id, 'stdOut', data.toString());
    });
    
    child.stderr?.on('data', (data) => {
      emitProcessEvent(id, 'stdErr', data.toString());
    });
    
    child.on('close', (code) => {
      emitProcessEvent(id, 'exit', code);
      spawnedProcesses.delete(id);
    });
    
    child.on('error', (error) => {
      emitProcessEvent(id, 'error', error.message);
      spawnedProcesses.delete(id);
    });
    
    return processInfo;
  } catch (error) {
    throw new Error(`Failed to spawn process: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Updates a spawned process based on a provided action and data
 */
export function updateSpawnedProcess(
  id: number,
  action: 'stdIn' | 'stdInEnd' | 'exit',
  data?: string
): void {
  try {
    const processData = spawnedProcesses.get(id);
    if (!processData) {
      throw new Error('Process not found');
    }
    
    const { process: child } = processData;
    
    switch (action) {
      case 'stdIn':
        if (data && child.stdin) {
          child.stdin.write(data);
        }
        break;
      case 'stdInEnd':
        if (child.stdin) {
          child.stdin.end();
        }
        break;
      case 'exit':
        child.kill('SIGTERM');
        break;
    }
  } catch (error) {
    throw new Error(`Failed to update process: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Returns all spawned processes
 */
export function getSpawnedProcesses(): SpawnedProcess[] {
  return Array.from(spawnedProcesses.entries()).map(([id, { command, process }]) => ({
    id,
    pid: process.pid || 0,
    command,
    active: !process.killed
  }));
}

/**
 * Provides the value of a given environment variable
 */
export function getEnv(key: string): string {
  return process.env[key] || '';
}

/**
 * Returns all environment variables and their values
 */
export function getEnvs(): Record<string, string> {
  return { ...process.env } as Record<string, string>;
}

/**
 * Returns known platform-specific folders
 */
export function getPath(name: string): string {
  switch (name.toLowerCase()) {
    case 'home':
    case 'documents':
      return homedir();
    case 'temp':
    case 'tmp':
      return tmpdir();
    case 'downloads':
      return join(homedir(), 'Downloads');
    case 'desktop':
      return join(homedir(), 'Desktop');
    case 'pictures':
      return join(homedir(), 'Pictures');
    case 'music':
      return join(homedir(), 'Music');
    case 'videos':
      return join(homedir(), 'Videos');
    case 'config':
      if (platform() === 'win32') {
        return process.env.APPDATA || join(homedir(), 'AppData', 'Roaming');
      } else if (platform() === 'darwin') {
        return join(homedir(), 'Library', 'Application Support');
      } else {
        return process.env.XDG_CONFIG_HOME || join(homedir(), '.config');
      }
    case 'data':
      if (platform() === 'win32') {
        return process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local');
      } else if (platform() === 'darwin') {
        return join(homedir(), 'Library', 'Application Support');
      } else {
        return process.env.XDG_DATA_HOME || join(homedir(), '.local', 'share');
      }
    case 'cache':
      if (platform() === 'win32') {
        return process.env.TEMP || tmpdir();
      } else if (platform() === 'darwin') {
        return join(homedir(), 'Library', 'Caches');
      } else {
        return process.env.XDG_CACHE_HOME || join(homedir(), '.cache');
      }
    default:
      throw new Error(`Unknown path name: ${name}`);
  }
}

/**
 * Opens a URL with the default web browser
 */
export async function open(url: string): Promise<void> {
  try {
    const command = platform() === 'win32' ? `start ${url}` :
                   platform() === 'darwin' ? `open ${url}` :
                   `xdg-open ${url}`;
    
    await execCommand(command, { background: true });
  } catch (error) {
    throw new Error(`Failed to open URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Returns comprehensive system information
 */
export function getSystemInfo(): SystemInfo {
  const user = userInfo();
  
  return {
    platform: platform(),
    arch: arch(),
    hostname: hostname(),
    username: user.username,
    homedir: homedir(),
    tmpdir: tmpdir(),
    uptime: uptime(),
    freemem: freemem(),
    totalmem: totalmem(),
    cpus: cpus(),
    networkInterfaces: networkInterfaces() as Record<string, any[]>
  };
}

/**
 * Shows a native file open dialog (placeholder - requires platform-specific implementation)
 */
export async function showOpenDialog(title?: string, options: OpenDialogOptions = {}): Promise<string[]> {
  // This is a placeholder implementation
  // In a real implementation, you would use platform-specific dialog APIs
  console.warn('showOpenDialog: Native dialogs require platform-specific implementation');
  
  // Return empty array for now
  return [];
}

/**
 * Shows a native file save dialog (placeholder - requires platform-specific implementation)
 */
export async function showSaveDialog(title?: string, options: SaveDialogOptions = {}): Promise<string> {
  // This is a placeholder implementation
  console.warn('showSaveDialog: Native dialogs require platform-specific implementation');
  
  // Return empty string for now
  return '';
}

/**
 * Shows a native folder dialog (placeholder - requires platform-specific implementation)
 */
export async function showFolderDialog(title?: string, options: FolderDialogOptions = {}): Promise<string> {
  // This is a placeholder implementation
  console.warn('showFolderDialog: Native dialogs require platform-specific implementation');
  
  // Return empty string for now
  return '';
}

/**
 * Displays a notification message
 */
export async function showNotification(options: NotificationOptions): Promise<void> {
  try {
    const { title, content, icon = 'INFO' } = options;
    
    // Use system notification command based on platform
    let command: string;
    
    if (platform() === 'darwin') {
      // macOS
      command = `osascript -e 'display notification "${content}" with title "${title}"'`;
    } else if (platform() === 'linux') {
      // Linux with notify-send
      command = `notify-send "${title}" "${content}"`;
    } else if (platform() === 'win32') {
      // Windows PowerShell
      const script = `[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('${content}', '${title}')`;
      command = `powershell -Command "${script}"`;
    } else {
      console.log(`Notification: ${title} - ${content}`);
      return;
    }
    
    await execCommand(command, { background: true });
  } catch (error) {
    // Fallback to console log if notification fails
    console.log(`Notification: ${options.title} - ${options.content}`);
  }
}

/**
 * Displays a message box (placeholder - requires platform-specific implementation)
 */
export async function showMessageBox(options: MessageBoxOptions): Promise<string> {
  // This is a placeholder implementation
  console.warn('showMessageBox: Native message boxes require platform-specific implementation');
  console.log(`MessageBox: ${options.title} - ${options.content}`);
  
  // Return default choice for now
  return 'OK';
}

/**
 * Creates/updates the tray icon and menu (placeholder - requires platform-specific implementation)
 */
export async function setTray(options: TrayOptions): Promise<void> {
  // This is a placeholder implementation
  console.warn('setTray: System tray requires platform-specific implementation');
  console.log('Tray options:', options);
}

/**
 * Gets the current working directory
 */
export function getCwd(): string {
  return process.cwd();
}

/**
 * Changes the current working directory
 */
export function setCwd(path: string): void {
  process.chdir(path);
}

/**
 * Gets the process ID of the current process
 */
export function getPid(): number {
  return process.pid;
}

/**
 * Gets memory usage information
 */
export function getMemoryUsage(): NodeJS.MemoryUsage {
  return process.memoryUsage();
}

/**
 * Gets CPU usage information (approximate)
 */
export function getCpuUsage(): NodeJS.CpuUsage {
  return process.cpuUsage();
}

/**
 * Kills a process by PID
 */
export function killProcess(pid: number, signal: NodeJS.Signals = 'SIGTERM'): boolean {
  try {
    process.kill(pid, signal);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper function to emit process events
 */
function emitProcessEvent(id: number, action: string, data: any): void {
  const listeners = eventListeners.get('spawnedProcess') || [];
  listeners.forEach(listener => listener({
    detail: { id, action, data }
  }));
}

/**
 * Event listener management
 */
export function on(event: string, listener: EventListener): void {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, []);
  }
  eventListeners.get(event)!.push(listener);
}

export function off(event: string, listener: EventListener): void {
  const listeners = eventListeners.get(event);
  if (listeners) {
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }
}

/**
 * Extended OS utilities
 */

/**
 * Process manager for running and monitoring system processes
 */
export class ProcessManager {
  private processes = new Map<string, ChildProcess>();
  
  /**
   * Starts a new process with monitoring
   */
  async start(
    id: string,
    command: string,
    options: {
      cwd?: string;
      env?: Record<string, string>;
      onOutput?: (data: string) => void;
      onError?: (data: string) => void;
      onExit?: (code: number | null) => void;
    } = {}
  ): Promise<void> {
    if (this.processes.has(id)) {
      throw new Error(`Process with ID '${id}' already exists`);
    }
    
    const { cwd, env, onOutput, onError, onExit } = options;
    
    const child = spawn('sh', ['-c', command], {
      cwd,
      env: { ...process.env, ...env },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    this.processes.set(id, child);
    
    if (onOutput) {
      child.stdout?.on('data', (data) => onOutput(data.toString()));
    }
    
    if (onError) {
      child.stderr?.on('data', (data) => onError(data.toString()));
    }
    
    if (onExit) {
      child.on('exit', (code) => {
        this.processes.delete(id);
        onExit(code);
      });
    } else {
      child.on('exit', () => {
        this.processes.delete(id);
      });
    }
  }
  
  /**
   * Stops a process
   */
  stop(id: string, signal: NodeJS.Signals = 'SIGTERM'): boolean {
    const process = this.processes.get(id);
    if (!process) return false;
    
    process.kill(signal);
    return true;
  }
  
  /**
   * Gets process status
   */
  getStatus(id: string): { running: boolean; pid?: number } | null {
    const process = this.processes.get(id);
    if (!process) return null;
    
    return {
      running: !process.killed,
      pid: process.pid
    };
  }
  
  /**
   * Lists all managed processes
   */
  list(): Array<{ id: string; pid?: number; running: boolean }> {
    return Array.from(this.processes.entries()).map(([id, process]) => ({
      id,
      pid: process.pid,
      running: !process.killed
    }));
  }
  
  /**
   * Stops all processes
   */
  stopAll(signal: NodeJS.Signals = 'SIGTERM'): void {
    this.processes.forEach((process, id) => {
      process.kill(signal);
    });
    this.processes.clear();
  }
}

/**
 * Creates a process manager instance
 */
export function createProcessManager(): ProcessManager {
  return new ProcessManager();
}

/**
 * System resource monitor
 */
export class ResourceMonitor {
  private interval: NodeJS.Timeout | null = null;
  private metrics: Array<{
    timestamp: Date;
    cpu: number;
    memory: { used: number; total: number; percentage: number };
    load: number[];
  }> = [];
  
  private maxMetrics = 100;
  
  /**
   * Starts monitoring system resources
   */
  start(intervalMs: number = 5000): void {
    if (this.interval) {
      this.stop();
    }
    
    this.interval = setInterval(() => {
      this.recordMetrics();
    }, intervalMs);
    
    // Record initial metrics
    this.recordMetrics();
  }
  
  /**
   * Stops monitoring
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  
  private recordMetrics(): void {
    const memory = {
      used: totalmem() - freemem(),
      total: totalmem(),
      percentage: ((totalmem() - freemem()) / totalmem()) * 100
    };
    
    const load = loadavg();
    const cpu = load[0] || 0; // Simplified CPU usage approximation
    
    this.metrics.unshift({
      timestamp: new Date(),
      cpu,
      memory,
      load
    });
    
    // Limit metrics array size
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.splice(this.maxMetrics);
    }
  }
  
  /**
   * Gets current metrics
   */
  getCurrent(): {
    cpu: number;
    memory: { used: number; total: number; percentage: number };
    load: number[];
  } | null {
    return this.metrics[0] || null;
  }
  
  /**
   * Gets all recorded metrics
   */
  getHistory(): Array<{
    timestamp: Date;
    cpu: number;
    memory: { used: number; total: number; percentage: number };
    load: number[];
  }> {
    return [...this.metrics];
  }
  
  /**
   * Gets average metrics over a time period
   */
  getAverage(timeframeMs?: number): {
    cpu: number;
    memory: number;
    load: number[];
  } | null {
    let relevantMetrics = this.metrics;
    
    if (timeframeMs) {
      const cutoff = Date.now() - timeframeMs;
      relevantMetrics = this.metrics.filter(m => m.timestamp.getTime() > cutoff);
    }
    
    if (relevantMetrics.length === 0) return null;
    
    const avgCpu = relevantMetrics.reduce((sum, m) => sum + m.cpu, 0) / relevantMetrics.length;
    const avgMemory = relevantMetrics.reduce((sum, m) => sum + m.memory.percentage, 0) / relevantMetrics.length;
    const avgLoad = [0, 1, 2].map(i => 
      relevantMetrics.reduce((sum, m) => sum + (m.load[i] || 0), 0) / relevantMetrics.length
    );
    
    return {
      cpu: avgCpu,
      memory: avgMemory,
      load: avgLoad
    };
  }
  
  /**
   * Clears metrics history
   */
  clear(): void {
    this.metrics.length = 0;
  }
}

/**
 * Creates a resource monitor instance
 */
export function createResourceMonitor(): ResourceMonitor {
  return new ResourceMonitor();
}

/**
 * Environment variable manager
 */
export const envManager = {
  /**
   * Gets all environment variables with filtering
   */
  getAll(filter?: (key: string, value: string) => boolean): Record<string, string> {
    const env = process.env;
    const result: Record<string, string> = {};
    
    Object.entries(env).forEach(([key, value]) => {
      if (value && (!filter || filter(key, value))) {
        result[key] = value;
      }
    });
    
    return result;
  },
  
  /**
   * Gets environment variables by prefix
   */
  getByPrefix(prefix: string): Record<string, string> {
    return this.getAll((key) => key.startsWith(prefix));
  },
  
  /**
   * Sets multiple environment variables
   */
  setMany(vars: Record<string, string>): void {
    Object.entries(vars).forEach(([key, value]) => {
      process.env[key] = value;
    });
  },
  
  /**
   * Removes environment variables by pattern
   */
  removeByPattern(pattern: RegExp): string[] {
    const removed: string[] = [];
    
    Object.keys(process.env).forEach(key => {
      if (pattern.test(key)) {
        delete process.env[key];
        removed.push(key);
      }
    });
    
    return removed;
  },
  
  /**
   * Backs up current environment
   */
  backup(): Record<string, string | undefined> {
    return { ...process.env };
  },
  
  /**
   * Restores environment from backup
   */
  restore(backup: Record<string, string | undefined>): void {
    // Clear current env
    Object.keys(process.env).forEach(key => {
      delete process.env[key];
    });
    
    // Restore from backup
    Object.entries(backup).forEach(([key, value]) => {
      if (value !== undefined) {
        process.env[key] = value;
      }
    });
  }
};

/**
 * System information gatherer
 */
export const systemInfo = {
  /**
   * Gets detailed OS information
   */
  getDetailed(): {
    platform: string;
    architecture: string;
    hostname: string;
    uptime: number;
    loadAverage: number[];
    memory: { total: number; free: number; used: number };
    cpu: { count: number; model: string; speed: number };
    network: Record<string, any[]>;
    user: any;
  } {
    return {
      platform: platform(),
      architecture: arch(),
      hostname: hostname(),
      uptime: uptime(),
      loadAverage: loadavg(),
      memory: {
        total: totalmem(),
        free: freemem(),
        used: totalmem() - freemem()
      },
      cpu: {
        count: cpus().length,
        model: cpus()[0]?.model || 'Unknown',
        speed: cpus()[0]?.speed || 0
      },
      network: Object.fromEntries(
        Object.entries(networkInterfaces()).filter(([_, value]) => value !== undefined)
      ) as Record<string, any[]>,
      user: userInfo()
    };
  },
  
  /**
   * Gets system limits and quotas
   */
  async getLimits(): Promise<{
    maxFileDescriptors?: number;
    maxProcesses?: number;
    maxMemory?: number;
  }> {
    const limits: {
      maxFileDescriptors?: number;
      maxProcesses?: number;
      maxMemory?: number;
    } = {};
    
    try {
      if (platform() !== 'win32') {
        const ulimitResult = await execCommand('ulimit -a 2>/dev/null');
        if (ulimitResult.success) {
          const output = ulimitResult.stdOut;
          
          const fdMatch = output.match(/open files\s+\(-n\)\s+(\d+)/);
          if (fdMatch?.[1]) {
            limits.maxFileDescriptors = parseInt(fdMatch[1]);
          }
          
          const procMatch = output.match(/max user processes\s+\(-u\)\s+(\d+)/);
          if (procMatch?.[1]) {
            limits.maxProcesses = parseInt(procMatch[1]);
          }
          
          const memMatch = output.match(/max memory size\s+\(-m\)\s+(\d+)/);
          if (memMatch?.[1]) {
            limits.maxMemory = parseInt(memMatch[1]) * 1024; // Convert KB to bytes
          }
        }
      }
    } catch {
      // Ignore errors
    }
    
    return limits;
  }
};

/**
 * Clipboard utilities (cross-platform)
 */
export const clipboard = {
  /**
   * Reads text from clipboard
   */
  async read(): Promise<string> {
    let command: string;
    
    if (platform() === 'darwin') {
      command = 'pbpaste';
    } else if (platform() === 'linux') {
      command = 'xclip -selection clipboard -o 2>/dev/null || xsel --clipboard --output 2>/dev/null';
    } else if (platform() === 'win32') {
      command = 'powershell -command "Get-Clipboard"';
    } else {
      throw new Error('Clipboard operations not supported on this platform');
    }
    
    const result = await execCommand(command);
    return result.success ? result.stdOut.trim() : '';
  },
  
  /**
   * Writes text to clipboard
   */
  async write(text: string): Promise<void> {
    let command: string;
    
    if (platform() === 'darwin') {
      command = `echo "${text.replace(/"/g, '\\"')}" | pbcopy`;
    } else if (platform() === 'linux') {
      command = `echo "${text.replace(/"/g, '\\"')}" | xclip -selection clipboard 2>/dev/null || echo "${text.replace(/"/g, '\\"')}" | xsel --clipboard --input`;
    } else if (platform() === 'win32') {
      command = `echo "${text.replace(/"/g, '\\"')}" | clip`;
    } else {
      throw new Error('Clipboard operations not supported on this platform');
    }
    
    const result = await execCommand(command);
    if (!result.success) {
      throw new Error('Failed to write to clipboard');
    }
  }
};
