#!/usr/bin/env bun
/**
 * Run All Examples (Improved)
 * Comprehensive examples runner with parallel execution, detailed reporting, and filtering
 */

import { examples, type Example } from './index';
import { performance } from '../modules/utils';

interface ExampleResult {
  example: Example;
  status: 'success' | 'error' | 'skipped';
  duration: number;
  error?: Error;
  output?: string;
}

interface RunOptions {
  parallel?: boolean;
  category?: string;
  difficulty?: Example['difficulty'];
  maxConcurrency?: number;
  verbose?: boolean;
  timeoutMs?: number;
}

class ExampleRunner {
  private results: ExampleResult[] = [];
  private startTime: number = 0;

  async runAllExamples(options: RunOptions = {}): Promise<ExampleResult[]> {
    const {
      parallel = false,
      category,
      difficulty,
      maxConcurrency = 3,
      verbose = true,
      timeoutMs = 30000
    } = options;

    this.startTime = Date.now();
    let filteredExamples = examples;

    // Apply filters
    if (category) {
      filteredExamples = filteredExamples.filter(e => e.category === category);
    }
    if (difficulty) {
      filteredExamples = filteredExamples.filter(e => e.difficulty === difficulty);
    }

    console.log('🎯 Running Bun User Modules Examples\n');
    console.log(`📊 Configuration:`);
    console.log(`   • Mode: ${parallel ? 'Parallel' : 'Sequential'}`);
    console.log(`   • Examples: ${filteredExamples.length}/${examples.length}`);
    if (category) console.log(`   • Category: ${category}`);
    if (difficulty) console.log(`   • Difficulty: ${difficulty}`);
    if (parallel) console.log(`   • Max Concurrency: ${maxConcurrency}`);
    console.log(`   • Timeout: ${timeoutMs / 1000}s\n`);

    if (parallel) {
      this.results = await this.runInParallel(filteredExamples, maxConcurrency, timeoutMs, verbose);
    } else {
      this.results = await this.runSequentially(filteredExamples, timeoutMs, verbose);
    }

    this.displaySummary();
    return this.results;
  }

  private async runSequentially(examples: Example[], timeoutMs: number, verbose: boolean): Promise<ExampleResult[]> {
    const results: ExampleResult[] = [];

    for (const [index, example] of examples.entries()) {
      if (verbose) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`🏃 Running Example ${index + 1}/${examples.length}: ${example.name}`);
        console.log(`${'='.repeat(70)}\n`);
      }

      const result = await this.runSingleExample(example, timeoutMs, verbose);
      results.push(result);

      if (verbose) {
        this.displayExampleResult(result);
      }
    }

    return results;
  }

  private async runInParallel(examples: Example[], maxConcurrency: number, timeoutMs: number, verbose: boolean): Promise<ExampleResult[]> {
    const results: ExampleResult[] = [];
    const semaphore = new Semaphore(maxConcurrency);

    const promises = examples.map(async (example, index) => {
      await semaphore.acquire();
      try {
        if (verbose) {
          console.log(`🚀 Starting: ${example.name}`);
        }
        const result = await this.runSingleExample(example, timeoutMs, false);
        results.push(result);
        if (verbose) {
          console.log(`${result.status === 'success' ? '✅' : '❌'} Completed: ${example.name} (${result.duration}ms)`);
        }
        return result;
      } finally {
        semaphore.release();
      }
    });

    await Promise.all(promises);
    return results;
  }

  private async runSingleExample(example: Example, timeoutMs: number, verbose: boolean): Promise<ExampleResult> {
    const startTime = Date.now();

    try {
      if (verbose) {
        console.log(`📝 Description: ${example.description}`);
        console.log(`🎯 Difficulty: ${example.difficulty}`);
        console.log(`⏱️  Estimated Time: ${example.estimatedTime}`);
        if (example.prerequisites) {
          console.log(`📋 Prerequisites: ${example.prerequisites.join(', ')}`);
        }
        console.log(`\n🔄 Executing: ${example.file}...`);
      }

      // Create a promise that will timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Example timed out after ${timeoutMs}ms`)), timeoutMs);
      });

      // Import and run the actual example
      const examplePath = `./${example.file}`;
      
      // Run the example using Bun's subprocess to capture output and errors
      const execPromise = new Promise<void>((resolve, reject) => {
        const proc = Bun.spawn(['bun', 'run', examplePath], {
          cwd: import.meta.dir,
          stdout: 'pipe',
          stderr: 'pipe',
        });

        proc.exited.then((exitCode) => {
          if (exitCode === 0) {
            resolve();
          } else {
            reject(new Error(`Example exited with code ${exitCode}`));
          }
        }).catch(reject);
      });

      // Race between execution and timeout
      await Promise.race([execPromise, timeoutPromise]);

      const duration = Date.now() - startTime;
      return {
        example,
        status: 'success',
        duration,
        output: `Example completed successfully in ${duration}ms`
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        example,
        status: 'error',
        duration,
        error: error as Error
      };
    }
  }

  private displayExampleResult(result: ExampleResult) {
    const { example, status, duration, error } = result;
    
    if (status === 'success') {
      console.log(`✅ ${example.name} completed successfully`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
    } else {
      console.log(`❌ ${example.name} failed`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   🔍 Error: ${error?.message || 'Unknown error'}`);
    }
  }

  private displaySummary() {
    const totalDuration = Date.now() - this.startTime;
    const successCount = this.results.filter(r => r.status === 'success').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    const skippedCount = this.results.filter(r => r.status === 'skipped').length;
    const successRate = (successCount / this.results.length) * 100;

    console.log(`\n${'='.repeat(70)}`);
    console.log('📊 EXECUTION SUMMARY');
    console.log(`${'='.repeat(70)}`);
    console.log(`🎯 Total Examples: ${this.results.length}`);
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`📈 Success Rate: ${successRate.toFixed(1)}%`);
    console.log(`⏱️  Total Time: ${(totalDuration / 1000).toFixed(2)}s`);
    
    if (errorCount > 0) {
      console.log(`\n🔍 FAILED EXAMPLES:`);
      this.results
        .filter(r => r.status === 'error')
        .forEach(result => {
          console.log(`   • ${result.example.name}: ${result.error?.message}`);
        });
    }

    // Performance insights
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length;
    const slowestExample = this.results.reduce((prev, current) => 
      current.duration > prev.duration ? current : prev
    );
    
    console.log(`\n📈 PERFORMANCE INSIGHTS:`);
    console.log(`   • Average Duration: ${avgDuration.toFixed(0)}ms`);
    console.log(`   • Slowest Example: ${slowestExample.example.name} (${slowestExample.duration}ms)`);
    
    console.log(`${'='.repeat(70)}\n`);
  }
}

// Simple semaphore implementation for concurrency control
class Semaphore {
  private permits: number;
  private waiting: (() => void)[] = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    return new Promise(resolve => {
      if (this.permits > 0) {
        this.permits--;
        resolve();
      } else {
        this.waiting.push(resolve);
      }
    });
  }

  release(): void {
    this.permits++;
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift()!;
      this.permits--;
      resolve();
    }
  }
}

// CLI argument parsing
function parseArgs(): RunOptions {
  const args = process.argv.slice(2);
  const options: RunOptions = {};

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--parallel':
        options.parallel = true;
        break;
      case '--category':
        options.category = args[++i];
        break;
      case '--difficulty':
        options.difficulty = args[++i] as Example['difficulty'];
        break;
      case '--concurrency':
        const concurrencyArg = args[++i];
        if (concurrencyArg) options.maxConcurrency = parseInt(concurrencyArg);
        break;
      case '--timeout':
        const timeoutArg = args[++i];
        if (timeoutArg) options.timeoutMs = parseInt(timeoutArg) * 1000;
        break;
      case '--quiet':
        options.verbose = false;
        break;
    }
  }

  return options;
}

if (import.meta.main) {
  const options = parseArgs();
  const runner = new ExampleRunner();
  
  try {
    await runner.runAllExamples(options);
  } catch (error) {
    console.error('❌ Fatal error running examples:', error);
    process.exit(1);
  }
}
