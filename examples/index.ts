#!/usr/bin/env bun
/**
 * Examples Index
 * Run all module examples or individual examples
 */

console.log('🚀 Bun User Modules - Examples Collection\n');

const examples = [
  { name: 'Enhanced File Watching (NEW!)', file: './enhanced-watching-example.ts', description: 'Advanced directory monitoring with real-time events and filtering' },
  { name: 'App Module', file: './app-example.ts', description: 'Application configuration and process management' },
  { name: 'Clipboard Module', file: './clipboard-example.ts', description: 'Clipboard operations and text management' },
  { name: 'Computer Module', file: './computer-example.ts', description: 'System monitoring and hardware information' },
  { name: 'Debug Module', file: './debug-example.ts', description: 'Logging, performance measurement, and debugging' },
  { name: 'Events Module', file: './events-example.ts', description: 'Event system and advanced event patterns' },
  { name: 'Filesystem Module', file: './filesystem-example.ts', description: 'File operations and directory management' },
  { name: 'Network Module', file: './network-example.ts', description: 'HTTP requests, WebSockets, and networking' },
  { name: 'OS Module', file: './os-example.ts', description: 'Operating system commands and process management' },
  { name: 'Storage Module', file: './storage-example.ts', description: 'Local data storage and persistence' },
  { name: 'Utils Module', file: './utils-example.ts', description: 'Comprehensive utility functions and helpers' }
];

console.log('Available Examples:');
examples.forEach((example, index) => {
  console.log(`${index + 1}. ${example.name} - ${example.description}`);
});

console.log('\nTo run an example:');
console.log('  bun run examples/[example-file].ts');
console.log('\nTo run all examples:');
console.log('  bun run examples/run-all.ts');

export { examples };
