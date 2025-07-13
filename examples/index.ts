#!/usr/bin/env bun
/**
 * Examples Index (Improved)
 * Interactive examples runner with enhanced functionality
 */

import { colors } from '../modules/utils';

interface Example {
  name: string;
  file: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  prerequisites?: string[];
}

const examples: Example[] = [
  {
    name: 'Utils Module',
    file: './utils-example.ts',
    description: 'Comprehensive utility functions including math, strings, arrays, validation, and more',
    category: 'Core',
    difficulty: 'Beginner',
    estimatedTime: '3-5 min'
  },
  {
    name: 'App Module',
    file: './app-example.ts',
    description: 'Application configuration, process management, and system integration',
    category: 'System',
    difficulty: 'Beginner',
    estimatedTime: '2-3 min'
  },
  {
    name: 'Filesystem Module',
    file: './filesystem-example.ts',
    description: 'File operations, directory management, and file system watching',
    category: 'Core',
    difficulty: 'Intermediate',
    estimatedTime: '4-6 min'
  },
  {
    name: 'Network Module',
    file: './network-example.ts',
    description: 'HTTP requests, WebSockets, networking utilities, and API interactions',
    category: 'Network',
    difficulty: 'Intermediate',
    estimatedTime: '5-7 min'
  },
  {
    name: 'Storage Module',
    file: './storage-example.ts',
    description: 'Local data persistence, caching, and storage management',
    category: 'Data',
    difficulty: 'Beginner',
    estimatedTime: '3-4 min'
  },
  {
    name: 'Events Module',
    file: './events-example.ts',
    description: 'Event-driven architecture, custom events, and reactive patterns',
    category: 'Core',
    difficulty: 'Advanced',
    estimatedTime: '6-8 min'
  },
  {
    name: 'Debug Module',
    file: './debug-example.ts',
    description: 'Logging, performance measurement, debugging tools, and profiling',
    category: 'Development',
    difficulty: 'Intermediate',
    estimatedTime: '4-5 min'
  },
  {
    name: 'Computer Module',
    file: './computer-example.ts',
    description: 'System monitoring, hardware information, and resource tracking',
    category: 'System',
    difficulty: 'Intermediate',
    estimatedTime: '3-4 min'
  },
  {
    name: 'OS Module',
    file: './os-example.ts',
    description: 'Operating system commands, process management, and system interaction',
    category: 'System',
    difficulty: 'Advanced',
    estimatedTime: '5-7 min'
  },
  {
    name: 'Clipboard Module',
    file: './clipboard-example.ts',
    description: 'Clipboard operations, text/image management, and data transfer',
    category: 'System',
    difficulty: 'Beginner',
    estimatedTime: '2-3 min'
  },
  {
    name: 'Enhanced File Watching',
    file: './enhanced-watching-example.ts',
    description: 'Advanced directory monitoring with real-time events and intelligent filtering',
    category: 'Advanced',
    difficulty: 'Advanced',
    estimatedTime: '8-10 min',
    prerequisites: ['Filesystem Module', 'Events Module']
  }
];

function displayWelcome() {
  console.log('🚀 Bun User Modules - Interactive Examples Collection\n');
  console.log('📚 Learn how to use each module with comprehensive, hands-on examples');
  console.log('🎯 Each example includes practical use cases and best practices\n');
}

function displayExamplesByCategory() {
  const categories = [...new Set(examples.map(e => e.category))];
  
  categories.forEach(category => {
    console.log(`\n📁 ${category.toUpperCase()} MODULES:`);
    const categoryExamples = examples.filter(e => e.category === category);
    
    categoryExamples.forEach((example, index) => {
      const globalIndex = examples.indexOf(example) + 1;
      const difficultyIcon = {
        'Beginner': '🟢',
        'Intermediate': '🟡',
        'Advanced': '🔴'
      }[example.difficulty];
      
      console.log(`  ${globalIndex.toString().padStart(2)}. ${difficultyIcon} ${example.name}`);
      console.log(`      ${example.description}`);
      console.log(`      ⏱️  ${example.estimatedTime} | 🎯 ${example.difficulty}`);
      if (example.prerequisites) {
        console.log(`      📋 Prerequisites: ${example.prerequisites.join(', ')}`);
      }
      console.log('');
    });
  });
}

function displayQuickCommands() {
  console.log('\n🎮 Quick Commands:');
  console.log('  📖 Run specific example:  bun run examples/[example-file].ts');
  console.log('  🏃 Run all examples:      bun run examples/run-all.ts');
  console.log('  🧪 Run tests:             bun test');
  console.log('  📊 View API docs:         Check README.md files in each module\n');
}

function displayLegend() {
  console.log('🔍 Difficulty Legend:');
  console.log('  🟢 Beginner    - Basic concepts and simple usage');
  console.log('  🟡 Intermediate - More complex features and patterns');
  console.log('  🔴 Advanced    - Complex integrations and advanced concepts\n');
}

if (import.meta.main) {
  displayWelcome();
  displayLegend();
  displayExamplesByCategory();
  displayQuickCommands();
}

export { examples, type Example };
