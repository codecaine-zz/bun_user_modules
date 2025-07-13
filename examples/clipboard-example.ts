#!/usr/bin/env bun
/**
 * Clipboard Module Example
 * Demonstrates text and HTML clipboard operations
 */

import { clipboard } from '../index';

async function runClipboardExample() {
  console.log('📋 Clipboard Module Example\n');

  try {
    // Basic text operations
    console.log('📝 Basic Text Operations:');
    
    // Write text to clipboard
    const testText = 'Hello from Bun User Modules! 🚀';
    await clipboard.writeText(testText);
    console.log('✓ Written to clipboard:', testText);

    // Read text from clipboard
    const readText = await clipboard.readText();
    console.log('✓ Read from clipboard:', readText);

    // Test copy/paste aliases
    await clipboard.copy('Testing copy function');
    const pastedText = await clipboard.paste();
    console.log('✓ Copy/Paste test:', pastedText);

    // Unicode text test
    console.log('\n🌍 Unicode Text Test:');
    const unicodeText = '🎉 Hello 世界 مرحبا Здравствуй 🎊';
    await clipboard.writeText(unicodeText);
    const unicodeRead = await clipboard.readText();
    console.log('✓ Unicode text:', unicodeRead);

    // Clipboard state checks
    console.log('\n🔍 Clipboard State:');
    const hasText = await clipboard.hasText();
    console.log('✓ Has text:', hasText);

    // Get available formats
    const formats = await clipboard.getFormats();
    console.log('✓ Available formats:', formats);

    // HTML operations (if supported)
    console.log('\n🌐 HTML Operations:');
    const htmlContent = '<h1>Hello HTML!</h1><p>This is <strong>bold</strong> text.</p>';
    try {
      await clipboard.writeHTML(htmlContent);
      console.log('✓ HTML written to clipboard');
    } catch (error) {
      console.log('⚠️ HTML operations not fully supported in this environment');
    }

    // Clear clipboard
    console.log('\n🧹 Cleanup:');
    await clipboard.clear();
    console.log('✓ Clipboard cleared');

    const hasTextAfterClear = await clipboard.hasText();
    console.log('✓ Has text after clear:', hasTextAfterClear);

    // Multiple sequential operations
    console.log('\n🔄 Sequential Operations:');
    const messages = ['First message', 'Second message', 'Third message'];
    
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      if (message) {
        await clipboard.writeText(message);
        console.log(`✓ Step ${i + 1}: ${message}`);
        
        // Small delay to ensure operations complete
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const finalText = await clipboard.readText();
    console.log('✓ Final clipboard content:', finalText);

    // Large text handling
    console.log('\n📄 Large Text Test:');
    const largeText = 'A'.repeat(10000) + ' - Large text test complete!';
    await clipboard.writeText(largeText);
    const largeTextRead = await clipboard.readText();
    console.log('✓ Large text length:', largeTextRead?.length);
    console.log('✓ Large text end:', largeTextRead?.slice(-30));

  } catch (error) {
    console.error('❌ Clipboard error:', error);
  }

  console.log('\n✅ Clipboard module example completed!');
}

// Run the example
if (import.meta.main) {
  await runClipboardExample();
}
