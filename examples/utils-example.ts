#!/usr/bin/env bun
/**
 * Utils Module Example
 * Demonstrates comprehensive utility functions and helpers
 */

import { utils } from '../index';

async function runUtilsExample() {
  console.log('🛠️ Utils Module Example\n');

  try {
    // Weighted Array Utilities
    console.log('⚖️ Weighted Array Utilities:');
    const items = ['apple', 'banana', 'cherry'];
    const weights = [10, 30, 60]; // Higher weight = more likely to be picked
    
    const weightedPick = utils.weightedArray.pick(items, weights);
    console.log('✓ Weighted pick:', weightedPick);

    const distribution = utils.weightedArray.createDistribution(items, weights);
    console.log('✓ Distribution probabilities:', distribution.map(d => `${d.item}: ${d.probability.toFixed(2)}`));

    // Math Utilities
    console.log('\n🔢 Math Utilities:');
    console.log('✓ Clamp 15 between 0-10:', utils.math.clamp(15, 0, 10));
    console.log('✓ Linear interpolation 0.5 between 10-20:', utils.math.lerp(10, 20, 0.5));
    console.log('✓ Map 5 from range 0-10 to 0-100:', utils.math.map(5, 0, 10, 0, 100));
    console.log('✓ Distance between (0,0) and (3,4):', utils.math.distance(0, 0, 3, 4));
    console.log('✓ GCD of 48 and 18:', utils.math.gcd(48, 18));
    console.log('✓ Is 17 prime?', utils.math.isPrime(17));
    console.log('✓ Factorial of 5:', utils.math.factorial(5));

    // String Utilities
    console.log('\n📝 String Utilities:');
    const text = 'hello_world_example';
    console.log('✓ Camel case:', utils.stringUtils.toCamelCase(text));
    console.log('✓ Pascal case:', utils.stringUtils.toPascalCase(text));
    console.log('✓ Kebab case:', utils.stringUtils.toKebabCase(text));
    console.log('✓ Truncate "A very long text":', utils.stringUtils.truncate('A very long text that needs truncation', 15));
    console.log('✓ Is "racecar" palindrome?', utils.stringUtils.isPalindrome('racecar'));
    console.log('✓ Create slug:', utils.stringUtils.createSlug('Hello World! 123'));

    // Date Utilities
    console.log('\n📅 Date Utilities:');
    const today = new Date();
    const nextWeek = utils.dateUtils.addDays(today, 7);
    console.log('✓ Today + 7 days:', nextWeek.toDateString());
    console.log('✓ Is 2024 leap year?', utils.dateUtils.isLeapYear(2024));
    console.log('✓ Days in March 2024:', utils.dateUtils.getDaysInMonth(2024, 3));

    // Array Utilities
    console.log('\n📊 Array Utilities:');
    const numbers = [1, 2, 3, 4, 5];
    const shuffled = utils.arrayUtils.shuffle([...numbers]);
    console.log('✓ Shuffled array:', shuffled);
    
    const chunked = utils.arrayUtils.chunk(numbers, 2);
    console.log('✓ Chunked array:', chunked);

    const people = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 30 }
    ];
    const grouped = utils.arrayUtils.groupBy(people, 'age');
    console.log('✓ Grouped by age:', grouped);

    // Random Generation
    console.log('\n🎲 Random Generation:');
    console.log('✓ UUID:', utils.generateUUID());
    console.log('✓ Random string:', utils.generateRandomString(8));
    console.log('✓ Random integer 1-100:', utils.generateRandomInt(1, 100));
    console.log('✓ Random float 0-1:', utils.generateRandomFloat(0, 1).toFixed(3));

    // Object Utilities
    console.log('\n🏗️ Object Utilities:');
    const obj = { a: 1, b: { c: 2, d: { e: 3 } } };
    const flattened = utils.objectUtils.flatten(obj);
    console.log('✓ Flattened object:', flattened);

    const cloned = utils.objectUtils.deepClone(obj);
    console.log('✓ Deep clone successful:', JSON.stringify(cloned) === JSON.stringify(obj));

    const nested = utils.objectUtils.getNestedProperty(obj, 'b.d.e');
    console.log('✓ Nested property b.d.e:', nested);

    // Validation
    console.log('\n✅ Validation:');
    console.log('✓ Valid email:', utils.validateEmail('test@example.com'));
    console.log('✓ Invalid email:', utils.validateEmail('invalid-email'));
    console.log('✓ Valid URL:', utils.validateUrl('https://example.com'));
    console.log('✓ Valid IP:', utils.validateIP('192.168.1.1'));

    // Formatting
    console.log('\n📋 Formatting:');
    console.log('✓ Format bytes:', utils.formatBytes(1048576)); // 1MB
    console.log('✓ Format duration:', utils.formatDuration(3661000)); // 1h 1m 1s

    // Hashing and Encoding
    console.log('\n🔐 Hashing and Encoding:');
    const text2 = 'Hello World';
    console.log('✓ MD5 hash:', utils.hashMD5(text2));
    console.log('✓ SHA256 hash:', utils.hashSHA256(text2));
    console.log('✓ Base64 encode:', utils.encodeBase64(text2));
    console.log('✓ URL encode:', utils.encodeURL('hello world & test'));

    // Function Utilities (async examples)
    console.log('\n⚡ Function Utilities:');
    
    // Debounce example
    let debounceCounter = 0;
    const debouncedFn = utils.debounce(() => {
      debounceCounter++;
      console.log('✓ Debounced function executed, count:', debounceCounter);
    }, 100);

    // Call multiple times quickly
    debouncedFn();
    debouncedFn();
    debouncedFn();
    
    await utils.sleep(150); // Wait for debounce to trigger

    // Retry with error handling
    let attempts = 0;
    const unreliableFunction = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Simulated failure');
      }
      return 'Success!';
    };

    try {
      const result = await utils.retry(unreliableFunction, 3, 10);
      console.log('✓ Retry result:', result, 'after', attempts, 'attempts');
    } catch (error) {
      console.log('❌ Retry failed');
    }

    // Circuit Breaker
    console.log('\n🔌 Circuit Breaker:');
    const circuitBreaker = utils.circuitBreaker.create(async () => {
      return 'Circuit breaker success!';
    }, { failureThreshold: 3, timeout: 1000 });

    const cbResult = await circuitBreaker();
    console.log('✓ Circuit breaker result:', cbResult);

    // Memoization
    console.log('\n💾 Memoization:');
    let expensiveCallCount = 0;
    const expensiveFunction = (n: number) => {
      expensiveCallCount++;
      return n * n;
    };

    const memoized = utils.memoize(expensiveFunction);
    console.log('✓ Memoized call 1 (5):', memoized(5));
    console.log('✓ Memoized call 2 (5):', memoized(5)); // Should use cached result
    console.log('✓ Expensive function called:', expensiveCallCount, 'times');

    // Performance measurement
    console.log('\n📊 Performance:');
    const perfResult = await utils.performance.measureAsync(async () => {
      await utils.sleep(50);
      return 'Performance test complete';
    });
    console.log('✓ Performance result:', perfResult.result);
    console.log('✓ Execution time:', perfResult.executionTime.toFixed(2), 'ms');

    console.log('\n✅ Utils module example completed!');

  } catch (error) {
    console.error('❌ Error in utils example:', error);
  }
}

// Run the example
if (import.meta.main) {
  await runUtilsExample();
}
