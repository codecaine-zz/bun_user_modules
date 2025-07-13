#!/usr/bin/env bun
/**
 * OS Module Example
 * Demonstrates operating system commands and process management
 */

import { os } from '../index';

async function runOSExample() {
  console.log('🖥️ OS Module Example\n');

  try {
    // Command execution
    console.log('⚡ Command Execution:');
    
    // Simple command
    const result = await os.execCommand('echo "Hello from OS module"');
    console.log('✓ Command output:', result.stdOut.trim());
    console.log('✓ Command success:', result.success);

    // Command with timeout
    const quickResult = await os.execCommand('echo "Quick command"', { timeout: 1000 });
    console.log('✓ Quick command output:', quickResult.stdOut.trim());

    // Process management
    console.log('\n🔄 Process Management:');
    
    // Spawn a process
    const processInfo = os.spawnProcess('echo', ['Hello', 'World']);
    console.log('✓ Process spawned with ID:', processInfo.id);

    // Get process list
    const processes = os.getSpawnedProcesses();
    console.log('✓ Active spawned processes:', processes.length);

    // System information
    console.log('\n💻 System Information:');
    const systemInfo = os.getSystemInfo();
    console.log('✓ Platform:', systemInfo.platform);
    console.log('✓ Architecture:', systemInfo.arch);
    console.log('✓ Username:', systemInfo.username);

    // Directory operations
    console.log('\n📁 Directory Operations:');
    const homeDir = os.getHomeDirectory();
    console.log('✓ Home directory:', homeDir);

    const configDir = os.getConfigDirectory();
    console.log('✓ Config directory:', configDir);

    const tempDir = os.getTempDirectory();
    console.log('✓ Temp directory:', tempDir);

    // Current working directory
    const cwd = os.getCurrentWorkingDirectory();
    console.log('✓ Current directory:', cwd);

    // Environment variables
    console.log('\n🌍 Environment Variables:');
    const nodeEnv = os.getEnvironmentVariable('NODE_ENV');
    console.log('✓ NODE_ENV:', nodeEnv || 'not set');

    const allEnvVars = os.getAllEnvironmentVariables();
    console.log('✓ Total environment variables:', Object.keys(allEnvVars).length);

    console.log('\n✅ OS module example completed!');

  } catch (error) {
    console.error('❌ Error in OS example:', error);
  }
}

// Run the example
if (import.meta.main) {
  await runOSExample();
}
