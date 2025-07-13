// Type definitions for Bun User Modules

export interface DirectoryEntry {
  name: string;
  type: 'FILE' | 'DIRECTORY';
  path: string;
  size?: number;
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface FileStats {
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  createdAt: Date;
  modifiedAt: Date;
  permissions?: FilePermissions;
}

export interface FilePermissions {
  all?: boolean;
  ownerAll?: boolean;
  groupAll?: boolean;
  othersAll?: boolean;
  ownerRead?: boolean;
  ownerWrite?: boolean;
  ownerExec?: boolean;
  groupRead?: boolean;
  groupWrite?: boolean;
  groupExec?: boolean;
  othersRead?: boolean;
  othersWrite?: boolean;
  othersExec?: boolean;
}

export interface PathParts {
  rootName: string;
  rootDirectory: string;
  rootPath: string;
  relativePath: string;
  parentPath: string;
  filename: string;
  extension: string;
  stem: string;
}

export interface FileWatcher {
  id: number;
  path: string;
  active: boolean;
}

export interface WatchEvent {
  path: string;
  event: 'create' | 'modify' | 'delete' | 'rename';
  filename?: string;
}

export interface EnhancedWatchEvent {
  path: string;
  event: 'create' | 'modify' | 'delete' | 'rename' | 'access' | 'attrib';
  filename: string;
  timestamp: Date;
  isDirectory: boolean;
  size?: number;
  previousSize?: number;
  stats?: FileStats;
  previousStats?: FileStats;
}

export interface WatcherConfig {
  recursive?: boolean;
  ignorePatterns?: (string | RegExp)[];
  includePatterns?: (string | RegExp)[];
  debounceMs?: number;
  events?: ('create' | 'modify' | 'delete' | 'rename' | 'access' | 'attrib')[];
  persistent?: boolean;
  followSymlinks?: boolean;
  maxDepth?: number;
}

export interface DirectoryWatcher {
  id: number;
  path: string;
  config: WatcherConfig;
  active: boolean;
  eventCount: number;
  lastEvent?: Date;
  start(): Promise<void>;
  stop(): Promise<void>;
  on(event: 'change', callback: (event: EnhancedWatchEvent) => void): void;
  on(event: 'error', callback: (error: Error) => void): void;
  off(event: 'change' | 'error', callback: Function): void;
}

export interface CommandResult {
  pid: number;
  stdOut: string;
  stdErr: string;
  exitCode: number;
  success: boolean;
}

export interface SpawnedProcess {
  id: number;
  pid: number;
  command: string;
  active: boolean;
}

export interface SystemInfo {
  platform: string;
  arch: string;
  hostname: string;
  username: string;
  homedir: string;
  tmpdir: string;
  uptime: number;
  freemem: number;
  totalmem: number;
  cpus: Array<{
    model: string;
    speed: number;
    times: {
      user: number;
      nice: number;
      sys: number;
      idle: number;
      irq: number;
    };
  }>;
  networkInterfaces: Record<string, any[]>;
}

export interface DialogFilter {
  name: string;
  extensions: string[];
}

export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: DialogFilter[];
  multiSelections?: boolean;
}

export interface SaveDialogOptions {
  title?: string;
  defaultPath?: string;
  filters?: DialogFilter[];
  forceOverwrite?: boolean;
}

export interface FolderDialogOptions {
  title?: string;
  defaultPath?: string;
}

export interface NotificationOptions {
  title: string;
  content: string;
  icon?: 'INFO' | 'WARNING' | 'ERROR' | 'QUESTION';
  timeout?: number;
}

export interface MessageBoxOptions {
  title: string;
  content: string;
  choice?: 'OK' | 'OK_CANCEL' | 'YES_NO' | 'YES_NO_CANCEL' | 'RETRY_CANCEL' | 'ABORT_RETRY_IGNORE';
  icon?: 'INFO' | 'WARNING' | 'ERROR' | 'QUESTION';
}

export interface TrayMenuItem {
  id?: string;
  text: string;
  isDisabled?: boolean;
  isChecked?: boolean;
}

export interface TrayOptions {
  icon: string;
  menuItems: TrayMenuItem[];
}

export interface AppConfig {
  name: string;
  version: string;
  description: string;
  author: string;
  platform: string;
  arch: string;
  dataPath: string;
  configPath: string;
  logPath: string;
  tempPath: string;
  isDevelopment: boolean;
  isProduction: boolean;
  homepage?: string;
  repository?: string;
}

export interface EventListener<T = any> {
  (event: T): void;
}

export interface EventEmitter {
  on<T = any>(event: string, listener: EventListener<T>): void;
  off<T = any>(event: string, listener: EventListener<T>): void;
  emit<T = any>(event: string, data?: T): void;
  once<T = any>(event: string, listener: EventListener<T>): void;
}

export interface NetworkRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  headers?: Record<string, string>;
  body?: string | ArrayBuffer | FormData;
  timeout?: number;
}

export interface NetworkResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: string;
  success: boolean;
}

export interface ServerOptions {
  port?: number;
  hostname?: string;
  development?: boolean;
}

export interface WebSocketOptions {
  protocols?: string[];
  headers?: Record<string, string>;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogOptions {
  level?: LogLevel;
  timestamp?: boolean;
  prefix?: string;
}
