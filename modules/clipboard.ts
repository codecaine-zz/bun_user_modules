import { execCommand } from './os';
import { platform } from 'os';
// Use Bun's crypto API when available, fallback to Node.js crypto
import { createHash } from 'crypto';

// Clipboard history storage
const clipboardHistory: Array<{
  content: string;
  timestamp: Date;
  hash: string;
  type: 'text' | 'html' | 'image' | 'file';
}> = [];

const MAX_HISTORY = 100;

/**
 * Writes text to clipboard
 */
export async function writeText(text: string): Promise<void> {
  try {
    let command: string;
    const escapedText = text.replace(/"/g, '\\"').replace(/\n/g, '\\n');
    
    if (platform() === 'darwin') {
      // macOS
      command = `echo "${escapedText}" | pbcopy`;
    } else if (platform() === 'linux') {
      // Linux with xclip or xsel
      command = `echo "${escapedText}" | xclip -selection clipboard 2>/dev/null || echo "${escapedText}" | xsel --clipboard --input`;
    } else if (platform() === 'win32') {
      // Windows
      command = `echo "${escapedText}" | clip`;
    } else {
      throw new Error('Clipboard operations not supported on this platform');
    }
    
    const result = await execCommand(command);
    if (!result.success) {
      throw new Error('Failed to write to clipboard');
    }
    
    // Add to history
    addToHistory(text, 'text');
  } catch (error) {
    throw new Error(`Failed to write to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Writes HTML content to clipboard
 */
export async function writeHtml(html: string, fallbackText?: string): Promise<void> {
  try {
    let command: string;
    const text = fallbackText || html.replace(/<[^>]*>/g, ''); // Strip HTML tags as fallback
    
    if (platform() === 'darwin') {
      // macOS - create temporary file with HTML
      const tempFile = `/tmp/clipboard_${Date.now()}.html`;
      command = `echo '${html.replace(/'/g, "\\'")}' > ${tempFile} && cat ${tempFile} | pbcopy && rm ${tempFile}`;
    } else if (platform() === 'linux') {
      // Linux - try to use xclip with HTML target
      command = `echo '${html.replace(/'/g, "\\'")}' | xclip -selection clipboard -t text/html 2>/dev/null || echo "${text.replace(/"/g, '\\"')}" | xclip -selection clipboard`;
    } else if (platform() === 'win32') {
      // Windows - fallback to text
      command = `echo "${text.replace(/"/g, '\\"')}" | clip`;
    } else {
      throw new Error('Clipboard operations not supported on this platform');
    }
    
    const result = await execCommand(command);
    if (!result.success) {
      throw new Error('Failed to write HTML to clipboard');
    }
    
    addToHistory(html, 'html');
  } catch (error) {
    throw new Error(`Failed to write HTML to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Adds content to clipboard history
 */
function addToHistory(content: string, type: 'text' | 'html' | 'image' | 'file'): void {
  const hash = createHash('sha256').update(content).digest('hex');
  
  // Check if content already exists in recent history
  const existingIndex = clipboardHistory.findIndex(item => item.hash === hash);
  if (existingIndex !== -1) {
    // Move to front
    const existing = clipboardHistory.splice(existingIndex, 1)[0]!;
    existing.timestamp = new Date();
    clipboardHistory.unshift(existing);
    return;
  }
  
  // Add new entry
  clipboardHistory.unshift({
    content,
    timestamp: new Date(),
    hash,
    type
  });
  
  // Limit history size
  if (clipboardHistory.length > MAX_HISTORY) {
    clipboardHistory.splice(MAX_HISTORY);
  }
}

/**
 * Gets clipboard history
 */
export function getHistory(): Array<{
  content: string;
  timestamp: Date;
  hash: string;
  type: 'text' | 'html' | 'image' | 'file';
}> {
  return [...clipboardHistory];
}

/**
 * Clears clipboard history
 */
export function clearHistory(): void {
  clipboardHistory.length = 0;
}

/**
 * Gets a specific item from history by index
 */
export function getHistoryItem(index: number): string | null {
  const item = clipboardHistory[index];
  return item ? item.content : null;
}

/**
 * Restores a clipboard item from history
 */
export async function restoreFromHistory(index: number): Promise<void> {
  const item = clipboardHistory[index];
  if (!item) {
    throw new Error('History item not found');
  }
  
  if (item.type === 'html') {
    await writeHtml(item.content);
  } else {
    await writeText(item.content);
  }
}

/**
 * Reads text from clipboard
 */
export async function readText(): Promise<string> {
  try {
    let command: string;
    
    if (platform() === 'darwin') {
      // macOS
      command = 'pbpaste';
    } else if (platform() === 'linux') {
      // Linux with xclip or xsel
      command = 'xclip -selection clipboard -o 2>/dev/null || xsel --clipboard --output';
    } else if (platform() === 'win32') {
      // Windows PowerShell
      command = 'powershell -command "Get-Clipboard"';
    } else {
      throw new Error('Clipboard operations not supported on this platform');
    }
    
    const result = await execCommand(command);
    if (!result.success) {
      throw new Error('Failed to read from clipboard');
    }
    
    return result.stdOut.trim();
  } catch (error) {
    throw new Error(`Failed to read from clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Clears the clipboard
 */
export async function clear(): Promise<void> {
  try {
    await writeText('');
  } catch (error) {
    throw new Error(`Failed to clear clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Checks if clipboard contains text
 */
export async function hasText(): Promise<boolean> {
  try {
    const text = await readText();
    return text.length > 0;
  } catch {
    return false;
  }
}

/**
 * Copies text to clipboard (alias for writeText)
 */
export async function copy(text: string): Promise<void> {
  return writeText(text);
}

/**
 * Pastes text from clipboard (alias for readText)
 */
export async function paste(): Promise<string> {
  return readText();
}

/**
 * Writes HTML content to clipboard (platform-specific support)
 */
export async function writeHTML(html: string): Promise<void> {
  try {
    if (platform() === 'darwin') {
      // macOS with osascript
      const script = `osascript -e 'set the clipboard to "${html.replace(/"/g, '\\"')}" as «class HTML»'`;
      const result = await execCommand(script);
      if (!result.success) {
        throw new Error('Failed to write HTML to clipboard');
      }
    } else {
      // Fallback to text for other platforms
      console.warn('HTML clipboard not fully supported on this platform, falling back to text');
      await writeText(html);
    }
  } catch (error) {
    throw new Error(`Failed to write HTML to clipboard: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets clipboard formats available (simplified implementation)
 */
export async function getFormats(): Promise<string[]> {
  try {
    const formats: string[] = [];
    
    // Check if text is available
    const hasTextContent = await hasText();
    if (hasTextContent) {
      formats.push('text/plain');
    }
    
    // Platform-specific format detection could be added here
    return formats;
  } catch {
    return [];
  }
}

/**
 * Monitors clipboard for changes
 */
export function watchClipboard(callback: (content: string) => void, interval: number = 1000): () => void {
  let lastContent = '';
  
  const checkClipboard = async () => {
    try {
      const currentContent = await readText();
      if (currentContent !== lastContent) {
        lastContent = currentContent;
        callback(currentContent);
      }
    } catch (error) {
      // Silent fail for monitoring
    }
  };
  
  const intervalId = setInterval(checkClipboard, interval);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
}

/**
 * Copies file paths to clipboard
 */
export async function writeFilePaths(paths: string[]): Promise<void> {
  const pathsText = paths.join('\n');
  await writeText(pathsText);
  addToHistory(pathsText, 'file');
}

/**
 * Copies rich text with formatting
 */
export async function writeRichText(text: string, formatting?: {
  bold?: boolean;
  italic?: boolean;
  color?: string;
}): Promise<void> {
  if (formatting) {
    let html = text;
    if (formatting.bold) html = `<strong>${html}</strong>`;
    if (formatting.italic) html = `<em>${html}</em>`;
    if (formatting.color) html = `<span style="color: ${formatting.color}">${html}</span>`;
    
    await writeHtml(html, text);
  } else {
    await writeText(text);
  }
}

/**
 * Gets clipboard content size in bytes
 */
export async function getContentSize(): Promise<number> {
  try {
    const content = await readText();
    return Buffer.byteLength(content, 'utf8');
  } catch {
    return 0;
  }
}

/**
 * Searches clipboard history
 */
export function searchHistory(query: string): Array<{
  content: string;
  timestamp: Date;
  hash: string;
  type: 'text' | 'html' | 'image' | 'file';
}> {
  const lowercaseQuery = query.toLowerCase();
  return clipboardHistory.filter(item => 
    item.content.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Gets clipboard statistics
 */
export function getStats(): {
  totalItems: number;
  textItems: number;
  htmlItems: number;
  fileItems: number;
  totalSize: number;
  oldestItem?: Date;
  newestItem?: Date;
} {
  const stats = {
    totalItems: clipboardHistory.length,
    textItems: 0,
    htmlItems: 0,
    fileItems: 0,
    totalSize: 0,
    oldestItem: undefined as Date | undefined,
    newestItem: undefined as Date | undefined
  };
  
  clipboardHistory.forEach(item => {
    switch (item.type) {
      case 'text': stats.textItems++; break;
      case 'html': stats.htmlItems++; break;
      case 'file': stats.fileItems++; break;
    }
    
    stats.totalSize += Buffer.byteLength(item.content, 'utf8');
    
    if (!stats.oldestItem || item.timestamp < stats.oldestItem) {
      stats.oldestItem = item.timestamp;
    }
    if (!stats.newestItem || item.timestamp > stats.newestItem) {
      stats.newestItem = item.timestamp;
    }
  });
  
  return stats;
}
