#!/usr/bin/env bun
/**
 * App Module Example
 * Demonstrates application configuration, environment management, and system integration
 */

import { app } from '../index';

async function runAppExample() {
  console.log('🚀 App Module Example\n');

  // Configuration management
  console.log('📋 Configuration Management:');
  const config = app.getConfig();
  console.log('Default config:', config);

  app.setConfig({ name: 'Example App', version: '2.0.0' });
  console.log('Updated config:', app.getConfig());

  // Environment variables
  console.log('\n🌍 Environment Management:');
  console.log('NODE_ENV:', app.getEnvironmentVariable('NODE_ENV') || 'development');
  console.log('PATH exists:', !!app.getEnvironmentVariable('PATH'));
  
  app.setEnvironmentVariable('EXAMPLE_VAR', 'Hello from Bun User Modules!');
  console.log('Set EXAMPLE_VAR:', app.getEnvironmentVariable('EXAMPLE_VAR'));

  // Process information
  console.log('\n⚙️ Process Information:');
  console.log('Process ID:', app.getProcessId());
  console.log('Parent PID:', app.getParentProcessId());
  console.log('Memory usage:', app.getMemoryUsage());
  console.log('CPU usage:', app.getCpuUsage());
  console.log('Uptime:', app.getUptime(), 'seconds');
  console.log('Runtime version:', app.getRuntimeVersion());

  // Command line arguments
  console.log('\n📝 Command Line Arguments:');
  console.log('Raw args:', app.getCommandLineArguments());
  console.log('Parsed args:', app.getParsedArguments());

  // Working directory
  console.log('\n📁 Working Directory:');
  const originalCwd = app.getCurrentWorkingDirectory();
  console.log('Current directory:', originalCwd);

  // System information
  console.log('\n💻 System Information:');
  const systemInfo = app.getSystemInfo();
  console.log('Platform:', systemInfo.platform);
  console.log('Architecture:', systemInfo.arch);
  console.log('Release:', systemInfo.release);

  // Development/Production mode
  console.log('\n🔧 Environment Mode:');
  console.log('Development mode:', app.isDevelopment());
  console.log('Production mode:', app.isProduction());

  // Path configuration
  console.log('\n📂 Application Paths:');
  console.log('Data path:', app.getDataPath());
  console.log('Config path:', app.getConfigPath());
  console.log('Log path:', app.getLogPath());
  console.log('Temp path:', app.getTempPath());

  // Broadcasting (for multi-window apps)
  console.log('\n📡 Broadcasting:');
  app.broadcast('example-event', { message: 'Hello from example!', timestamp: Date.now() });
  console.log('Broadcast sent: example-event');

  console.log('\n✅ App module example completed!');
}

// Run the example
if (import.meta.main) {
  await runAppExample();
}
