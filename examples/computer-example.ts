#!/usr/bin/env bun
/**
 * Computer Module Example
 * Demonstrates system monitoring, hardware information, and performance metrics
 */

import { computer } from '../index';

async function runComputerExample() {
  console.log('💻 Computer Module Example\n');

  // CPU Information
  console.log('🔧 CPU Information:');
  const cpuInfo = computer.getCpuInfo();
  console.log('CPU Model:', cpuInfo.model);
  console.log('CPU Cores:', cpuInfo.count);
  console.log('CPU Speed:', cpuInfo.speed, 'MHz');

  // Memory Information
  console.log('\n🧠 Memory Information:');
  const memInfo = computer.getMemoryInfo();
  console.log('Total Memory:', (memInfo.total / 1024 / 1024 / 1024).toFixed(2), 'GB');
  console.log('Free Memory:', (memInfo.free / 1024 / 1024 / 1024).toFixed(2), 'GB');
  console.log('Used Memory:', (memInfo.used / 1024 / 1024 / 1024).toFixed(2), 'GB');
  console.log('Memory Usage:', memInfo.usagePercentage.toFixed(1), '%');

  // System Uptime
  console.log('\n⏰ System Information:');
  const uptime = computer.getUptime();
  const uptimeHours = (uptime / 3600).toFixed(1);
  console.log('System Uptime:', uptimeHours, 'hours');

  // Load Average
  const loadAvg = computer.getLoadAverage();
  console.log('Load Average:', loadAvg.map(load => load.toFixed(2)).join(', '));

  // OS Information
  const osInfo = computer.getOSInfo();
  console.log('OS Platform:', osInfo.platform);
  console.log('OS Release:', osInfo.release);
  console.log('OS Architecture:', osInfo.arch);
  console.log('Hostname:', osInfo.hostname);

  // User Information
  console.log('\n👤 User Information:');
  const userInfo = computer.getCurrentUser();
  console.log('Current User:', userInfo.username);
  console.log('Home Directory:', userInfo.home);
  console.log('Shell:', userInfo.shell);

  const isElevated = computer.isElevated();
  console.log('Running as Admin/Sudo:', isElevated);

  // Comprehensive System Info
  console.log('\n📊 Comprehensive System Info:');
  const systemInfo = computer.getSystemInfo();
  console.log('Total Memory:', (systemInfo.totalmem / 1024 / 1024 / 1024).toFixed(2), 'GB');
  console.log('CPU Cores:', systemInfo.cpus.length);
  console.log('Platform:', systemInfo.platform);
  console.log('Hostname:', systemInfo.hostname);

  // Disk Usage (async operation)
  console.log('\n💾 Disk Usage:');
  try {
    const diskUsage = await computer.getDiskUsage('/');
    console.log('Total Disk Space:', (diskUsage.total / 1024 / 1024 / 1024).toFixed(2), 'GB');
    console.log('Free Space:', (diskUsage.free / 1024 / 1024 / 1024).toFixed(2), 'GB');
    console.log('Disk Usage:', diskUsage.usagePercentage.toFixed(1), '%');
  } catch (error) {
    console.log('❌ Could not get disk usage:', error);
  }

  // Process List (async operation)
  console.log('\n🔄 Running Processes (top 10):');
  try {
    const processes = await computer.getProcessList();
    const topProcesses = processes.slice(0, 10);
    
    console.log('PID\t\tName\t\t\tCPU%\tMemory%');
    console.log('─'.repeat(60));
    
    for (const process of topProcesses) {
      const pid = process.pid.toString().padEnd(8);
      const name = (process.name || 'Unknown').substring(0, 20).padEnd(20);
      const cpu = process.cpu ? process.cpu.toFixed(1).padEnd(6) : 'N/A   ';
      const memory = process.memory ? process.memory.toFixed(1).padEnd(8) : 'N/A     ';
      
      console.log(`${pid}\t${name}\t${cpu}\t${memory}`);
    }
  } catch (error) {
    console.log('❌ Could not get process list:', error);
  }

  // System Health Score
  console.log('\n🏥 System Health:');
  const healthScore = computer.getSystemHealthScore();
  console.log('Overall Health Score:', healthScore.score);
  console.log('Health Status:', healthScore.status);
  console.log('Memory Factor:', healthScore.factors.memory);
  console.log('CPU Factor:', healthScore.factors.cpu);

  // Check if restart is needed
  console.log('\n🔄 System Maintenance:');
  try {
    const restartInfo = await computer.needsRestart();
    console.log('Restart Needed:', restartInfo.needed);
    if (restartInfo.reason) {
      console.log('Reason:', restartInfo.reason);
    }
    if (restartInfo.lastBoot) {
      console.log('Last Boot:', restartInfo.lastBoot.toLocaleString());
    }
  } catch (error) {
    console.log('❌ Could not check restart status:', error);
  }

  // Performance monitoring over time
  console.log('\n📈 Performance Monitoring (5 samples):');
  for (let i = 0; i < 5; i++) {
    const timestamp = new Date().toLocaleTimeString();
    const memory = computer.getMemoryInfo();
    const load = computer.getLoadAverage();
    
    console.log(`[${timestamp}] Memory: ${memory.usagePercentage.toFixed(1)}%, Load: ${(load[0] || 0).toFixed(2)}`);
    
    // Wait 1 second between samples
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n✅ Computer module example completed!');
}

// Run the example
if (import.meta.main) {
  await runComputerExample();
}
