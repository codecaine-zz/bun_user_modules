import { cpus, freemem, totalmem, uptime, loadavg, platform, arch, release, hostname, networkInterfaces, userInfo } from 'os';
import { execCommand } from './os';
import type { SystemInfo } from '../types';

// Performance monitoring state
let performanceHistory: Array<{
  timestamp: Date;
  cpu: number;
  memory: number;
  load: number[];
}> = [];

const MAX_PERFORMANCE_HISTORY = 100;

/**
 * Gets detailed CPU information
 */
export function getCpuInfo() {
  const cpuInfo = cpus();
  return {
    count: cpuInfo.length,
    model: cpuInfo[0]?.model || 'Unknown',
    speed: cpuInfo[0]?.speed || 0,
    cores: cpuInfo.map(cpu => ({
      model: cpu.model,
      speed: cpu.speed,
      times: cpu.times
    }))
  };
}

/**
 * Gets memory information in bytes
 */
export function getMemoryInfo() {
  return {
    total: totalmem(),
    free: freemem(),
    used: totalmem() - freemem(),
    usagePercentage: ((totalmem() - freemem()) / totalmem()) * 100
  };
}

/**
 * Gets system uptime in seconds
 */
export function getUptime(): number {
  return uptime();
}

/**
 * Gets system load average
 */
export function getLoadAverage(): number[] {
  return loadavg();
}

/**
 * Gets basic system information
 */
export function getSystemInfo(): SystemInfo {
  return {
    platform: platform(),
    arch: arch(),
    hostname: hostname(),
    username: process.env.USER || process.env.USERNAME || 'unknown',
    homedir: process.env.HOME || process.env.USERPROFILE || '',
    tmpdir: process.env.TMPDIR || process.env.TEMP || '/tmp',
    uptime: uptime(),
    freemem: freemem(),
    totalmem: totalmem(),
    cpus: cpus(),
    networkInterfaces: {}
  };
}

/**
 * Gets OS release information
 */
export function getOSInfo() {
  return {
    platform: platform(),
    arch: arch(),
    release: release(),
    version: process.version,
    hostname: hostname()
  };
}

/**
 * Gets disk usage information (requires platform-specific commands)
 */
export async function getDiskUsage(path: string = '/'): Promise<{
  total: number;
  used: number;
  free: number;
  usagePercentage: number;
}> {
  try {
    let command: string;
    
    if (platform() === 'win32') {
      // Windows
      command = `wmic logicaldisk where caption="${path.charAt(0)}:" get freespace,size /value`;
    } else {
      // Unix-like systems
      command = `df -k "${path}" | tail -1 | awk '{print $2,$3,$4}'`;
    }
    
    const result = await execCommand(command);
    
    if (platform() === 'win32') {
      // Parse Windows output
      const lines = result.stdOut.split('\n');
      let freeSpace = 0;
      let totalSize = 0;
      
      for (const line of lines) {
        if (line.includes('FreeSpace=')) {
          const value = line.split('=')[1];
          freeSpace = value ? parseInt(value) || 0 : 0;
        }
        if (line.includes('Size=')) {
          const value = line.split('=')[1];
          totalSize = value ? parseInt(value) || 0 : 0;
        }
      }
      
      const used = totalSize - freeSpace;
      return {
        total: totalSize,
        used,
        free: freeSpace,
        usagePercentage: totalSize > 0 ? (used / totalSize) * 100 : 0
      };
    } else {
      // Parse Unix output (in KB)
      const parts = result.stdOut.trim().split(/\s+/);
      if (parts.length >= 3) {
        const total = (parseInt(parts[0] || '0') || 0) * 1024; // Convert to bytes
        const used = (parseInt(parts[1] || '0') || 0) * 1024;
        const free = (parseInt(parts[2] || '0') || 0) * 1024;
        
        return {
          total,
          used,
          free,
          usagePercentage: total > 0 ? (used / total) * 100 : 0
        };
      }
    }
  } catch (error) {
    // Return default values if command fails
  }
  
  return {
    total: 0,
    used: 0,
    free: 0,
    usagePercentage: 0
  };
}

/**
 * Gets network interface information
 */
export async function getNetworkInfo(): Promise<any> {
  try {
    let command: string;
    
    if (platform() === 'win32') {
      command = 'ipconfig /all';
    } else if (platform() === 'darwin') {
      command = 'ifconfig';
    } else {
      command = 'ip addr show';
    }
    
    const result = await execCommand(command);
    return {
      raw: result.stdOut,
      success: result.success
    };
  } catch (error) {
    return {
      raw: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Gets running processes information
 */
export async function getProcessList(): Promise<Array<{
  pid: number;
  name: string;
  cpu?: number;
  memory?: number;
}>> {
  try {
    let command: string;
    
    if (platform() === 'win32') {
      command = 'tasklist /fo csv';
    } else if (platform() === 'darwin') {
      command = 'ps aux';
    } else {
      command = 'ps aux';
    }
    
    const result = await execCommand(command);
    
    if (!result.success) {
      return [];
    }
    
    const processes: Array<{ pid: number; name: string; cpu?: number; memory?: number }> = [];
    const lines = result.stdOut.split('\n');
    
    if (platform() === 'win32') {
      // Windows CSV format
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line && line.trim()) {
          const parts = line.split('","');
          if (parts.length >= 2 && parts[0] && parts[1]) {
            const name = parts[0].replace(/"/g, '');
            const pidStr = parts[1].replace(/"/g, '');
            const pid = parseInt(pidStr);
            if (!isNaN(pid)) {
              processes.push({ pid, name });
            }
          }
        }
      }
    } else {
      // Unix ps aux format
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line && line.trim()) {
          const parts = line.split(/\s+/);
          if (parts.length >= 11 && parts[1] && parts[2] && parts[3]) {
            const pid = parseInt(parts[1] || '0');
            const cpu = parseFloat(parts[2] || '0');
            const memory = parseFloat(parts[3] || '0');
            const name = parts.slice(10).join(' ');
            
            if (!isNaN(pid)) {
              processes.push({ pid, name, cpu, memory });
            }
          }
        }
      }
    }
    
    return processes;
  } catch (error) {
    return [];
  }
}

/**
 * Gets current user information
 */
export function getCurrentUser() {
  return {
    username: process.env.USER || process.env.USERNAME || 'unknown',
    uid: process.getuid ? process.getuid() : undefined,
    gid: process.getgid ? process.getgid() : undefined,
    home: process.env.HOME || process.env.USERPROFILE || '',
    shell: process.env.SHELL || process.env.COMSPEC || ''
  };
}

/**
 * Gets environment variables related to the system
 */
export function getSystemEnv() {
  const env = process.env;
  return {
    path: env.PATH || '',
    home: env.HOME || env.USERPROFILE || '',
    user: env.USER || env.USERNAME || '',
    shell: env.SHELL || env.COMSPEC || '',
    lang: env.LANG || env.LANGUAGE || '',
    tz: env.TZ || ''
  };
}

/**
 * Checks if running with administrator/root privileges
 */
export function isElevated(): boolean {
  if (platform() === 'win32') {
    // On Windows, check if we can write to system directory
    return process.env.USERNAME === 'SYSTEM' || 
           process.env.USERDOMAIN === 'NT AUTHORITY';
  } else {
    // On Unix-like systems, check if UID is 0 (root)
    return process.getuid ? process.getuid() === 0 : false;
  }
}

/**
 * Gets battery information (requires platform-specific commands)
 */
export async function getBatteryInfo(): Promise<{
  level?: number;
  charging?: boolean;
  present?: boolean;
  error?: string;
}> {
  try {
    let command: string;
    
    if (platform() === 'win32') {
      command = 'wmic path Win32_Battery get BatteryStatus,EstimatedChargeRemaining /value';
    } else if (platform() === 'darwin') {
      command = 'pmset -g batt';
    } else {
      command = 'upower -i $(upower -e | grep BAT)';
    }
    
    const result = await execCommand(command);
    
    if (!result.success) {
      return { error: 'Failed to get battery information' };
    }
    
    if (platform() === 'win32') {
      // Parse Windows output
      const lines = result.stdOut.split('\n');
      let level: number | undefined;
      let charging: boolean | undefined;
      
      for (const line of lines) {
        if (line.includes('EstimatedChargeRemaining=')) {
          const value = line.split('=')[1];
          level = value ? parseInt(value) || undefined : undefined;
        }
        if (line.includes('BatteryStatus=')) {
          const value = line.split('=')[1];
          const status = value ? parseInt(value) : 0;
          charging = status === 2; // 2 = charging in Windows
        }
      }
      
      return { level, charging, present: level !== undefined };
    } else if (platform() === 'darwin') {
      // Parse macOS output
      const output = result.stdOut;
      const levelMatch = output.match(/(\d+)%/);
      const chargingMatch = output.match(/(charging|discharging)/i);
      
      return {
        level: levelMatch?.[1] ? parseInt(levelMatch[1]) : undefined,
        charging: chargingMatch?.[1] ? chargingMatch[1].toLowerCase() === 'charging' : undefined,
        present: !!levelMatch
      };
    } else {
      // Parse Linux upower output
      const output = result.stdOut;
      const levelMatch = output.match(/percentage:\s*(\d+)%/);
      const chargingMatch = output.match(/state:\s*(\w+)/);
      
      return {
        level: levelMatch?.[1] ? parseInt(levelMatch[1]) : undefined,
        charging: chargingMatch?.[1] ? chargingMatch[1].toLowerCase() === 'charging' : undefined,
        present: !!levelMatch
      };
    }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Gets temperature information (Linux/macOS specific)
 */
export async function getTemperatureInfo(): Promise<{
  cpu?: number;
  gpu?: number;
  error?: string;
}> {
  try {
    if (platform() === 'linux') {
      // Try to read from thermal zones
      const result = await execCommand('cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null || sensors 2>/dev/null');
      
      if (result.success && result.stdOut) {
        // If it's a number (thermal zone), convert from millidegrees
        const temp = parseInt(result.stdOut);
        if (!isNaN(temp) && temp > 1000) {
          return { cpu: temp / 1000 };
        }
        
        // Otherwise try to parse sensors output
        const tempMatch = result.stdOut.match(/Core \d+:\s*\+(\d+\.\d+)°C/);
        if (tempMatch?.[1]) {
          return { cpu: parseFloat(tempMatch[1]) };
        }
      }
    } else if (platform() === 'darwin') {
      // macOS doesn't have easy temperature access without additional tools
      return { error: 'Temperature monitoring requires additional tools on macOS' };
    }
    
    return { error: 'Temperature information not available on this platform' };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Records current performance metrics
 */
function recordPerformance(): void {
  const memInfo = getMemoryInfo();
  const load = getLoadAverage();
  
  performanceHistory.unshift({
    timestamp: new Date(),
    cpu: load[0] || 0,
    memory: memInfo.usagePercentage,
    load
  });
  
  // Limit history size
  if (performanceHistory.length > MAX_PERFORMANCE_HISTORY) {
    performanceHistory.splice(MAX_PERFORMANCE_HISTORY);
  }
}

/**
 * Starts performance monitoring
 */
export function startPerformanceMonitoring(interval: number = 5000): () => void {
  const intervalId = setInterval(recordPerformance, interval);
  
  // Record initial measurement
  recordPerformance();
  
  return () => clearInterval(intervalId);
}

/**
 * Gets performance history
 */
export function getPerformanceHistory(): Array<{
  timestamp: Date;
  cpu: number;
  memory: number;
  load: number[];
}> {
  return [...performanceHistory];
}

/**
 * Gets current performance metrics
 */
export function getCurrentPerformance(): {
  cpu: number;
  memory: number;
  load: number[];
  processes: number;
} {
  const memInfo = getMemoryInfo();
  const load = getLoadAverage();
  
  return {
    cpu: load[0] || 0,
    memory: memInfo.usagePercentage,
    load,
    processes: process.pid // Simple approximation
  };
}

/**
 * Gets detailed system information including network interfaces
 */
export function getDetailedSystemInfo(): SystemInfo & {
  networkInterfaces: Record<string, any[]>;
  userInfo: any;
} {
  const basicInfo = getSystemInfo();
  const netInterfaces = networkInterfaces();
  const filteredInterfaces: Record<string, any[]> = {};
  
  // Filter out undefined values
  Object.entries(netInterfaces).forEach(([key, value]) => {
    if (value) {
      filteredInterfaces[key] = value;
    }
  });
  
  return {
    ...basicInfo,
    networkInterfaces: filteredInterfaces,
    userInfo: userInfo()
  };
}



/**
 * Gets system health score based on various metrics
 */
export function getSystemHealthScore(): {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  factors: {
    memory: number;
    cpu: number;
    disk?: number;
  };
} {
  const memInfo = getMemoryInfo();
  const load = getLoadAverage();
  const cpuInfo = getCpuInfo();
  
  // Calculate individual scores (0-100)
  const memoryScore = Math.max(0, 100 - memInfo.usagePercentage);
  const cpuScore = Math.max(0, 100 - ((load[0] || 0) / cpuInfo.count) * 100);
  
  // Overall score is weighted average
  const overallScore = (memoryScore * 0.4) + (cpuScore * 0.6);
  
  let status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  if (overallScore >= 90) status = 'excellent';
  else if (overallScore >= 75) status = 'good';
  else if (overallScore >= 60) status = 'fair';
  else if (overallScore >= 40) status = 'poor';
  else status = 'critical';
  
  return {
    score: Math.round(overallScore),
    status,
    factors: {
      memory: Math.round(memoryScore),
      cpu: Math.round(cpuScore)
    }
  };
}

/**
 * Checks if system needs restart (platform-specific)
 */
export async function needsRestart(): Promise<{
  needed: boolean;
  reason?: string;
  lastBoot?: Date;
}> {
  try {
    const systemUptime = getUptime();
    const lastBoot = new Date(Date.now() - systemUptime * 1000);
    
    // Simple heuristic: suggest restart if uptime > 7 days
    const sevenDays = 7 * 24 * 60 * 60; // seconds
    const needed = systemUptime > sevenDays;
    
    return {
      needed,
      reason: needed ? 'System has been running for more than 7 days' : undefined,
      lastBoot
    };
  } catch (error) {
    return {
      needed: false,
      reason: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
