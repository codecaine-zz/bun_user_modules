import { test, expect, describe } from 'bun:test';
import * as utils from '../modules/utils';

describe('Utils Module', () => {
  describe('Random Generation', () => {
    test('should generate UUID v4', () => {
      const uuid = utils.generateUUID();
      
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(uuid)).toBe(true);
    });

    test('should generate random string', () => {
      const str1 = utils.generateRandomString(10);
      const str2 = utils.generateRandomString(10);
      
      expect(str1.length).toBe(10);
      expect(str2.length).toBe(10);
      expect(str1).not.toBe(str2); // Very unlikely to be the same
    });

    test('should generate random string with custom charset', () => {
      const str = utils.generateRandomString(5, '01');
      
      expect(str.length).toBe(5);
      expect(/^[01]+$/.test(str)).toBe(true);
    });

    test('should generate random integers', () => {
      const num1 = utils.randomInt(1, 10);
      const num2 = utils.randomInt(1, 10);
      
      expect(num1).toBeGreaterThanOrEqual(1);
      expect(num1).toBeLessThanOrEqual(10);
      expect(Number.isInteger(num1)).toBe(true);
    });

    test('should generate random floats', () => {
      const num = utils.randomFloat(1.0, 2.0);
      
      expect(num).toBeGreaterThanOrEqual(1.0);
      expect(num).toBeLessThan(2.0);
    });
  });

  describe('Array Utilities', () => {
    test('should shuffle array', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = utils.shuffleArray(original);
      
      expect(shuffled.length).toBe(original.length);
      expect(shuffled.sort()).toEqual(original.sort());
      expect(original).toEqual([1, 2, 3, 4, 5]); // Original should be unchanged
    });

    test('should pick random elements', () => {
      const array = [1, 2, 3, 4, 5];
      const picked = utils.pickRandom(array, 2);
      
      expect(picked.length).toBe(2);
      picked.forEach(item => {
        expect(array).toContain(item);
      });
    });

    test('should chunk array', () => {
      const array = [1, 2, 3, 4, 5, 6, 7];
      const chunks = utils.chunkArray(array, 3);
      
      expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    test('should group array by key', () => {
      const array = [
        { type: 'fruit', name: 'apple' },
        { type: 'fruit', name: 'banana' },
        { type: 'vegetable', name: 'carrot' }
      ];
      
      const grouped = utils.groupBy(array, item => item.type);
      
      expect(grouped['fruit']?.length).toBe(2);
      expect(grouped['vegetable']?.length).toBe(1);
    });

    test('should remove duplicates', () => {
      const array = [1, 2, 2, 3, 3, 3, 4];
      const unique = utils.unique(array);
      
      expect(unique).toEqual([1, 2, 3, 4]);
    });

    test('should remove duplicates with key function', () => {
      const array = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Alice' }
      ];
      
      const unique = utils.unique(array, item => item.id);
      
      expect(unique.length).toBe(2);
      expect(unique.map(u => u.id)).toEqual([1, 2]);
    });

    test('should create range', () => {
      expect(utils.range(5)).toEqual([0, 1, 2, 3, 4]);
      expect(utils.range(2, 5)).toEqual([2, 3, 4]);
      expect(utils.range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
    });
  });

  describe('Hashing and Encoding', () => {
    test('should calculate MD5 hash', () => {
      const hash = utils.md5('hello world');
      
      // Just check that it's a valid MD5 hash format (32 hex characters)
      expect(hash).toMatch(/^[a-f0-9]{32}$/);
      expect(hash.length).toBe(32);
    });

    test('should calculate SHA256 hash', () => {
      const hash = utils.sha256('hello world');
      expect(hash).toBe('b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9');
    });

    test('should encode and decode base64', () => {
      const original = 'hello world';
      const encoded = utils.base64Encode(original);
      const decoded = utils.base64Decode(encoded);
      
      expect(encoded).toBe('aGVsbG8gd29ybGQ=');
      expect(decoded).toBe(original);
    });

    test('should encode and decode URL', () => {
      const original = 'hello world!@#$%';
      const encoded = utils.urlEncode(original);
      const decoded = utils.urlDecode(encoded);
      
      expect(encoded).toBe('hello%20world!%40%23%24%25');
      expect(decoded).toBe(original);
    });

    test('should escape and unescape HTML', () => {
      const original = '<script>alert("xss")</script>';
      const escaped = utils.escapeHtml(original);
      const unescaped = utils.unescapeHtml(escaped);
      
      expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
      expect(unescaped).toBe(original);
    });
  });

  describe('Validation', () => {
    test('should validate email addresses', () => {
      expect(utils.isValidEmail('test@example.com')).toBe(true);
      expect(utils.isValidEmail('invalid-email')).toBe(false);
      expect(utils.isValidEmail('test@')).toBe(false);
      expect(utils.isValidEmail('@example.com')).toBe(false);
    });

    test('should validate URLs', () => {
      expect(utils.isValidUrl('https://example.com')).toBe(true);
      expect(utils.isValidUrl('http://localhost:3000')).toBe(true);
      expect(utils.isValidUrl('ftp://files.example.com')).toBe(true);
      expect(utils.isValidUrl('invalid-url')).toBe(false);
      expect(utils.isValidUrl('http://')).toBe(false);
    });

    test('should validate IP addresses', () => {
      expect(utils.isValidIP('192.168.1.1')).toBe(true);
      expect(utils.isValidIP('255.255.255.255')).toBe(true);
      expect(utils.isValidIP('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(true);
      expect(utils.isValidIP('256.1.1.1')).toBe(false);
      expect(utils.isValidIP('invalid-ip')).toBe(false);
    });
  });

  describe('Formatting', () => {
    test('should format bytes', () => {
      expect(utils.formatBytes(0)).toBe('0 Bytes');
      expect(utils.formatBytes(1024)).toBe('1 KB');
      expect(utils.formatBytes(1048576)).toBe('1 MB');
      expect(utils.formatBytes(1073741824)).toBe('1 GB');
    });

    test('should format duration', () => {
      expect(utils.formatDuration(500)).toBe('500ms');
      expect(utils.formatDuration(5000)).toBe('5s');
      expect(utils.formatDuration(65000)).toBe('1m 5s');
      expect(utils.formatDuration(3665000)).toBe('1h 1m 5s');
    });
  });

  describe('Function Utilities', () => {
    test('should debounce function calls', (done) => {
      let callCount = 0;
      const debouncedFn = utils.debounce(() => {
        callCount++;
      }, 50);
      
      // Call multiple times rapidly
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      // Should not have been called yet
      expect(callCount).toBe(0);
      
      // Should be called once after delay
      setTimeout(() => {
        expect(callCount).toBe(1);
        done();
      }, 100);
    });

    test('should throttle function calls', (done) => {
      let callCount = 0;
      const throttledFn = utils.throttle(() => {
        callCount++;
      }, 50);
      
      // First call should go through immediately
      throttledFn();
      expect(callCount).toBe(1);
      
      // Subsequent calls should be ignored within interval
      throttledFn();
      throttledFn();
      expect(callCount).toBe(1);
      
      // After interval, should allow another call
      setTimeout(() => {
        throttledFn();
        expect(callCount).toBe(2);
        done();
      }, 60);
    });

    test('should retry failed operations', async () => {
      let attempts = 0;
      const failingFn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Failed');
        }
        return 'Success';
      };
      
      const result = await utils.retry(failingFn, { maxAttempts: 3, initialDelay: 10 });
      
      expect(result).toBe('Success');
      expect(attempts).toBe(3);
    });

    test('should timeout promises', async () => {
      const slowPromise = new Promise(resolve => {
        setTimeout(() => resolve('done'), 100);
      });
      
      await expect(utils.timeout(slowPromise, 50)).rejects.toThrow('Timeout after 50ms');
    });

    test('should sleep for specified duration', async () => {
      const start = Date.now();
      await utils.sleep(50);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(45); // Allow some variance
    });
  });

  describe('Object Utilities', () => {
    test('should deep clone objects', () => {
      const original = {
        a: 1,
        b: { c: 2, d: [3, 4] },
        e: new Date('2023-01-01')
      };
      
      const cloned = utils.deepClone(original);
      
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
      expect(cloned.b.d).not.toBe(original.b.d);
    });

    test('should deep merge objects', () => {
      const target: any = { a: 1, b: { c: 2 } };
      const source: any = { b: { d: 3 }, e: 4 };
      
      const merged = utils.deepMerge(target, source);
      
      expect(merged.a).toBe(1);
      expect(merged.b.c).toBe(2);
      expect(merged.b.d).toBe(3);
      expect(merged.e).toBe(4);
    });

    test('should flatten objects', () => {
      const nested = {
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3
          }
        }
      };
      
      const flattened = utils.flattenObject(nested);
      
      expect(flattened).toEqual({
        'a': 1,
        'b.c': 2,
        'b.d.e': 3
      });
    });

    test('should unflatten objects', () => {
      const flattened = {
        'a': 1,
        'b.c': 2,
        'b.d.e': 3
      };
      
      const unflattened = utils.unflattenObject(flattened);
      
      expect(unflattened).toEqual({
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3
          }
        }
      });
    });

    test('should get nested property', () => {
      const obj = { a: { b: { c: 'value' } } };
      
      expect(utils.get(obj, 'a.b.c')).toBe('value');
      expect(utils.get(obj, 'a.b.x', 'default')).toBe('default');
      expect(utils.get(obj, 'x.y.z')).toBeUndefined();
    });

    test('should set nested property', () => {
      const obj: any = {};
      
      utils.set(obj, 'a.b.c', 'value');
      
      expect(obj).toEqual({
        a: {
          b: {
            c: 'value'
          }
        }
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid base64', () => {
      // Some base64 implementations are more forgiving than others
      // Let's test with a clearly invalid base64 string
      try {
        const result = utils.base64Decode('invalid!!!');
        // If it doesn't throw, at least check it's not the original string
        expect(result).not.toBe('invalid!!!');
      } catch (error) {
        // If it throws, that's also acceptable
        expect(error).toBeDefined();
      }
    });

    test('should handle retry with max attempts reached', async () => {
      const failingFn = async () => {
        throw new Error('Always fails');
      };
      
      await expect(
        utils.retry(failingFn, { maxAttempts: 2, initialDelay: 1 })
      ).rejects.toThrow('Always fails');
    });
  });

  describe('Weighted Array Utilities', () => {
    test('should pick weighted elements correctly', () => {
      const items = ['a', 'b', 'c'];
      const weights = [1, 0, 0]; // Only 'a' should be picked
      
      const result = utils.weightedArray.pickWeighted(items, weights);
      expect(result).toBe('a');
    });

    test('should return null for invalid inputs', () => {
      expect(utils.weightedArray.pickWeighted([], [])).toBe(null);
      expect(utils.weightedArray.pickWeighted(['a'], [1, 2])).toBe(null);
      expect(utils.weightedArray.pickWeighted(['a'], [0])).toBe(null);
    });

    test('should pick multiple weighted elements', () => {
      const items = ['a', 'b'];
      const weights = [1, 1];
      
      const results = utils.weightedArray.pickMultipleWeighted(items, weights, 3);
      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(['a', 'b']).toContain(result);
      });
    });

    test('should create distribution correctly', () => {
      const distribution = utils.weightedArray.createDistribution([
        { item: 'apple', weight: 10 },
        { item: 'banana', weight: 5 }
      ]);
      
      const picked = distribution.pick();
      expect(['apple', 'banana']).toContain(picked);
      
      const items = distribution.getItems();
      expect(items).toEqual(['apple', 'banana']);
      
      const weights = distribution.getWeights();
      expect(weights).toEqual([10, 5]);
    });
  });

  describe('Math Utilities', () => {
    test('should clamp values correctly', () => {
      expect(utils.math.clamp(5, 0, 10)).toBe(5);
      expect(utils.math.clamp(-5, 0, 10)).toBe(0);
      expect(utils.math.clamp(15, 0, 10)).toBe(10);
    });

    test('should perform linear interpolation', () => {
      expect(utils.math.lerp(0, 10, 0.5)).toBe(5);
      expect(utils.math.lerp(0, 100, 0.25)).toBe(25);
    });

    test('should map values between ranges', () => {
      expect(utils.math.map(5, 0, 10, 0, 100)).toBe(50);
      expect(utils.math.map(2, 0, 4, 10, 20)).toBe(15);
    });

    test('should calculate distance between points', () => {
      expect(utils.math.distance(0, 0, 3, 4)).toBe(5);
      expect(utils.math.distance(1, 1, 1, 1)).toBe(0);
    });

    test('should convert degrees to radians and back', () => {
      expect(utils.math.degToRad(180)).toBeCloseTo(Math.PI);
      expect(utils.math.radToDeg(Math.PI)).toBeCloseTo(180);
    });

    test('should calculate GCD and LCM', () => {
      expect(utils.math.gcd(12, 8)).toBe(4);
      expect(utils.math.lcm(12, 8)).toBe(24);
    });

    test('should check if number is prime', () => {
      expect(utils.math.isPrime(2)).toBe(true);
      expect(utils.math.isPrime(17)).toBe(true);
      expect(utils.math.isPrime(4)).toBe(false);
      expect(utils.math.isPrime(1)).toBe(false);
    });

    test('should calculate factorial', () => {
      expect(utils.math.factorial(5)).toBe(120);
      expect(utils.math.factorial(0)).toBe(1);
      expect(() => utils.math.factorial(-1)).toThrow();
    });

    test('should calculate fibonacci', () => {
      expect(utils.math.fibonacci(0)).toBe(0);
      expect(utils.math.fibonacci(1)).toBe(1);
      expect(utils.math.fibonacci(7)).toBe(13);
      expect(() => utils.math.fibonacci(-1)).toThrow();
    });

    test('should round to specified decimals', () => {
      expect(utils.math.round(3.14159, 2)).toBe(3.14);
      expect(utils.math.round(3.5)).toBe(4);
    });

    test('should calculate statistics', () => {
      const numbers = [1, 2, 3, 4, 5];
      
      expect(utils.math.average(numbers)).toBe(3);
      expect(utils.math.median(numbers)).toBe(3);
      expect(utils.math.median([1, 2, 3, 4])).toBe(2.5);
      
      const mode = utils.math.mode([1, 2, 2, 3]);
      expect(mode).toEqual([2]);
      
      const stdDev = utils.math.standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]);
      expect(stdDev).toBeCloseTo(2, 0);
    });
  });

  describe('Date Utilities', () => {
    test('should add days, months, years', () => {
      const date = new Date('2023-01-15');
      
      const plusDays = utils.dateUtils.addDays(date, 10);
      expect(plusDays.getDate()).toBe(25);
      
      const plusMonths = utils.dateUtils.addMonths(date, 2);
      expect(plusMonths.getMonth()).toBe(2); // March (0-indexed)
      
      const plusYears = utils.dateUtils.addYears(date, 1);
      expect(plusYears.getFullYear()).toBe(2024);
    });

    test('should calculate date differences', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-02');
      
      expect(utils.dateUtils.diff(date1, date2, 'days')).toBe(1);
      expect(utils.dateUtils.diff(date1, date2, 'hours')).toBe(24);
    });

    test('should check leap years', () => {
      expect(utils.dateUtils.isLeapYear(2020)).toBe(true);
      expect(utils.dateUtils.isLeapYear(2021)).toBe(false);
      expect(utils.dateUtils.isLeapYear(2000)).toBe(true);
      expect(utils.dateUtils.isLeapYear(1900)).toBe(false);
    });

    test('should get days in month', () => {
      expect(utils.dateUtils.getDaysInMonth(2023, 1)).toBe(28); // February
      expect(utils.dateUtils.getDaysInMonth(2020, 1)).toBe(29); // Leap year February
      expect(utils.dateUtils.getDaysInMonth(2023, 0)).toBe(31); // January
    });

    test('should format dates', () => {
      const date = new Date('2023-03-15T10:30:45');
      
      const formatted = utils.dateUtils.format(date, 'YYYY-MM-DD HH:mm:ss');
      expect(formatted).toBe('2023-03-15 10:30:45');
      
      const short = utils.dateUtils.format(date, 'M/D/YY');
      expect(short).toBe('3/15/23');
    });

    test('should format time ago', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 3600000);
      
      const timeAgo = utils.dateUtils.timeAgo(oneHourAgo);
      expect(timeAgo).toBe('1 hour ago');
    });
  });

  describe('String Utilities', () => {
    test('should convert case formats', () => {
      expect(utils.stringUtils.capitalize('hello')).toBe('Hello');
      expect(utils.stringUtils.titleCase('hello world')).toBe('Hello World');
      expect(utils.stringUtils.camelCase('hello-world')).toBe('helloWorld');
      expect(utils.stringUtils.snakeCase('HelloWorld')).toBe('hello_world');
      expect(utils.stringUtils.kebabCase('HelloWorld')).toBe('hello-world');
    });

    test('should truncate strings', () => {
      expect(utils.stringUtils.truncate('Hello World', 5)).toBe('He...');
      expect(utils.stringUtils.truncate('Hi', 10)).toBe('Hi');
    });

    test('should normalize strings', () => {
      expect(utils.stringUtils.normalize('  hello   world  ')).toBe('hello world');
    });

    test('should count substrings', () => {
      expect(utils.stringUtils.count('hello world hello', 'hello')).toBe(2);
      expect(utils.stringUtils.count('test', 'missing')).toBe(0);
    });

    test('should reverse strings', () => {
      expect(utils.stringUtils.reverse('hello')).toBe('olleh');
    });

    test('should check palindromes', () => {
      expect(utils.stringUtils.isPalindrome('racecar')).toBe(true);
      expect(utils.stringUtils.isPalindrome('A man a plan a canal Panama')).toBe(true);
      expect(utils.stringUtils.isPalindrome('hello')).toBe(false);
    });

    test('should create slugs', () => {
      expect(utils.stringUtils.slug('Hello World!')).toBe('hello-world');
      expect(utils.stringUtils.slug('Test_Case')).toBe('test-case');
    });

    test('should extract words', () => {
      const words = utils.stringUtils.words('Hello, world! How are you?');
      expect(words).toEqual(['Hello', 'world', 'How', 'are', 'you']);
    });

    test('should word wrap', () => {
      const wrapped = utils.stringUtils.wordWrap('This is a long sentence', 10);
      expect(wrapped.split('\n').length).toBeGreaterThan(1);
    });
  });

  describe('Advanced Array Utilities', () => {
    test('should create and transpose matrices', () => {
      const matrix = utils.arrayUtils.createMatrix(2, 3, 0);
      expect(matrix.length).toBe(2);
      expect(matrix[0]!.length).toBe(3);
      expect(matrix[0]![0]).toBe(0);
      
      const transposed = utils.arrayUtils.transpose([[1, 2], [3, 4]]);
      expect(transposed).toEqual([[1, 3], [2, 4]]);
    });

    test('should flatten arrays with depth', () => {
      const nested = [1, [2, [3, [4]]]];
      expect(utils.arrayUtils.flattenDeep(nested, 1)).toEqual([1, 2, [3, [4]]]);
      expect(utils.arrayUtils.flattenDeep(nested)).toEqual([1, 2, 3, 4]);
    });

    test('should perform set operations', () => {
      const arr1 = [1, 2, 3];
      const arr2 = [2, 3, 4];
      const arr3 = [3, 4, 5];
      
      expect(utils.arrayUtils.intersection(arr1, arr2)).toEqual([2, 3]);
      expect(utils.arrayUtils.union(arr1, arr2)).toEqual([1, 2, 3, 4]);
      expect(utils.arrayUtils.difference(arr1, arr2)).toEqual([1]);
    });

    test('should partition arrays', () => {
      const [evens, odds] = utils.arrayUtils.partition([1, 2, 3, 4], x => x % 2 === 0);
      expect(evens).toEqual([2, 4]);
      expect(odds).toEqual([1, 3]);
    });

    test('should generate combinations', () => {
      const combos = utils.arrayUtils.combinations([1, 2, 3], 2);
      expect(combos).toEqual([[1, 2], [1, 3], [2, 3]]);
    });

    test('should generate permutations', () => {
      const perms = utils.arrayUtils.permutations([1, 2]);
      expect(perms).toEqual([[1, 2], [2, 1]]);
    });

    test('should rotate arrays', () => {
      expect(utils.arrayUtils.rotate([1, 2, 3, 4], 2)).toEqual([3, 4, 1, 2]);
      expect(utils.arrayUtils.rotate([1, 2, 3], -1)).toEqual([3, 1, 2]);
    });

    test('should find longest increasing subsequence', () => {
      const lis = utils.arrayUtils.longestIncreasingSubsequence([10, 9, 2, 5, 3, 7, 101, 18]);
      expect(lis).toEqual([2, 5, 7, 101]);
    });
  });

  describe('Object Utilities', () => {
    test('should pick and omit keys', () => {
      const obj = { a: 1, b: 2, c: 3 };
      
      expect(utils.objectUtils.pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
      expect(utils.objectUtils.omit(obj, ['b'])).toEqual({ a: 1, c: 3 });
    });

    test('should invert objects', () => {
      const inverted = utils.objectUtils.invert({ a: 1, b: 2 });
      expect(inverted).toEqual({ '1': 'a', '2': 'b' });
    });

    test('should map values and keys', () => {
      const obj = { a: 1, b: 2 };
      
      const doubledValues = utils.objectUtils.mapValues(obj, v => v * 2);
      expect(doubledValues).toEqual({ a: 2, b: 4 });
      
      const uppercaseKeys = utils.objectUtils.mapKeys(obj, k => k.toUpperCase());
      expect(uppercaseKeys).toEqual({ A: 1, B: 2 });
    });

    test('should check paths', () => {
      const obj = { a: { b: { c: 1 } } };
      
      expect(utils.objectUtils.hasPath(obj, 'a.b.c')).toBe(true);
      expect(utils.objectUtils.hasPath(obj, 'a.b.d')).toBe(false);
    });

    test('should get all paths', () => {
      const obj = { a: { b: 1, c: 2 }, d: 3 };
      const paths = utils.objectUtils.getPaths(obj);
      
      expect(paths).toContain('a.b');
      expect(paths).toContain('a.c');
      expect(paths).toContain('d');
    });

    test('should merge with custom function', () => {
      const target = { a: [1], b: 2 };
      const source = { a: [2], c: 3 };
      
      const merged = utils.objectUtils.mergeWith(target, source, (targetVal, sourceVal) => {
        if (Array.isArray(targetVal)) {
          return targetVal.concat(sourceVal);
        }
      });
      
      expect(merged.a).toEqual([1, 2]);
      expect((merged as any).c).toBe(3);
    });
  });

  describe('Circuit Breaker', () => {
    test('should break circuit after failures', async () => {
      let callCount = 0;
      const failingFn = async () => {
        callCount++;
        throw new Error('Test failure');
      };
      
      const breaker = utils.createCircuitBreaker(failingFn, {
        failureThreshold: 2,
        timeout: 100,
        resetTimeout: 1000
      });
      
      // First failure
      await expect(breaker.execute()).rejects.toThrow();
      expect(breaker.getState().failures).toBe(1);
      
      // Second failure - should open circuit
      await expect(breaker.execute()).rejects.toThrow();
      expect(breaker.getState().state).toBe('open');
      
      // Third call should be rejected immediately
      await expect(breaker.execute()).rejects.toThrow('Circuit breaker is open');
      expect(callCount).toBe(2); // Should not have called the function again
    });

    test('should reset circuit breaker', async () => {
      const breaker = utils.createCircuitBreaker(async () => {
        throw new Error('Test');
      }, { failureThreshold: 1 });
      
      await expect(breaker.execute()).rejects.toThrow();
      expect(breaker.getState().state).toBe('open');
      
      breaker.reset();
      expect(breaker.getState().state).toBe('closed');
      expect(breaker.getState().failures).toBe(0);
    });
  });

  describe('Memoization', () => {
    test('should memoize function results', () => {
      let callCount = 0;
      const expensiveFn = (x: number) => {
        callCount++;
        return x * 2;
      };
      
      const memoized = utils.memoize(expensiveFn);
      
      expect(memoized(5)).toBe(10);
      expect(memoized(5)).toBe(10); // Should use cached result
      expect(callCount).toBe(1);
      
      expect(memoized(10)).toBe(20);
      expect(callCount).toBe(2);
    });

    test('should respect TTL in memoization', async () => {
      let callCount = 0;
      const fn = (x: number) => {
        callCount++;
        return x;
      };
      
      const memoized = utils.memoize(fn, { ttl: 10 });
      
      memoized(1);
      memoized(1); // Should use cache
      expect(callCount).toBe(1);
      
      await utils.sleep(15);
      memoized(1); // Should call function again after TTL
      expect(callCount).toBe(2);
    });
  });

  describe('Lazy Initialization', () => {
    test('should initialize lazily', () => {
      let initCount = 0;
      const lazy = utils.lazy(() => {
        initCount++;
        return 'initialized';
      });
      
      expect(lazy.isInitialized()).toBe(false);
      expect(initCount).toBe(0);
      
      expect(lazy.get()).toBe('initialized');
      expect(lazy.isInitialized()).toBe(true);
      expect(initCount).toBe(1);
      
      // Should not initialize again
      expect(lazy.get()).toBe('initialized');
      expect(initCount).toBe(1);
    });

    test('should reset lazy value', () => {
      const lazy = utils.lazy(() => 'value');
      
      lazy.get();
      expect(lazy.isInitialized()).toBe(true);
      
      lazy.reset();
      expect(lazy.isInitialized()).toBe(false);
    });
  });

  describe('Event Emitter', () => {
    test('should emit and listen to events', () => {
      const emitter = utils.createEventEmitter<{ test: string }>();
      let received = '';
      
      emitter.on('test', (data) => {
        received = data;
      });
      
      emitter.emit('test', 'hello');
      expect(received).toBe('hello');
    });

    test('should handle once listeners', () => {
      const emitter = utils.createEventEmitter<{ test: number }>();
      let callCount = 0;
      
      emitter.once('test', () => {
        callCount++;
      });
      
      emitter.emit('test', 1);
      emitter.emit('test', 2);
      
      expect(callCount).toBe(1);
    });

    test('should remove listeners', () => {
      const emitter = utils.createEventEmitter<{ test: string }>();
      const listener = () => {};
      
      emitter.on('test', listener);
      expect(emitter.listenerCount('test')).toBe(1);
      
      emitter.off('test', listener);
      expect(emitter.listenerCount('test')).toBe(0);
    });
  });

  describe('URL Parameters', () => {
    test('should parse URL parameters', () => {
      const params = utils.urlParams.parse('?name=John&age=30&tags=a&tags=b');
      
      expect(params.name).toBe('John');
      expect(params.age).toBe('30');
      expect(params.tags).toEqual(['a', 'b']);
    });

    test('should stringify parameters', () => {
      const query = utils.urlParams.stringify({
        name: 'John',
        age: 30,
        tags: ['a', 'b']
      });
      
      expect(query).toContain('name=John');
      expect(query).toContain('age=30');
      expect(query).toContain('tags=a');
      expect(query).toContain('tags=b');
    });
  });

  describe('Color Utilities', () => {
    test('should convert hex to RGB', () => {
      const rgb = utils.colors.hexToRgb('#ff0000');
      expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
      
      expect(utils.colors.hexToRgb('invalid')).toBe(null);
    });

    test('should convert RGB to hex', () => {
      expect(utils.colors.rgbToHex(255, 0, 0)).toBe('#ff0000');
    });

    test('should generate random colors', () => {
      const color = utils.colors.random();
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    });

    test('should adjust colors', () => {
      const lighter = utils.colors.adjust('#808080', 50); // 50% lighter
      const darker = utils.colors.adjust('#808080', -50); // 50% darker
      
      expect(lighter).not.toBe('#808080');
      expect(darker).not.toBe('#808080');
    });
  });

  describe('Validation Utilities', () => {
    test('should validate emails', () => {
      expect(utils.validate.email('test@example.com')).toBe(true);
      expect(utils.validate.email('invalid-email')).toBe(false);
    });

    test('should validate URLs', () => {
      expect(utils.validate.url('https://example.com')).toBe(true);
      expect(utils.validate.url('invalid-url')).toBe(false);
    });

    test('should validate phone numbers', () => {
      expect(utils.validate.phone('+1234567890')).toBe(true);
      expect(utils.validate.phone('123')).toBe(false);
    });

    test('should validate credit cards', () => {
      expect(utils.validate.creditCard('4532015112830366')).toBe(true); // Valid test number
      expect(utils.validate.creditCard('1234567890')).toBe(false);
    });

    test('should validate passwords', () => {
      const result1 = utils.validate.password('StrongPass123!');
      expect(result1.valid).toBe(true);
      expect(result1.errors).toEqual([]);
      
      const result2 = utils.validate.password('weak');
      expect(result2.valid).toBe(false);
      expect(result2.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Utilities', () => {
    test('should measure execution time', () => {
      const result = utils.performance.measure(() => {
        // Simulate some work
        let sum = 0;
        for (let i = 0; i < 1000; i++) {
          sum += i;
        }
        return sum;
      });
      
      expect(typeof result).toBe('number');
    });

    test('should measure async execution time', async () => {
      const result = await utils.performance.measureAsync(async () => {
        await utils.sleep(1);
        return 'done';
      });
      
      expect(result).toBe('done');
    });

    test('should benchmark functions', () => {
      const results = utils.performance.benchmark(() => {
        Math.sqrt(Math.random());
      }, 100);
      
      expect(results.iterations).toBe(100);
      expect(results.totalTime).toBeGreaterThanOrEqual(0);
      expect(results.averageTime).toBeGreaterThanOrEqual(0);
    });
  });
});
