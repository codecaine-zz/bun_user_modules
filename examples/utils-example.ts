#!/usr/bin/env bun
/**
 * Utils Module Example (Enhanced)
 * Comprehensive demonstration of utility functions with practical use cases
 * 
 * This example showcases:
 * - Mathematical operations and calculations
 * - String manipulation and formatting
 * - Array processing and transformations
 * - Object manipulation utilities
 * - Validation and data integrity checks
 * - Cryptographic operations
 * - Performance measurement tools
 * - Date/time utilities
 * - Color manipulation
 * - Weighted random selection
 */

import * as utils from '../modules/utils';

interface DemoSection {
  name: string;
  icon: string;
  description: string;
  run: () => Promise<void> | void;
}

class UtilsExampleRunner {
  private sections: DemoSection[] = [];
  private results: { section: string; success: boolean; duration: number; error?: Error }[] = [];

  constructor() {
    this.initializeSections();
  }

  private initializeSections() {
    this.sections = [
      {
        name: 'Weighted Array Utilities',
        icon: '⚖️',
        description: 'Probability-based random selection with weighted distributions',
        run: this.demonstrateWeightedArrays.bind(this)
      },
      {
        name: 'Mathematical Operations',
        icon: '🔢',
        description: 'Advanced math utilities for calculations and transformations',
        run: this.demonstrateMathUtils.bind(this)
      },
      {
        name: 'String Manipulation',
        icon: '📝',
        description: 'Text processing, formatting, and transformation utilities',
        run: this.demonstrateStringUtils.bind(this)
      },
      {
        name: 'Array Processing',
        icon: '📊',
        description: 'Advanced array operations, transformations, and algorithms',
        run: this.demonstrateArrayUtils.bind(this)
      },
      {
        name: 'Random Generation',
        icon: '🎲',
        description: 'Secure random number, string, and UUID generation',
        run: this.demonstrateRandomUtils.bind(this)
      },
      {
        name: 'Object Manipulation',
        icon: '🗂️',
        description: 'Object transformation, filtering, and utility operations',
        run: this.demonstrateObjectUtils.bind(this)
      },
      {
        name: 'Data Validation',
        icon: '✅',
        description: 'Input validation for common data types and formats',
        run: this.demonstrateValidation.bind(this)
      },
      {
        name: 'Cryptography & Encoding',
        icon: '🔐',
        description: 'Hashing, encoding, and data security utilities',
        run: this.demonstrateCryptography.bind(this)
      },
      {
        name: 'Performance Measurement',
        icon: '⚡',
        description: 'Benchmarking and performance analysis tools',
        run: this.demonstratePerformance.bind(this)
      },
      {
        name: 'Date & Time Utilities',
        icon: '📅',
        description: 'Date manipulation, formatting, and calculation utilities',
        run: this.demonstrateDateUtils.bind(this)
      },
      {
        name: 'Color Utilities',
        icon: '🎨',
        description: 'Color format conversion and manipulation tools',
        run: this.demonstrateColorUtils.bind(this)
      }
    ];
  }

  async runAllSections() {
    console.log('🛠️ Utils Module - Comprehensive Feature Demonstration\n');
    console.log('📋 This example demonstrates practical use cases for utility functions');
    console.log('🎯 Each section shows real-world applications and best practices\n');

    for (const [index, section] of this.sections.entries()) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`${section.icon} ${section.name} (${index + 1}/${this.sections.length})`);
      console.log(`${section.description}`);
      console.log(`${'─'.repeat(80)}`);

      const startTime = Date.now();
      try {
        await section.run();
        const duration = Date.now() - startTime;
        this.results.push({ section: section.name, success: true, duration });
        console.log(`✅ Section completed in ${duration}ms`);
      } catch (error) {
        const duration = Date.now() - startTime;
        this.results.push({ section: section.name, success: false, duration, error: error as Error });
        console.error(`❌ Error in ${section.name}:`, error);
      }
    }

    this.displaySummary();
  }

  private async demonstrateWeightedArrays() {
    // Basic weighted selection
    const fruits = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
    const weights = [10, 25, 40, 15, 10]; // Cherry is most likely to be picked
    
    console.log('🍎 Fruit Selection with Weights:');
    console.log(`   Fruits: ${fruits.join(', ')}`);
    console.log(`   Weights: ${weights.join(', ')} (higher = more likely)`);
    
    const picks = [];
    for (let i = 0; i < 10; i++) {
      picks.push(utils.weightedArray.pickWeighted(fruits, weights));
    }
    console.log(`✓ 10 Random picks: ${picks.join(', ')}`);

    // Distribution-based selection
    const lootTable = [
      { item: 'Common Item', weight: 70 },
      { item: 'Rare Item', weight: 25 },
      { item: 'Epic Item', weight: 4 },
      { item: 'Legendary Item', weight: 1 }
    ];
    
    const distribution = utils.weightedArray.createDistribution(lootTable);
    console.log('\n🎮 Game Loot Distribution:');
    console.log('   Items and rarities:', lootTable.map(l => `${l.item} (${l.weight}%)`).join(', '));
    
    const loot = distribution.pickMultiple(20);
    const lootCounts = loot.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('✓ 20 Loot drops:', Object.entries(lootCounts).map(([item, count]) => `${item}: ${count}`).join(', '));
  }

  private async demonstrateMathUtils() {
    // Practical math operations
    console.log('� Practical Math Operations:');
    
    // Data normalization
    const scores = [85, 92, 78, 96, 88];
    console.log(`   Raw scores: ${scores.join(', ')}`);
    
    const normalizedScores = scores.map(score => 
      utils.math.map(score, Math.min(...scores), Math.max(...scores), 0, 100)
    );
    console.log(`✓ Normalized (0-100): ${normalizedScores.map(s => s.toFixed(1)).join(', ')}`);

    // Distance calculations for location services
    const locations = [
      { name: 'Store A', x: 0, y: 0 },
      { name: 'Store B', x: 3, y: 4 },
      { name: 'Store C', x: 6, y: 8 }
    ];
    
    console.log('\n📍 Distance Calculations:');
    locations.forEach(loc => {
      const distance = utils.math.distance(0, 0, loc.x, loc.y);
      console.log(`   ${loc.name}: ${distance.toFixed(2)} units from origin`);
    });

    // Financial calculations
    const principal = 1000;
    const rate = 0.05;
    const time = 5;
    const monthlyPayment = principal * (rate / 12) / (1 - Math.pow(1 + rate / 12, -time * 12));
    
    console.log('\n💰 Financial Calculations:');
    console.log(`   Loan amount: $${principal}`);
    console.log(`   Interest rate: ${(rate * 100)}%`);
    console.log(`   Term: ${time} years`);
    console.log(`✓ Monthly payment: $${monthlyPayment.toFixed(2)}`);
    console.log(`✓ Clamped to budget ($200-$50): $${utils.math.clamp(monthlyPayment, 50, 200).toFixed(2)}`);
  }

  private async demonstrateStringUtils() {
    // Content management scenarios
    const userInputs = [
      'hello_world_example',
      'User Name Input',
      'some-kebab-case-string',
      'camelCaseVariable',
      'This is a very long title that needs to be truncated for display in UI components'
    ];

    console.log('📝 Content Management & Formatting:');
    
    userInputs.forEach((input, index) => {
      console.log(`\n   Input ${index + 1}: "${input}"`);
      console.log(`   • Camel Case: ${utils.stringUtils.camelCase(input)}`);
      console.log(`   • Title Case: ${utils.stringUtils.titleCase(input)}`);
      console.log(`   • Snake Case: ${utils.stringUtils.snakeCase(input)}`);
      console.log(`   • Kebab Case: ${utils.stringUtils.kebabCase(input)}`);
      if (input.length > 30) {
        console.log(`   • Truncated: ${utils.stringUtils.truncate(input, 30)}`);
      }
    });

    // Text processing for search
    const searchQueries = ['JavaScript', 'tpircsavaJ', 'hello world', 'dlrow olleh'];
    console.log('\n🔍 Search & Text Processing:');
    searchQueries.forEach(query => {
      const reversed = utils.stringUtils.reverse(query);
      console.log(`   "${query}" → reversed: "${reversed}"`);
    });
  }

  private async demonstrateArrayUtils() {
    // Data processing scenarios
    console.log('📊 Data Processing & Analysis:');
    
    // Dataset simulation
    const salesData = [
      [100, 150, 120],  // Q1
      [180, 200, 175],  // Q2
      [220, 190, 210],  // Q3
      [250, 240, 230]   // Q4
    ];
    
    console.log('   📈 Quarterly Sales Matrix:');
    salesData.forEach((quarter, index) => {
      console.log(`   Q${index + 1}: [${quarter.join(', ')}]`);
    });

    const transposed = utils.arrayUtils.transpose(salesData);
    console.log('\n   📊 Transposed (by month):');
    transposed.forEach((month, index) => {
      console.log(`   Month ${index + 1}: [${month.join(', ')}] (across quarters)`);
    });

    // Set operations for data analysis
    const teamA = [1, 2, 3, 4, 5];
    const teamB = [4, 5, 6, 7, 8];
    const teamC = [3, 5, 7, 9, 11];
    
    console.log('\n👥 Team Member Analysis:');
    console.log(`   Team A: ${teamA.join(', ')}`);
    console.log(`   Team B: ${teamB.join(', ')}`);
    console.log(`   Team C: ${teamC.join(', ')}`);
    console.log(`✓ A ∩ B (shared): ${utils.arrayUtils.intersection(teamA, teamB).join(', ')}`);
    console.log(`✓ A ∪ B (combined): ${utils.arrayUtils.union(teamA, teamB).join(', ')}`);
    console.log(`✓ All teams union: ${utils.arrayUtils.union(teamA, teamB, teamC).join(', ')}`);

    // Nested data flattening
    const nestedData = [
      ['user1', 'user2'],
      ['user3', ['admin1', 'admin2']],
      ['user4'],
      [['superadmin']]
    ];
    console.log('\n🌳 Nested Data Flattening:');
    console.log('   Original:', JSON.stringify(nestedData));
    console.log(`✓ Flattened: ${utils.arrayUtils.flattenDeep(nestedData).join(', ')}`);
  }

  private async demonstrateRandomUtils() {
    console.log('🎲 Secure Random Generation:');
    
    // Gaming scenarios
    console.log('   🎮 Game Development:');
    const diceRolls = Array.from({ length: 10 }, () => utils.randomInt(1, 6));
    console.log(`   • 10 Dice rolls (1-6): ${diceRolls.join(', ')}`);
    
    const criticalHitChance = Array.from({ length: 5 }, () => 
      utils.randomFloat(0, 1) < 0.1 ? 'CRIT!' : 'normal'
    );
    console.log(`   • Critical hits (10% chance): ${criticalHitChance.join(', ')}`);

    // Security and IDs
    console.log('\n   🔒 Security & Identification:');
    console.log(`   • Session ID: ${utils.generateUUID()}`);
    console.log(`   • API Key: ${utils.generateRandomString(32, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')}`);
    console.log(`   • Short Code: ${utils.generateRandomString(6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')}`);

    // Array sampling
    const playerNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace'];
    const selectedPlayers = utils.pickRandom(playerNames, 3);
    console.log(`\n   � Random Team Selection:`);
    console.log(`   • Available: ${playerNames.join(', ')}`);
    console.log(`   • Selected team: ${selectedPlayers.join(', ')}`);

    const shuffledDeck = utils.shuffleArray([...Array.from({ length: 52 }, (_, i) => `Card ${i + 1}`)]);
    console.log(`   • Shuffled deck (first 5): ${shuffledDeck.slice(0, 5).join(', ')}`);
  }

  private async demonstrateObjectUtils() {
    // API data processing
    const userData = {
      id: 12345,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret123',
      role: 'user',
      preferences: { theme: 'dark', notifications: true },
      metadata: { lastLogin: '2024-01-15', ip: '192.168.1.1' }
    };

    console.log('🗂️ API Data Processing:');
    console.log('   Original user data has sensitive fields...');
    
    // Public API response (remove sensitive data)
    const publicFields = utils.objectUtils.pick(userData, ['id', 'name', 'role']);
    console.log(`✓ Public API response: ${JSON.stringify(publicFields)}`);

    // Internal processing (remove user-specific data)
    const internalData = utils.objectUtils.omit(userData, ['password', 'email']);
    console.log(`✓ Internal processing: ${JSON.stringify(internalData)}`);

    // Data mapping/inversion
    const statusCodes = { 200: 'OK', 404: 'Not Found', 500: 'Server Error' };
    const invertedCodes = utils.objectUtils.invert(statusCodes);
    console.log(`\n   Status codes: ${JSON.stringify(statusCodes)}`);
    console.log(`✓ Inverted mapping: ${JSON.stringify(invertedCodes)}`);
  }

  private async demonstrateValidation() {
    // Form validation scenarios
    const testData = [
      { type: 'email', values: ['user@example.com', 'invalid-email', 'test@domain.co.uk', '@invalid.com'] },
      { type: 'URL', values: ['https://example.com', 'http://test.org', 'invalid-url', 'ftp://files.test.com'] },
      { type: 'IP', values: ['192.168.1.1', '10.0.0.1', '256.256.256.256', '2001:db8::1', 'invalid-ip'] }
    ];

    console.log('✅ Form Validation & Data Integrity:');
    
    testData.forEach(({ type, values }) => {
      console.log(`\n   ${type.toUpperCase()} Validation:`);
      values.forEach(value => {
        let isValid = false;
        switch (type) {
          case 'email':
            isValid = utils.isValidEmail(value);
            break;
          case 'URL':
            isValid = utils.isValidUrl(value);
            break;
          case 'IP':
            isValid = utils.isValidIP(value);
            break;
        }
        console.log(`   ${isValid ? '✅' : '❌'} "${value}"`);
      });
    });
  }

  private async demonstrateCryptography() {
    const sensitiveData = [
      'user-password-123',
      'api-secret-key',
      'Hello, World!',
      'sensitive user data for hashing'
    ];

    console.log('🔐 Security & Data Protection:');
    
    sensitiveData.forEach((data, index) => {
      console.log(`\n   Data ${index + 1}: "${data}"`);
      console.log(`   • MD5: ${utils.md5(data)}`);
      console.log(`   • SHA256: ${utils.sha256(data)}`);
      console.log(`   • Base64: ${utils.base64Encode(data)}`);
      console.log(`   • URL Encoded: ${utils.urlEncode(data)}`);
    });

    // Practical encoding scenario
    const searchQuery = 'hello world & special chars!';
    console.log(`\n   🔍 Search Query Processing:`);
    console.log(`   • Original: "${searchQuery}"`);
    console.log(`   • URL safe: "${utils.urlEncode(searchQuery)}"`);
    console.log(`   • Base64: "${utils.base64Encode(searchQuery)}"`);
  }

  private async demonstratePerformance() {
    console.log('⚡ Performance Measurement & Optimization:');
    
    // Algorithm comparison
    const testSize = 10000;
    console.log(`\n   📊 Algorithm Benchmarking (${testSize} operations):`);

    // Benchmark different sorting approaches
    const benchmark1 = utils.performance.benchmark(() => {
      const arr = Array.from({ length: 100 }, () => Math.random());
      arr.sort((a, b) => a - b);
    }, 100);
    
    console.log(`   • Sorting 100 items: ${benchmark1.averageTime.toFixed(2)}ms avg`);

    // Measure complex operation
    const complexResult = utils.performance.measure(() => {
      let result = 0;
      for (let i = 0; i < testSize; i++) {
        result += Math.sqrt(i * Math.random());
      }
      return result;
    }, 'Complex calculation');
    
    console.log(`   • Complex calculation result: ${complexResult.toFixed(2)}`);

    // Async performance measurement
    console.log('\n   ⏱️ Async Operations:');
    await utils.performance.measureAsync(async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
    }, 'Simulated API call');
  }

  private async demonstrateDateUtils() {
    const now = new Date();
    const futureDate = utils.dateUtils.addDays(now, 30);
    const pastDate = utils.dateUtils.addDays(now, -15);

    console.log('📅 Date & Time Management:');
    console.log(`   📍 Current date: ${utils.dateUtils.format(now, 'YYYY-MM-DD HH:mm:ss')}`);
    
    // Date calculations for business logic
    console.log('\n   � Business Date Calculations:');
    console.log(`   • 30 days from now: ${utils.dateUtils.format(futureDate, 'YYYY-MM-DD')}`);
    console.log(`   • 15 days ago: ${utils.dateUtils.format(pastDate, 'YYYY-MM-DD')}`);
    console.log(`   • Days until future: ${utils.dateUtils.diff(now, futureDate, 'days')} days`);
    console.log(`   • Hours since past: ${utils.dateUtils.diff(pastDate, now, 'hours').toFixed(1)} hours`);

    // Leap year calculations
    const testYears = [2020, 2021, 2024, 2100];
    console.log('\n   📅 Leap Year Analysis:');
    testYears.forEach(year => {
      const isLeap = utils.dateUtils.isLeapYear(year);
      const daysInFeb = utils.dateUtils.getDaysInMonth(year, 1); // February is month 1
      console.log(`   • ${year}: ${isLeap ? 'Leap' : 'Regular'} year (Feb has ${daysInFeb} days)`);
    });

    // Relative time for social features
    const testDates = [
      new Date(Date.now() - 30000),     // 30 seconds ago
      new Date(Date.now() - 300000),    // 5 minutes ago
      new Date(Date.now() - 3600000),   // 1 hour ago
      new Date(Date.now() - 86400000),  // 1 day ago
    ];

    console.log('\n   🕐 Social Media Timestamps:');
    testDates.forEach(date => {
      console.log(`   • ${utils.dateUtils.timeAgo(date)}`);
    });
  }

  private async demonstrateColorUtils() {
    console.log('🎨 Color Management & Design:');
    
    // Color palette generation
    const baseColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
    console.log('   🎯 Color Analysis:');
    
    baseColors.forEach(color => {
      const rgb = utils.colors.hexToRgb(color);
      const adjusted = utils.colors.adjust(color, 20); // Lighten by 20%
      console.log(`   • ${color} → RGB(${rgb?.r}, ${rgb?.g}, ${rgb?.b}) → Lighter: ${adjusted}`);
    });

    // Random theme generation
    console.log('\n   🌈 Random Theme Generation:');
    const themeColors = Array.from({ length: 5 }, () => utils.colors.random());
    console.log(`   • Generated palette: ${themeColors.join(', ')}`);
    
    // Color conversion pipeline
    const designColor = utils.colors.random();
    const rgb = utils.colors.hexToRgb(designColor);
    const backToHex = rgb ? utils.colors.rgbToHex(rgb.r, rgb.g, rgb.b) : designColor;
    
    console.log(`\n   🔄 Color Conversion Pipeline:`);
    console.log(`   • Original: ${designColor}`);
    console.log(`   • RGB: ${rgb ? `(${rgb.r}, ${rgb.g}, ${rgb.b})` : 'Invalid'}`);
    console.log(`   • Back to Hex: ${backToHex}`);
    console.log(`   • Match: ${designColor.toLowerCase() === backToHex.toLowerCase() ? '✅' : '❌'}`);
  }

  private displaySummary() {
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    const successCount = this.results.filter(r => r.success).length;
    const failureCount = this.results.filter(r => !r.success).length;

    console.log(`\n${'═'.repeat(80)}`);
    console.log('📊 UTILS MODULE DEMONSTRATION SUMMARY');
    console.log(`${'═'.repeat(80)}`);
    console.log(`🎯 Total Sections: ${this.results.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`📈 Success Rate: ${((successCount / this.results.length) * 100).toFixed(1)}%`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log(`⚡ Average per Section: ${(totalDuration / this.results.length).toFixed(0)}ms`);

    if (failureCount > 0) {
      console.log(`\n🔍 Failed Sections:`);
      this.results
        .filter(r => !r.success)
        .forEach(result => {
          console.log(`   • ${result.section}: ${result.error?.message}`);
        });
    }

    console.log(`\n💡 Key Takeaways:`);
    console.log(`   • Utils module provides ${this.sections.length} major categories of functionality`);
    console.log(`   • Suitable for web development, data processing, and system utilities`);
    console.log(`   • Includes security, performance, and validation tools`);
    console.log(`   • Optimized for Bun runtime with modern JavaScript/TypeScript features`);
    console.log(`${'═'.repeat(80)}\n`);
  }
}

// Main execution
async function runUtilsExample() {
  try {
    const runner = new UtilsExampleRunner();
    await runner.runAllSections();
  } catch (error) {
    console.error('❌ Fatal error in utils example:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  await runUtilsExample();
}
