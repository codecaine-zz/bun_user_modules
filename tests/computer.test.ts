import { describe, test, expect } from 'bun:test';
import * as computer from '../modules/computer';

describe('Computer Module', () => {
  describe('CPU Information', () => {
    test('should get CPU info', () => {
      const cpuInfo = computer.getCpuInfo();
      
      expect(typeof cpuInfo.count).toBe('number');
      expect(cpuInfo.count).toBeGreaterThan(0);
      expect(typeof cpuInfo.model).toBe('string');
      expect(typeof cpuInfo.speed).toBe('number');
      expect(Array.isArray(cpuInfo.cores)).toBe(true);
      expect(cpuInfo.cores.length).toBe(cpuInfo.count);
    });
  });

  describe('Memory Information', () => {
    test('should get memory info', () => {
      const memInfo = computer.getMemoryInfo();
      
      expect(typeof memInfo.total).toBe('number');
      expect(typeof memInfo.free).toBe('number');
      expect(typeof memInfo.used).toBe('number');
      expect(typeof memInfo.usagePercentage).toBe('number');
      expect(memInfo.total).toBeGreaterThan(0);
      expect(memInfo.free).toBeGreaterThan(0);
      expect(memInfo.used).toBeGreaterThanOrEqual(0);
      expect(memInfo.usagePercentage).toBeGreaterThanOrEqual(0);
      expect(memInfo.usagePercentage).toBeLessThanOrEqual(100);
      expect(memInfo.total).toBe(memInfo.free + memInfo.used);
    });
  });

  describe('System Information', () => {
    test('should get system uptime', () => {
      const uptime = computer.getUptime();
      
      expect(typeof uptime).toBe('number');
      expect(uptime).toBeGreaterThan(0);
    });

    test('should get load average', () => {
      const loadAvg = computer.getLoadAverage();
      
      expect(Array.isArray(loadAvg)).toBe(true);
      expect(loadAvg.length).toBe(3); // 1, 5, 15 minute averages
      loadAvg.forEach(avg => {
        expect(typeof avg).toBe('number');
        expect(avg).toBeGreaterThanOrEqual(0);
      });
    });

    test('should get comprehensive system info', () => {
      const sysInfo = computer.getSystemInfo();
      
      expect(typeof sysInfo.platform).toBe('string');
      expect(typeof sysInfo.arch).toBe('string');
      expect(typeof sysInfo.hostname).toBe('string');
      expect(typeof sysInfo.username).toBe('string');
      expect(typeof sysInfo.homedir).toBe('string');
      expect(typeof sysInfo.tmpdir).toBe('string');
      expect(typeof sysInfo.uptime).toBe('number');
      expect(typeof sysInfo.freemem).toBe('number');
      expect(typeof sysInfo.totalmem).toBe('number');
      expect(Array.isArray(sysInfo.cpus)).toBe(true);
      expect(typeof sysInfo.networkInterfaces).toBe('object');
    });

    test('should get OS info', () => {
      const osInfo = computer.getOSInfo();
      
      expect(typeof osInfo.platform).toBe('string');
      expect(typeof osInfo.arch).toBe('string');
      expect(typeof osInfo.release).toBe('string');
      expect(typeof osInfo.hostname).toBe('string');
    });
  });

  describe('User Information', () => {
    test('should get current user info', () => {
      const userInfo = computer.getCurrentUser();
      
      expect(typeof userInfo.username).toBe('string');
      expect(typeof userInfo.shell).toBe('string');
      expect(typeof userInfo.home).toBe('string');
      expect(userInfo.username.length).toBeGreaterThan(0);
      
      // uid/gid might be undefined on Windows
      if (userInfo.uid !== undefined) {
        expect(typeof userInfo.uid).toBe('number');
      }
      if (userInfo.gid !== undefined) {
        expect(typeof userInfo.gid).toBe('number');
      }
    });

    test('should check if elevated (admin/sudo)', () => {
      const elevated = computer.isElevated();
      
      expect(typeof elevated).toBe('boolean');
    });
  });

  describe('Environment Information', () => {
    test('should get system environment', () => {
      const env = computer.getSystemEnv();
      
      expect(typeof env).toBe('object');
      expect(Object.keys(env).length).toBeGreaterThan(0);
    });
  });

  describe('Performance Monitoring', () => {
    test('should have performance monitoring functions', () => {
      // Check that these functions exist in the module
      expect(typeof computer.getCpuInfo).toBe('function');
      expect(typeof computer.getMemoryInfo).toBe('function');
      expect(typeof computer.getUptime).toBe('function');
      expect(typeof computer.getLoadAverage).toBe('function');
    });
  });

  describe('Error Handling', () => {
    test('should handle system info gathering gracefully', () => {
      // These should not throw errors even in unusual system conditions
      expect(() => computer.getCpuInfo()).not.toThrow();
      expect(() => computer.getMemoryInfo()).not.toThrow();
      expect(() => computer.getUptime()).not.toThrow();
      expect(() => computer.getLoadAverage()).not.toThrow();
      expect(() => computer.getSystemInfo()).not.toThrow();
      expect(() => computer.getOSInfo()).not.toThrow();
      expect(() => computer.getCurrentUser()).not.toThrow();
      expect(() => computer.getSystemEnv()).not.toThrow();
      expect(() => computer.isElevated()).not.toThrow();
    });
  });
});
