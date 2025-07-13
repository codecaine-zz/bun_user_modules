#!/usr/bin/env bun
/**
 * App Module Example (Enhanced)
 * Comprehensive demonstration of application lifecycle, configuration, and system integration
 * 
 * This example showcases:
 * - Application configuration and state management
 * - Environment variables and runtime configuration
 * - Process monitoring and system information
 * - Command-line argument parsing and handling
 * - Application lifecycle events
 * - Inter-process communication and broadcasting
 * - Development vs production environment handling
 * - Path management and directory structure
 */

import { app } from '../index';

interface AppExampleResult {
  section: string;
  success: boolean;
  data?: any;
  error?: Error;
}

class AppExampleRunner {
  private results: AppExampleResult[] = [];
  private originalConfig: any;
  private originalEnv: string | undefined;

  async runExample(): Promise<void> {
    console.log('🚀 App Module - Complete Application Management Demo\n');
    console.log('📋 This example demonstrates enterprise-grade app configuration and monitoring');
    console.log('🎯 Learn how to build robust, configurable applications with proper lifecycle management\n');

    // Store original state for cleanup
    this.originalConfig = app.getConfig();
    this.originalEnv = app.getEnvironmentVariable('NODE_ENV');

    const sections = [
      { name: 'Configuration Management', icon: '⚙️', method: this.demoConfigurationManagement.bind(this) },
      { name: 'Environment & Runtime', icon: '🌍', method: this.demoEnvironmentManagement.bind(this) },
      { name: 'Process Monitoring', icon: '📊', method: this.demoProcessMonitoring.bind(this) },
      { name: 'Command Line Interface', icon: '💻', method: this.demoCommandLineInterface.bind(this) },
      { name: 'System Information', icon: '🖥️', method: this.demoSystemInformation.bind(this) },
      { name: 'Application Paths', icon: '📁', method: this.demoApplicationPaths.bind(this) },
      { name: 'Development Tools', icon: '🔧', method: this.demoDevelopmentTools.bind(this) },
      { name: 'Inter-Process Communication', icon: '📡', method: this.demoIPC.bind(this) }
    ];

    for (const section of sections) {
      await this.runSection(section.name, section.icon, section.method);
    }

    this.displaySummary();
    await this.cleanup();
  }

  private async runSection(name: string, icon: string, method: () => Promise<void>): Promise<void> {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`${icon} ${name}`);
    console.log(`${'─'.repeat(80)}`);

    try {
      await method();
      this.results.push({ section: name, success: true });
      console.log(`✅ ${name} demonstration completed successfully`);
    } catch (error) {
      this.results.push({ section: name, success: false, error: error as Error });
      console.error(`❌ Error in ${name}:`, error);
    }
  }

  private async demoConfigurationManagement(): Promise<void> {
    console.log('⚙️ Application Configuration Management\n');

    // Show initial configuration
    const initialConfig = app.getConfig();
    console.log('📋 Initial Configuration:');
    console.log('   ', JSON.stringify(initialConfig, null, 2));

    // Demonstrate configuration updates
    const appConfigs = [
      {
        name: 'Development App',
        version: '1.0.0-dev',
        debug: true,
        features: { analytics: false, debugging: true },
        database: { host: 'localhost', port: 5432 }
      },
      {
        name: 'Production App',
        version: '1.0.0',
        debug: false,
        features: { analytics: true, debugging: false },
        database: { host: 'prod-db.example.com', port: 5432 }
      }
    ];

    console.log('\n🔄 Configuration Updates:');
    for (const config of appConfigs) {
      app.setConfig(config);
      const updatedConfig = app.getConfig();
      console.log(`\n   📝 Set ${config.name} config:`);
      console.log(`      • Name: ${updatedConfig.name}`);
      console.log(`      • Version: ${updatedConfig.version}`);
      console.log(`      • Debug Mode: ${(updatedConfig as any).debug ? 'ON' : 'OFF'}`);
      console.log(`      • Database: ${(updatedConfig as any).database?.host}:${(updatedConfig as any).database?.port}`);
      console.log(`      • Features: ${Object.entries((updatedConfig as any).features || {}).map(([k, v]) => `${k}=${v}`).join(', ')}`);
    }

    // Demonstrate partial configuration updates
    console.log('\n🔧 Partial Configuration Updates:');
    app.setConfig({ ...app.getConfig(), version: '1.1.0', ...(app.getConfig() as any).lastUpdated ? {} : { lastUpdated: new Date().toISOString() } } as any);
    console.log('   ✓ Updated version and added timestamp');
    console.log('   📌 Final config name:', app.getConfig().name);
    console.log('   📌 Final config version:', app.getConfig().version);
  }

  private async demoEnvironmentManagement(): Promise<void> {
    console.log('🌍 Environment Variables & Runtime Management\n');

    // Critical environment variables
    const criticalEnvVars = [
      'NODE_ENV',
      'PATH',
      'HOME',
      'USER',
      'SHELL',
      'PWD'
    ];

    console.log('🔍 System Environment Analysis:');
    criticalEnvVars.forEach(varName => {
      const value = app.getEnvironmentVariable(varName);
      if (value) {
        const displayValue = varName === 'PATH' ? `${value.split(':').length} paths` : 
                            value.length > 50 ? `${value.substring(0, 47)}...` : value;
        console.log(`   • ${varName}: ${displayValue}`);
      } else {
        console.log(`   • ${varName}: (not set)`);
      }
    });

    // Application-specific environment variables
    console.log('\n⚙️ Application Environment Setup:');
    const appEnvVars = {
      'BUN_MODULES_ENV': 'example',
      'BUN_MODULES_DEBUG': 'true',
      'BUN_MODULES_LOG_LEVEL': 'info',
      'BUN_MODULES_CACHE_TTL': '3600',
      'BUN_MODULES_API_URL': 'https://api.example.com'
    };

    Object.entries(appEnvVars).forEach(([key, value]) => {
      app.setEnvironmentVariable(key, value);
      const retrieved = app.getEnvironmentVariable(key);
      console.log(`   ✓ Set ${key}: ${retrieved}`);
    });

    // Environment-based configuration
    console.log('\n🎯 Environment-Based Configuration:');
    const nodeEnv = app.getEnvironmentVariable('NODE_ENV') || 'development';
    console.log(`   📍 Current NODE_ENV: ${nodeEnv}`);
    
    // Simulate different environment configurations
    const environments = ['development', 'staging', 'production'];
    environments.forEach(env => {
      app.setEnvironmentVariable('NODE_ENV', env);
      console.log(`   🌍 ${env.toUpperCase()} mode:`);
      console.log(`      • Development tools: ${app.isDevelopment() ? 'enabled' : 'disabled'}`);
      console.log(`      • Production optimizations: ${app.isProduction() ? 'enabled' : 'disabled'}`);
      console.log(`      • Debug logging: ${env === 'development' ? 'verbose' : 'minimal'}`);
    });
  }

  private async demoProcessMonitoring(): Promise<void> {
    console.log('📊 Process Monitoring & Performance Tracking\n');

    // Basic process information
    console.log('🔍 Process Identity:');
    console.log(`   • Process ID: ${app.getProcessId()}`);
    console.log(`   • Parent Process ID: ${app.getParentProcessId()}`);
    console.log(`   • Runtime: ${app.getRuntimeVersion()}`);

    // Memory and performance monitoring
    console.log('\n💾 Memory Usage Analysis:');
    const memoryUsage = app.getMemoryUsage();
    Object.entries(memoryUsage).forEach(([key, value]) => {
      const mb = typeof value === 'number' ? (value / 1024 / 1024).toFixed(2) : value;
      console.log(`   • ${key}: ${mb} MB`);
    });

    // CPU usage tracking
    console.log('\n⚡ Performance Metrics:');
    const startTime = Date.now();
    const initialCpu = app.getCpuUsage();
    
    // Simulate some CPU work
    let workCounter = 0;
    for (let i = 0; i < 100000; i++) {
      workCounter += Math.sqrt(i);
    }
    
    const endTime = Date.now();
    const finalCpu = app.getCpuUsage();
    
    console.log(`   • Work completed: ${workCounter.toFixed(0)} operations`);
    console.log(`   • Execution time: ${endTime - startTime}ms`);
    console.log(`   • Initial CPU usage: ${JSON.stringify(initialCpu)}`);
    console.log(`   • Final CPU usage: ${JSON.stringify(finalCpu)}`);

    // Application uptime
    const uptime = app.getUptime();
    const uptimeMinutes = Math.floor(uptime / 60);
    const uptimeSeconds = (uptime % 60).toFixed(2);
    console.log(`\n⏱️ Application Lifecycle:`);
    console.log(`   • Uptime: ${uptimeMinutes}m ${uptimeSeconds}s`);
    console.log(`   • Started at: ${new Date(Date.now() - uptime * 1000).toISOString()}`);
  }

  private async demoCommandLineInterface(): Promise<void> {
    console.log('💻 Command Line Interface & Argument Processing\n');

    // Raw command line arguments
    const rawArgs = app.getCommandLineArguments();
    console.log('📝 Raw Command Line Arguments:');
    rawArgs.forEach((arg, index) => {
      console.log(`   ${index}: "${arg}"`);
    });

    // Parsed arguments (assuming a basic parser)
    const parsedArgs = app.getParsedArguments();
    console.log('\n🔧 Parsed Arguments:');
    console.log('   ', JSON.stringify(parsedArgs, null, 2));

    // Demonstrate different argument patterns
    console.log('\n📋 Argument Analysis:');
    const argTypes = {
      flags: rawArgs.filter(arg => arg.startsWith('--')),
      shortFlags: rawArgs.filter(arg => arg.startsWith('-') && !arg.startsWith('--')),
      values: rawArgs.filter(arg => !arg.startsWith('-')),
      script: rawArgs[0] || 'unknown'
    };

    console.log(`   • Script: ${argTypes.script}`);
    console.log(`   • Long flags (--): ${argTypes.flags.length ? argTypes.flags.join(', ') : 'none'}`);
    console.log(`   • Short flags (-): ${argTypes.shortFlags.length ? argTypes.shortFlags.join(', ') : 'none'}`);
    console.log(`   • Values: ${argTypes.values.length ? argTypes.values.slice(1).join(', ') : 'none'}`);

    // Command line help generation
    console.log('\n📖 Example CLI Usage:');
    console.log('   bun run app-example.ts --env production --debug --port 3000');
    console.log('   bun run app-example.ts -e prod -d -p 8080');
    console.log('   bun run app-example.ts --config config.json --verbose');
  }

  private async demoSystemInformation(): Promise<void> {
    console.log('🖥️ System Information & Environment Detection\n');

    const systemInfo = app.getSystemInfo();
    
    console.log('💻 System Overview:');
    console.log(`   • Platform: ${systemInfo.platform}`);
    console.log(`   • Architecture: ${systemInfo.arch}`);
    console.log(`   • OS Release: ${systemInfo.release}`);
    console.log(`   • Hostname: ${systemInfo.hostname || 'Unknown'}`);
    console.log(`   • Total Memory: ${(systemInfo.totalmem / 1024 / 1024 / 1024).toFixed(2)} GB`);

    // Platform-specific features
    console.log('\n🎯 Platform-Specific Features:');
    switch (systemInfo.platform) {
      case 'darwin':
        console.log('   🍎 macOS Detected:');
        console.log('      • Clipboard integration available');
        console.log('      • Native notifications supported');
        console.log('      • Keychain access possible');
        break;
      case 'linux':
        console.log('   🐧 Linux Detected:');
        console.log('      • Package manager integration');
        console.log('      • SystemD service support');
        console.log('      • Container deployment ready');
        break;
      case 'win32':
        console.log('   🪟 Windows Detected:');
        console.log('      • Registry access available');
        console.log('      • Windows services support');
        console.log('      • PowerShell integration');
        break;
      default:
        console.log(`   ❓ Platform ${systemInfo.platform} detected`);
    }

    // Architecture-specific optimizations
    console.log('\n⚙️ Architecture Optimizations:');
    switch (systemInfo.arch) {
      case 'x64':
        console.log('   • 64-bit optimizations enabled');
        console.log('   • Large memory space available');
        break;
      case 'arm64':
        console.log('   • ARM optimizations enabled');
        console.log('   • Energy-efficient processing');
        break;
      default:
        console.log(`   • Standard optimizations for ${systemInfo.arch}`);
    }
  }

  private async demoApplicationPaths(): Promise<void> {
    console.log('📁 Application Path Management & Directory Structure\n');

    const paths = {
      'Working Directory': app.getCurrentWorkingDirectory(),
      'Data Path': app.getDataPath(),
      'Config Path': app.getConfigPath(),
      'Log Path': app.getLogPath(),
      'Temp Path': app.getTempPath()
    };

    console.log('📂 Application Directories:');
    Object.entries(paths).forEach(([name, path]) => {
      console.log(`   • ${name}: ${path}`);
    });

    // Directory structure recommendations
    console.log('\n🏗️ Recommended Directory Structure:');
    console.log('   📁 project-root/');
    console.log('   ├── 📁 config/          # Application configuration');
    console.log('   ├── 📁 data/            # Application data storage');
    console.log('   ├── 📁 logs/            # Log files');
    console.log('   ├── 📁 temp/            # Temporary files');
    console.log('   ├── 📁 cache/           # Cache storage');
    console.log('   └── 📁 uploads/         # User uploads');

    // Path utilities demonstration
    console.log('\n🔧 Path Management Best Practices:');
    console.log('   ✓ Use absolute paths for reliability');
    console.log('   ✓ Respect OS-specific path conventions');
    console.log('   ✓ Implement proper cleanup for temp files');
    console.log('   ✓ Handle path permissions appropriately');
    console.log('   ✓ Use environment variables for configuration');
  }

  private async demoDevelopmentTools(): Promise<void> {
    console.log('🔧 Development Tools & Environment Detection\n');

    // Environment detection
    console.log('🌍 Environment Detection:');
    console.log(`   • Development Mode: ${app.isDevelopment() ? '✅ ENABLED' : '❌ DISABLED'}`);
    console.log(`   • Production Mode: ${app.isProduction() ? '✅ ENABLED' : '❌ DISABLED'}`);

    // Development features
    if (app.isDevelopment()) {
      console.log('\n🛠️ Development Features Available:');
      console.log('   ✓ Hot reloading');
      console.log('   ✓ Verbose error messages');
      console.log('   ✓ Debug logging');
      console.log('   ✓ Source maps');
      console.log('   ✓ Development server');
    } else {
      console.log('\n🚀 Production Optimizations:');
      console.log('   ✓ Minified assets');
      console.log('   ✓ Compressed responses');
      console.log('   ✓ Error reporting');
      console.log('   ✓ Performance monitoring');
      console.log('   ✓ Security hardening');
    }

    // Configuration recommendations
    console.log('\n⚙️ Configuration Recommendations:');
    const currentEnv = app.getEnvironmentVariable('NODE_ENV') || 'development';
    
    const recommendations = {
      development: [
        'Enable debug logging',
        'Use local databases',
        'Disable caching',
        'Enable hot reloading'
      ],
      staging: [
        'Mirror production config',
        'Enable performance profiling',
        'Use production-like data',
        'Test deployment procedures'
      ],
      production: [
        'Enable error reporting',
        'Configure monitoring',
        'Optimize for performance',
        'Enable security features'
      ]
    };

    console.log(`   📋 For ${currentEnv.toUpperCase()} environment:`);
    (recommendations[currentEnv as keyof typeof recommendations] || recommendations.development)
      .forEach(rec => console.log(`      • ${rec}`));
  }

  private async demoIPC(): Promise<void> {
    console.log('📡 Inter-Process Communication & Broadcasting\n');

    // Event broadcasting
    console.log('📢 Event Broadcasting:');
    
    const events = [
      { name: 'app-started', data: { timestamp: Date.now(), version: '1.0.0' } },
      { name: 'user-action', data: { action: 'click', target: 'button', userId: 'user123' } },
      { name: 'system-event', data: { type: 'memory-warning', level: 'warning' } },
      { name: 'custom-event', data: { message: 'Hello from example!', priority: 'high' } }
    ];

    events.forEach((event, index) => {
      console.log(`   📤 Broadcasting event ${index + 1}: ${event.name}`);
      console.log(`      Data: ${JSON.stringify(event.data)}`);
      
      try {
        app.broadcast(event.name, event.data);
        console.log(`      ✅ Successfully broadcasted`);
      } catch (error) {
        console.log(`      ❌ Broadcast failed: ${error}`);
      }
    });

    // IPC use cases
    console.log('\n🔗 IPC Use Cases:');
    console.log('   • Multi-window applications');
    console.log('   • Worker process coordination');
    console.log('   • Real-time status updates');
    console.log('   • Event-driven architecture');
    console.log('   • Microservice communication');

    // Best practices
    console.log('\n📋 IPC Best Practices:');
    console.log('   ✓ Use structured event names');
    console.log('   ✓ Include timestamps in event data');
    console.log('   ✓ Handle broadcasting errors gracefully');
    console.log('   ✓ Implement event versioning');
    console.log('   ✓ Monitor event queue performance');
  }

  private displaySummary(): void {
    const successCount = this.results.filter(r => r.success).length;
    const failureCount = this.results.filter(r => !r.success).length;

    console.log(`\n${'═'.repeat(80)}`);
    console.log('📊 APP MODULE DEMONSTRATION SUMMARY');
    console.log(`${'═'.repeat(80)}`);
    console.log(`🎯 Total Sections: ${this.results.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📈 Success Rate: ${((successCount / this.results.length) * 100).toFixed(1)}%`);

    if (failureCount > 0) {
      console.log(`\n🔍 Failed Sections:`);
      this.results
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`   • ${result.section}: ${result.error?.message}`);
        });
    }

    console.log(`\n💡 Key Features Demonstrated:`);
    console.log(`   • Complete application configuration management`);
    console.log(`   • Environment variable handling and runtime detection`);
    console.log(`   • Process monitoring and performance tracking`);
    console.log(`   • Command-line interface and argument processing`);
    console.log(`   • System information and platform detection`);
    console.log(`   • Application path management and directory structure`);
    console.log(`   • Development vs production environment handling`);
    console.log(`   • Inter-process communication and event broadcasting`);
    console.log(`${'═'.repeat(80)}\n`);
  }

  private async cleanup(): Promise<void> {
    // Restore original configuration
    if (this.originalConfig) {
      app.setConfig(this.originalConfig);
    }
    
    // Restore original NODE_ENV
    if (this.originalEnv) {
      app.setEnvironmentVariable('NODE_ENV', this.originalEnv);
    }
    
    console.log('🧹 Cleanup completed - original configuration restored');
  }
}

// Main execution
async function runAppExample(): Promise<void> {
  try {
    const runner = new AppExampleRunner();
    await runner.runExample();
  } catch (error) {
    console.error('❌ Fatal error in app example:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  await runAppExample();
}
