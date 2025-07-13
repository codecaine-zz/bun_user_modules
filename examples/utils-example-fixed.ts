#!/usr/bin/env bun
/**
 * Utils Module Example (Fixed)
 * Demonstrates comprehensive utility functions and helpers
 */

import * as utils from '../modules/utils';

async function runUtilsExample() {
  console.log('🛠️ Utils Module Example (Fixed)\n');

  try {
    // Weighted Array Utilities
    console.log('⚖️ Weighted Array Utilities:');
    const items = ['apple', 'banana', 'cherry'];
    const weights = [10, 30, 60]; // Higher weight = more likely to be picked
    
    const weightedPick = utils.weightedArray.pickWeighted(items, weights);
    console.log('✓ Weighted pick:', weightedPick);

    const distributionData = [
      { item: 'apple', weight: 10 },
      { item: 'banana', weight: 30 },
      { item: 'cherry', weight: 60 }
    ];
    const distribution = utils.weightedArray.createDistribution(distributionData);
    console.log('✓ Distribution created with items:', distribution.getItems());
    console.log('✓ Distribution weights:', distribution.getWeights());
    console.log('✓ Pick from distribution:', distribution.pick());
    console.log('✓ Pick 3 from distribution:', distribution.pickMultiple(3));

    // Math Utilities
    console.log('\n🔢 Math Utilities:');
    console.log('✓ Clamp 15 between 0-10:', utils.math.clamp(15, 0, 10));
    console.log('✓ Linear interpolation 0.5 between 10-20:', utils.math.lerp(10, 20, 0.5));
    console.log('✓ Map 5 from range 0-10 to 0-100:', utils.math.map(5, 0, 10, 0, 100));
    console.log('✓ Distance between (0,0) and (3,4):', utils.math.distance(0, 0, 3, 4));
    console.log('✓ GCD of 48 and 18:', utils.math.gcd(48, 18));

    // String Utilities
    console.log('\n📝 String Utilities:');
    const text = 'hello world example';
    console.log('✓ Capitalize:', utils.stringUtils.capitalize(text));
    console.log('✓ Title case:', utils.stringUtils.titleCase(text));
    console.log('✓ Camel case:', utils.stringUtils.camelCase(text));
    console.log('✓ Snake case:', utils.stringUtils.snakeCase(text));
    console.log('✓ Kebab case:', utils.stringUtils.kebabCase(text));
    console.log('✓ Truncate:', utils.stringUtils.truncate('This is a very long string', 15));
    console.log('✓ Reverse:', utils.stringUtils.reverse('hello'));

    // Array Utilities
    console.log('\n📊 Array Utilities:');
    const numbers = [1, 2, 3, 4, 5];
    
    const shuffled = utils.shuffleArray([...numbers]);
    console.log('✓ Shuffled array:', shuffled);

    const picked = utils.pickRandom(numbers, 3);
    console.log('✓ Pick 3 random elements:', picked);

    const matrix = utils.arrayUtils.createMatrix(2, 3, 0);
    console.log('✓ Create 2x3 matrix:', matrix);

    const nested = [[1, 2], [3, [4, 5]], [6]];
    const flattened = utils.arrayUtils.flattenDeep(nested);
    console.log('✓ Flatten nested array:', flattened);

    const arr1 = [1, 2, 3];
    const arr2 = [2, 3, 4];
    console.log('✓ Intersection:', utils.arrayUtils.intersection(arr1, arr2));
    console.log('✓ Union:', utils.arrayUtils.union(arr1, arr2));

    // Random Utilities
    console.log('\n🎲 Random Utilities:');
    console.log('✓ Random integer 1-100:', utils.randomInt(1, 100));
    console.log('✓ Random float 0-1:', utils.randomFloat(0, 1).toFixed(3));
    console.log('✓ Random UUID:', utils.generateUUID());
    console.log('✓ Random string (8 chars):', utils.generateRandomString(8));

    // Object Utilities
    console.log('\n🗂️ Object Utilities:');
    const obj = { a: 1, b: 2, c: 3 };
    console.log('✓ Pick properties:', utils.objectUtils.pick(obj, ['a', 'c']));
    console.log('✓ Omit properties:', utils.objectUtils.omit(obj, ['b']));
    console.log('✓ Invert object:', utils.objectUtils.invert(obj));

    // Validation Utilities
    console.log('\n✅ Validation Utilities:');
    console.log('✓ Valid email:', utils.isValidEmail('test@example.com'));
    console.log('✓ Invalid email:', utils.isValidEmail('invalid-email'));
    console.log('✓ Valid URL:', utils.isValidUrl('https://example.com'));
    console.log('✓ Valid IP:', utils.isValidIP('192.168.1.1'));

    // Hashing and Encoding
    console.log('\n🔐 Hashing and Encoding:');
    const text2 = 'Hello, World!';
    console.log('✓ MD5 hash:', utils.md5(text2));
    console.log('✓ SHA256 hash:', utils.sha256(text2));
    console.log('✓ Base64 encode:', utils.base64Encode(text2));
    console.log('✓ URL encode:', utils.urlEncode('hello world & test'));

    // Performance Utilities
    console.log('\n⚡ Performance Utilities:');
    const result = utils.performance.measure(() => {
      // Simulate some work
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += i;
      }
      return sum;
    }, 'Sum calculation');
    console.log('✓ Performance measurement result:', result);

    const benchmark = utils.performance.benchmark(() => {
      Math.sqrt(Math.random() * 1000);
    }, 100);
    console.log('✓ Benchmark (100 iterations):', benchmark);

    // Date Utilities
    console.log('\n📅 Date Utilities:');
    const now = new Date();
    console.log('✓ Format date:', utils.dateUtils.format(now, 'YYYY-MM-DD'));
    console.log('✓ Add 5 days:', utils.dateUtils.format(utils.dateUtils.addDays(now, 5), 'YYYY-MM-DD'));
    console.log('✓ Diff in days:', utils.dateUtils.diff(now, utils.dateUtils.addDays(now, 5), 'days'));
    console.log('✓ Is 2024 leap year?', utils.dateUtils.isLeapYear(2024));

    // Colors
    console.log('\n🎨 Color Utilities:');
    console.log('✓ Random color:', utils.colors.random());
    console.log('✓ Hex to RGB (#ff0000):', utils.colors.hexToRgb('#ff0000'));
    console.log('✓ RGB to Hex (255,0,0):', utils.colors.rgbToHex(255, 0, 0));
    console.log('✓ Adjust color (#ff0000, +20%):', utils.colors.adjust('#ff0000', 20));

    console.log('\n✅ All utils examples completed successfully!');

  } catch (error) {
    console.error('❌ Error in utils example:', error);
  }
}

// Run the example
runUtilsExample().then(() => {
  console.log('\n🏁 Utils example finished');
}).catch(console.error);
