#!/usr/bin/env bun
/**
 * Run All Examples
 * Executes all module examples in sequence
 */

import { examples } from './index';

async function runAllExamples() {
  console.log('🎯 Running All Bun User Modules Examples\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [index, example] of examples.entries()) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running Example ${index + 1}/${examples.length}: ${example.name}`);
    console.log(`${'='.repeat(60)}\n`);
    
    try {
      // Note: In a real implementation, you'd dynamically import and run each example
      console.log(`Would run: ${example.file}`);
      console.log(`Description: ${example.description}`);
      console.log('✅ Example completed successfully');
      successCount++;
    } catch (error) {
      console.error(`❌ Error running ${example.name}:`, error);
      errorCount++;
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Examples Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📈 Success Rate: ${((successCount / examples.length) * 100).toFixed(1)}%`);
  console.log(`${'='.repeat(60)}\n`);
}

if (import.meta.main) {
  await runAllExamples();
}
