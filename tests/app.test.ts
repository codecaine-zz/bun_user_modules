import { test, expect, describe, beforeEach } from 'bun:test';
import * as app from '../modules/app';

describe('App Module', () => {
  describe('Configuration', () => {
    test('should get default config', () => {
      const config = app.getConfig();
      
      expect(config.name).toBe('BunApp');
      expect(config.version).toBe('1.0.0');
      expect(config.platform).toBeDefined();
      expect(config.arch).toBeDefined();
    });

    test('should update config', () => {
      const originalConfig = app.getConfig();
      
      app.setConfig({
        name: 'TestApp',
        version: '2.0.0'
      });
      
      const updatedConfig = app.getConfig();
      expect(updatedConfig.name).toBe('TestApp');
      expect(updatedConfig.version).toBe('2.0.0');
      
      // Restore original config
      app.setConfig(originalConfig);
    });
  });

  describe('Environment', () => {
    test('should get environment variables', () => {
      const env = app.getEnvironmentVariables();
      expect(typeof env).toBe('object');
      expect(env.PATH).toBeDefined(); // PATH should exist on most systems
    });

    test('should get specific environment variable', () => {
      const path = app.getEnvironmentVariable('PATH');
      expect(typeof path).toBe('string');
      
      const nonExistent = app.getEnvironmentVariable('NON_EXISTENT_VAR', 'default');
      expect(nonExistent).toBe('default');
    });

    test('should set environment variable', () => {
      const testVar = 'TEST_VAR_12345';
      const testValue = 'test_value';
      
      app.setEnvironmentVariable(testVar, testValue);
      
      const retrieved = app.getEnvironmentVariable(testVar);
      expect(retrieved).toBe(testValue);
      
      // Clean up
      delete process.env[testVar];
    });
  });

  describe('Process Information', () => {
    test('should get process ID', () => {
      const pid = app.getProcessId();
      expect(typeof pid).toBe('number');
      expect(pid).toBeGreaterThan(0);
    });

    test('should get parent process ID', () => {
      const ppid = app.getParentProcessId();
      expect(typeof ppid).toBe('number');
      expect(ppid).toBeGreaterThan(0);
    });

    test('should get memory usage', () => {
      const memory = app.getMemoryUsage();
      expect(typeof memory.rss).toBe('number');
      expect(typeof memory.heapTotal).toBe('number');
      expect(typeof memory.heapUsed).toBe('number');
    });

    test('should get CPU usage', () => {
      const cpu = app.getCpuUsage();
      expect(typeof cpu.user).toBe('number');
      expect(typeof cpu.system).toBe('number');
    });

    test('should get uptime', () => {
      const uptime = app.getUptime();
      expect(typeof uptime).toBe('number');
      expect(uptime).toBeGreaterThan(0);
    });

    test('should get runtime version', () => {
      const version = app.getRuntimeVersion();
      expect(typeof version).toBe('string');
      expect(version.startsWith('v')).toBe(true);
    });
  });

  describe('Command Line Arguments', () => {
    test('should get command line arguments', () => {
      const args = app.getCommandLineArguments();
      expect(Array.isArray(args)).toBe(true);
    });

    test('should parse command line arguments', () => {
      // Since we can't easily mock process.argv in tests,
      // we'll just test that the function returns an object
      const parsed = app.getParsedArguments();
      expect(typeof parsed).toBe('object');
    });
  });

  describe('Working Directory', () => {
    test('should get current working directory', () => {
      const cwd = app.getCurrentWorkingDirectory();
      expect(typeof cwd).toBe('string');
      expect(cwd.length).toBeGreaterThan(0);
    });

    test('should set current working directory', () => {
      const originalCwd = app.getCurrentWorkingDirectory();
      const parentDir = require('path').dirname(originalCwd);
      
      try {
        app.setCurrentWorkingDirectory(parentDir);
        const newCwd = app.getCurrentWorkingDirectory();
        expect(newCwd).toBe(parentDir);
      } finally {
        // Restore original directory
        app.setCurrentWorkingDirectory(originalCwd);
      }
    });
  });

  describe('System Information', () => {
    test('should get system info', () => {
      const info = app.getSystemInfo();
      
      expect(typeof info.platform).toBe('string');
      expect(typeof info.arch).toBe('string');
      expect(typeof info.hostname).toBe('string');
      expect(typeof info.username).toBe('string');
      expect(typeof info.homedir).toBe('string');
      expect(typeof info.tmpdir).toBe('string');
      expect(typeof info.totalmem).toBe('number');
      expect(typeof info.freemem).toBe('number');
      expect(Array.isArray(info.cpus)).toBe(true);
      expect(Array.isArray(info.loadavg)).toBe(true);
      expect(typeof info.uptime).toBe('number');
    });
  });

  describe('Development/Production Mode', () => {
    test('should check development mode', () => {
      const isDev = app.isDevelopment();
      expect(typeof isDev).toBe('boolean');
    });

    test('should check production mode', () => {
      const isProd = app.isProduction();
      expect(typeof isProd).toBe('boolean');
      
      // Should be opposite of development mode
      expect(isProd).toBe(!app.isDevelopment());
    });
  });

  describe('Path Configuration', () => {
    test('should get data path', () => {
      const dataPath = app.getDataPath();
      expect(typeof dataPath).toBe('string');
      expect(dataPath.length).toBeGreaterThan(0);
    });

    test('should get config path', () => {
      const configPath = app.getConfigPath();
      expect(typeof configPath).toBe('string');
      expect(configPath.length).toBeGreaterThan(0);
    });

    test('should get log path', () => {
      const logPath = app.getLogPath();
      expect(typeof logPath).toBe('string');
      expect(logPath.length).toBeGreaterThan(0);
    });

    test('should get temp path', () => {
      const tempPath = app.getTempPath();
      expect(typeof tempPath).toBe('string');
      expect(tempPath.length).toBeGreaterThan(0);
    });
  });

  describe('URL and Path Opening', () => {
    // These tests are commented out because they would actually open URLs/files
    // In a real test environment, you might want to mock the exec functions
    
    test.skip('should open URL', async () => {
      // This would actually open a browser
      // await app.openUrl('https://example.com');
    });

    test.skip('should open path', async () => {
      // This would actually open a file/directory
      // await app.openPath('/tmp');
    });
  });

  describe('Broadcasting', () => {
    test('should broadcast message', async () => {
      // Test that broadcasting doesn't throw an error
      await expect(app.broadcast('test-event', { message: 'test' })).resolves.toBeUndefined();
    });
  });
});
