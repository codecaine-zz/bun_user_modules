# 📚 Bun User Modules - Examples (Enhanced)

Welcome to the comprehensive examples collection for Bun User Modules! This directory contains hands-on, practical examples demonstrating every feature and capability of the module system.

## 🚀 Quick Start

```bash
# View all available examples with categories and difficulty levels
bun run examples/index.ts

# Run a specific example
bun run examples/utils-example.ts

# Run all examples sequentially (recommended for learning)
bun run examples/run-all.ts

# Run all examples in parallel (faster execution)
bun run examples/run-all.ts --parallel

# Filter examples by category
bun run examples/run-all.ts --category "Core"

# Filter examples by difficulty
bun run examples/run-all.ts --difficulty "Beginner"
```

## 📁 Example Categories & Difficulty Levels

### 🟢 Core Modules (Beginner-Friendly)
Essential modules that form the foundation of most applications.

- **[Utils Module](./utils-example.ts)** ⏱️ 3-5 min - Comprehensive utility functions
- **[Storage Module](./storage-example.ts)** ⏱️ 3-4 min - Data persistence and caching  
- **[App Module](./app-example.ts)** ⏱️ 2-3 min - Application lifecycle and configuration

### 🟡 System & Network Modules (Intermediate)
System-level integrations and network operations.

- **[Filesystem Module](./filesystem-example.ts)** ⏱️ 4-6 min - File operations and management
- **[Network Module](./network-example.ts)** ⏱️ 5-7 min - HTTP, WebSockets, and networking utilities
- **[Computer Module](./computer-example.ts)** ⏱️ 3-4 min - Hardware monitoring and system info
- **[Debug Module](./debug-example.ts)** ⏱️ 4-5 min - Logging, profiling, and debugging tools
- **[Clipboard Module](./clipboard-example.ts)** ⏱️ 2-3 min - System clipboard operations

### � Advanced Modules (Complex)
Sophisticated features requiring deeper understanding.

- **[Events Module](./events-example.ts)** ⏱️ 6-8 min - Event-driven architecture patterns
- **[OS Module](./os-example.ts)** ⏱️ 5-7 min - Operating system command execution
- **[Enhanced File Watching](./enhanced-watching-example.ts)** ⏱️ 8-10 min - Real-time directory monitoring

## 🎯 Enhanced Example Features

Each improved example now includes:

- ✅ **Real-world use cases** - Practical scenarios you'll encounter in development
- 🛡️ **Comprehensive error handling** - Robust error management and recovery patterns
- 📊 **Built-in performance metrics** - Timing and efficiency measurements for each section
- 🧪 **Best practices demonstrations** - Recommended patterns and approaches
- 📝 **Detailed documentation** - In-code explanations and comprehensive comments
- 🎨 **Professional output formatting** - Clear, organized console output with visual elements
- 🔧 **Modular structure** - Organized into logical sections for easy learning
- 📋 **Summary reporting** - Success rates, timing data, and key takeaways

## 🏃‍♂️ Running Examples

### Individual Examples

```bash
# App Module - Configuration and process management
bun run examples/app-example.ts

# Clipboard Module - Clipboard operations
bun run examples/clipboard-example.ts

# Computer Module - System monitoring
bun run examples/computer-example.ts

# Debug Module - Logging and debugging
bun run examples/debug-example.ts

# Events Module - Event system
bun run examples/events-example.ts

# Filesystem Module - File operations
bun run examples/filesystem-example.ts

# Network Module - HTTP and networking
bun run examples/network-example.ts

# OS Module - Operating system commands
bun run examples/os-example.ts

# Storage Module - Local data storage and security
bun run examples/storage-example.ts

# Utils Module - Comprehensive utilities
bun run examples/utils-example.ts
```

### Run All Examples

```bash
bun run examples/run-all.ts
```

## 📖 Example Overview

### 🏗️ App Module (`app-example.ts`)
- Application configuration management
- Environment variable handling
- Process information and control
- Command line argument parsing
- Development/production mode detection
- System path management

### 📋 Clipboard Module (`clipboard-example.ts`)
- Text clipboard operations (read/write)
- HTML content handling
- Unicode text support
- Format detection
- Clipboard state management
- Sequential operations

### 💻 Computer Module (`computer-example.ts`)
- CPU and memory information
- System uptime and load average
- Disk usage monitoring
- Process list management
- System health scoring
- Performance monitoring

### 🐛 Debug Module (`debug-example.ts`)
- Multi-level logging (debug, info, warn, error)
- Performance measurement and timers
- Memory usage monitoring
- Function tracing
- Log history and filtering
- Debug sessions

### ⚡ Events Module (`events-example.ts`)
- Event listener management
- Promise-based event waiting
- Threshold and debounced events
- System event handling
- Independent event emitters
- Error handling in listeners

### 📁 Filesystem Module (`filesystem-example.ts`)
- Directory creation and management
- File read/write operations
- Path utilities and parsing
- File watching capabilities
- Copy/move operations
- Permission management

### 🌐 Network Module (`network-example.ts`)
- HTTP requests (GET, POST, PUT, DELETE)
- JSON and form data handling
- Network utilities (ping, IP detection)
- URL parsing and building
- WebSocket support
- Error handling

### 🖥️ OS Module (`os-example.ts`)
- Command execution
- Process spawning and management
- System information gathering
- Directory path utilities
- Environment variable access
- Cross-platform compatibility

### 💾 Storage Module (`storage-example.ts`)

- **Basic Operations**: Key-value data storage with JSON serialization
- **Namespaced Storage**: Isolated storage contexts for different app sections
- **Import/Export**: Bulk data operations and backup capabilities
- **Storage Statistics**: Monitoring storage usage and performance
- **🔐 Encrypted Storage**: Secure data storage with XOR encryption
- **⏰ TTL Storage**: Time-limited storage for temporary sensitive data
- **📚 Versioned Storage**: Audit trails and change history tracking
- **👁️ Observable Storage**: Real-time monitoring and security alerts
- **✅ Data Validation**: Input sanitization and schema validation
- **🔐 Access Control**: Role-based data access patterns
- **📊 Security Audit**: Activity logging and suspicious behavior detection
- **🎫 Session Management**: Secure session creation and validation
- **🔄 Key Rotation**: Encryption key management and rotation
- **💾 Backup & Migration**: Automated backups and data migration tools

### 🛠️ Utils Module (`utils-example.ts`)

- Weighted array operations
- Mathematical utilities
- String manipulation
- Date/time helpers
- Array processing
- Object utilities
- Validation functions
- Performance tools
- Circuit breakers and memoization

## 🎯 Usage Patterns

### Basic Pattern
```typescript
import { moduleName } from '../index';

async function runExample() {
  // Use module functions
  const result = await moduleName.someFunction();
  console.log('Result:', result);
}

if (import.meta.main) {
  await runExample();
}
```

### Error Handling
```typescript
try {
  const result = await moduleName.riskyOperation();
  console.log('✓ Success:', result);
} catch (error) {
  console.error('❌ Error:', error);
}
```

### Cleanup Pattern
```typescript
try {
  // Main operations
} finally {
  // Cleanup resources
  await cleanup();
}
```

## 🔧 Notes

- Examples are designed to be educational and demonstrate best practices
- Some examples may require network access or system permissions
- Error handling is included to show robust usage patterns
- All examples include proper cleanup procedures
- TypeScript types are preserved for better development experience

## 📝 Contributing

When adding new examples:

1. Follow the existing naming convention: `module-example.ts`
2. Include comprehensive error handling
3. Add cleanup procedures in `finally` blocks
4. Use descriptive console output with emojis
5. Update this README with new example information

## ⚠️ Important Notes

- Some system operations may require elevated permissions
- Network examples require internet connectivity
- File system examples create temporary files/directories
- Examples are safe to run and include proper cleanup
- Check individual module documentation for API details

---

For more information about the Bun User Modules library, see the main [README.md](../README.md).
