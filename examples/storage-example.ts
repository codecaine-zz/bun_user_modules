#!/usr/bin/env bun
/**
 * Storage Module Example
 * Demonstrates local data storage and persistence with advanced features
 */

import { storage } from '../index';

/**
 * Example data types for demonstration
 */
interface UserProfile {
  name: string;
  email: string;
  role?: 'user' | 'admin' | 'guest';
}

interface AppConfig {
  version: string;
  debug: boolean;
  theme?: string;
}

interface SensitiveData {
  ssn: string;
  creditCard: string;
  bankAccount: string;
}

/**
 * Utility functions for examples
 */
const logger = {
  section: (title: string) => console.log(`\n${title}`),
  success: (message: string, data?: any) => {
    if (data !== undefined) {
      console.log(`✓ ${message}:`, data);
    } else {
      console.log(`✓ ${message}`);
    }
  },
  warning: (message: string) => console.log(`⚠️ ${message}`),
  error: (message: string) => console.log(`❌ ${message}`),
  info: (message: string) => console.log(`ℹ️ ${message}`)
};

/**
 * Demonstrates basic storage operations
 */
async function demonstrateBasicOperations(): Promise<void> {
  logger.section('📦 Basic Storage Operations:');
  
  try {
    // Set different types of data
    await storage.setData('username', 'john_doe');
    await storage.setData('userAge', 25);
    await storage.setData('preferences', { theme: 'dark', language: 'en' });
    logger.success('Data stored');

    // Get data with type safety
    const username = await storage.getData<string>('username');
    const userAge = await storage.getData<number>('userAge');
    const preferences = await storage.getData<{ theme: string; language: string }>('preferences');
    
    logger.success('Username', username);
    logger.success('User age', userAge);
    logger.success('Preferences', preferences);

    // Check existence
    const hasUsername = await storage.hasData('username');
    const hasInvalidKey = await storage.hasData('nonexistent');
    logger.success('Has username', hasUsername);
    logger.success('Has invalid key', hasInvalidKey);
  } catch (error) {
    logger.error(`Basic operations failed: ${error}`);
    throw error;
  }
}

/**
 * Demonstrates key management and statistics
 */
async function demonstrateKeyManagement(): Promise<void> {
  logger.section('🔑 Key Management & Statistics:');
  
  try {
    const allKeys = await storage.getKeys();
    logger.success('All keys', allKeys);

    const stats = await storage.getStats();
    logger.success('Storage stats', stats);

    // Export/Import demonstration
    const exportedData = await storage.exportData();
    logger.success('Exported data keys', Object.keys(exportedData));
    logger.info(`Total exported items: ${Object.keys(exportedData).length}`);
  } catch (error) {
    logger.error(`Key management failed: ${error}`);
    throw error;
  }
}

/**
 * Demonstrates namespaced storage for organization
 */
async function demonstrateNamespacedStorage(): Promise<void> {
  logger.section('🏷️ Namespaced Storage:');
  
  try {
    const userStorage = storage.createNamespace('user');
    const appStorage = storage.createNamespace('app');

    // Store typed data in namespaces
    const userProfile: UserProfile = { name: 'John', email: 'john@example.com', role: 'user' };
    const appConfig: AppConfig = { version: '1.0.0', debug: false, theme: 'dark' };

    await userStorage.setData('profile', userProfile);
    await appStorage.setData('config', appConfig);

    const retrievedProfile = await userStorage.getData<UserProfile>('profile');
    const retrievedConfig = await appStorage.getData<AppConfig>('config');

    logger.success('User profile', retrievedProfile);
    logger.success('App config', retrievedConfig);

    // Demonstrate namespace isolation
    const userKeys = await userStorage.getKeys();
    const appKeys = await appStorage.getKeys();
    logger.info(`User namespace keys: ${userKeys.join(', ')}`);
    logger.info(`App namespace keys: ${appKeys.join(', ')}`);
  } catch (error) {
    logger.error(`Namespaced storage failed: ${error}`);
    throw error;
  }
}

/**
 * Demonstrates data cleanup operations
 */
async function demonstrateDataCleanup(): Promise<void> {
  logger.section('🧹 Data Cleanup:');
  
  try {
    await storage.removeData('userAge');
    logger.success('Removed userAge');

    const remainingKeys = await storage.getKeys();
    logger.success('Remaining keys', remainingKeys);
  } catch (error) {
    logger.error(`Data cleanup failed: ${error}`);
    throw error;
  }
}

/**
 * Demonstrates secure storage with encryption
 */
async function demonstrateSecureStorage(): Promise<void> {
  logger.section('🔒 Encrypted Storage:');
  
  try {
    const { createSecureStorage } = await import('../modules/storage');
    const secureStorage = createSecureStorage('my-secret-key-123');
    
    const sensitiveData: SensitiveData = {
      ssn: '123-45-6789',
      creditCard: '4111-1111-1111-1111',
      bankAccount: '9876543210'
    };

    await secureStorage.setSecure('sensitive-data', sensitiveData);
    const retrievedSensitiveData = await secureStorage.getSecure<SensitiveData>('sensitive-data');
    logger.success('Retrieved encrypted data', retrievedSensitiveData);
    
    // Compressed encrypted storage for large data
    const largeData = {
      description: 'This is a large piece of data that should be compressed'.repeat(100),
      users: Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `User ${i}` }))
    };

    await secureStorage.setSecure('large-data', largeData, { compress: true });
    const retrievedLargeData = await secureStorage.getSecure('large-data');
    logger.success('Retrieved compressed encrypted data size', JSON.stringify(retrievedLargeData).length);

    // Cleanup
    await secureStorage.removeSecure('sensitive-data');
    await secureStorage.removeSecure('large-data');
  } catch (error) {
    logger.error(`Secure storage failed: ${error}`);
    throw error;
  }
}

/**
 * Demonstrates TTL (Time-To-Live) storage for temporary data
 */
async function demonstrateTTLStorage(): Promise<void> {
  logger.section('⏰ Time-Limited Storage:');
  
  try {
    const { createTTLStorage } = await import('../modules/storage');
    const ttlStorage = createTTLStorage();
    
    // Store authentication token for 5 seconds
    await ttlStorage.set('auth-token', 'bearer-xyz123', 5000);
    logger.success('Auth token stored with 5s TTL');
    
    let token = await ttlStorage.get('auth-token');
    logger.success('Retrieved token immediately', !!token);
    
    // Check time remaining
    const timeLeft = await ttlStorage.getTimeToLive('auth-token');
    logger.success('Time remaining', `${timeLeft}ms`);
    
    // Extend TTL for critical operations
    const extended = await ttlStorage.extend('auth-token', 3000);
    logger.success('TTL extended', extended);
    
    // Cleanup TTL storage
    await ttlStorage.cleanup();
    logger.info('TTL storage cleaned up');
  } catch (error) {
    logger.error(`TTL storage failed: ${error}`);
    throw error;
  }
}

/**
 * Demonstrates versioned storage for audit trails
 */
async function demonstrateVersionedStorage(): Promise<void> {
  logger.section('📚 Versioned Storage (Audit Trail):');
  
  try {
    const { createVersionedStorage } = await import('../modules/storage');
    const versionedStorage = createVersionedStorage(3); // Keep 3 versions
    
    // Create audit trail for user data changes
    let userProfile: UserProfile = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user'
    };

    await versionedStorage.set('user-profile', userProfile, 'Initial profile creation');
    
    userProfile = {
      ...userProfile,
      email: 'john.doe@company.com',
      role: 'admin'
    };
    await versionedStorage.set('user-profile', userProfile, 'Email updated and promoted to admin');
    
    userProfile = {
      ...userProfile,
      name: 'John Smith',
      email: 'john.smith@company.com'
    };
    await versionedStorage.set('user-profile', userProfile, 'Name changed after marriage');
    
    const currentProfile = await versionedStorage.get<UserProfile>('user-profile');
    logger.success('Current profile', currentProfile);
    
    const history = await versionedStorage.getVersionHistory('user-profile');
    logger.success('Audit trail entries', history.length);
    history.forEach((entry, index) => {
      logger.info(`Version ${index}: ${entry.description} (${new Date(entry.timestamp).toISOString()})`);
    });
    
    // Restore previous version for rollback
    const restored = await versionedStorage.restoreVersion('user-profile', 0);
    logger.success('Restored to previous version', restored);
    
    // Cleanup
    await versionedStorage.remove('user-profile');
  } catch (error) {
    logger.error(`Versioned storage failed: ${error}`);
    throw error;
  }
}

/**
 * Demonstrates observable storage for real-time monitoring
 */
async function demonstrateObservableStorage(): Promise<void> {
  logger.section('👁️ Observable Storage (Security Monitoring):');
  
  try {
    const { createObservableStorage } = await import('../modules/storage');
    const observableStorage = createObservableStorage();
    
    // Set up security monitoring
    const unsubscribe = observableStorage.onAny((key, newValue, oldValue) => {
      logger.info(`Security Alert: Key "${key}" changed`);
      if (key.includes('admin') || key.includes('sensitive')) {
        logger.warning(`High-privilege data modified: ${key}`);
      }
    });
    
    // Monitor specific sensitive keys
    const adminUnsubscribe = observableStorage.on('admin-settings', (newValue, oldValue) => {
      logger.warning('Admin settings changed!');
      console.log('Previous:', oldValue);
      console.log('New:', newValue);
    });
    
    // Trigger monitoring events
    await observableStorage.set('admin-settings', { debug: true, maintenance: false });
    await observableStorage.set('user-data', { id: 123 });
    await observableStorage.set('sensitive-config', { apiKey: 'secret' });
    
    // Cleanup monitoring
    unsubscribe();
    adminUnsubscribe();
    
    // Remove test data
    await observableStorage.remove('admin-settings');
    await observableStorage.remove('user-data');
    await observableStorage.remove('sensitive-config');
  } catch (error) {
    logger.error(`Observable storage failed: ${error}`);
    throw error;
  }
}

/**
 * Demonstrates storage migration and backup features
 */
async function demonstrateBackupAndMigration(): Promise<void> {
  logger.section('💾 Security Backup and Migration:');
  
  try {
    const { storageMigrations } = await import('../modules/storage');
    
    // Create a backup before any risky operations
    const backupKey = await storageMigrations.backup();
    logger.success('Security backup created', backupKey);
    
    // Test data migration (example)
    const testMigrations = [
      {
        version: 1,
        up: (data: Record<string, any>) => {
          // Example migration: rename old keys
          const newData = { ...data };
          if (newData.oldKey) {
            newData.newKey = newData.oldKey;
            delete newData.oldKey;
          }
          return newData;
        }
      }
    ];
    
    // Apply migrations
    await storageMigrations.migrate(testMigrations);
    logger.success('Storage migrations applied');
    
  } catch (error) {
    logger.error(`Backup and migration failed: ${error}`);
    throw error;
  }
}

/**
 * Demonstrates advanced security patterns
 */
async function demonstrateAdvancedSecurity(): Promise<void> {
  logger.section('🛡️ Advanced Security Patterns:');
  
  try {
    await demonstrateDataValidation();
    await demonstrateAccessControl();
    await demonstrateSecurityAudit();
    await demonstrateSessionManagement();
    await demonstrateKeyRotation();
  } catch (error) {
    logger.error(`Advanced security demonstrations failed: ${error}`);
    throw error;
  }
}

/**
 * Demonstrates data validation and sanitization
 */
async function demonstrateDataValidation(): Promise<void> {
  logger.section('✅ Data Validation:');
  
  try {
    const { createSecureStorage } = await import('../modules/storage');
    const secureStorage = createSecureStorage('validation-key-456');
    
    const validateAndStore = async (key: string, data: any, schema: any) => {
      // Simple validation example
      const isValid = typeof data.email === 'string' && 
                     data.email.includes('@') &&
                     typeof data.age === 'number' &&
                     data.age >= 0;
      
      if (!isValid) {
        throw new Error('Data validation failed');
      }
      
      // Sanitize sensitive data before storage
      const sanitized = {
        ...data,
        email: data.email.toLowerCase().trim(),
        // Remove any script tags or dangerous content
        name: data.name?.replace(/<script.*?>.*?<\/script>/gi, ''),
      };
      
      await secureStorage.setSecure(key, sanitized);
      logger.success(`Validated and stored secure data: ${key}`);
    };
    
    const testData = {
      name: 'Jane Doe',
      email: 'JANE.DOE@EXAMPLE.COM  ',
      age: 30
    };
    
    await validateAndStore('validated-user', testData, {});
    
    // Cleanup
    await secureStorage.removeSecure('validated-user');
  } catch (error) {
    logger.warning(`Validation error: ${error}`);
  }
}

/**
 * Demonstrates access control patterns
 */
async function demonstrateAccessControl(): Promise<void> {
  logger.section('🔐 Access Control Patterns:');
  
  try {
    const { createSecureStorage } = await import('../modules/storage');
    const secureStorage = createSecureStorage('access-control-key-789');
    
    type UserRole = 'admin' | 'user' | 'guest';
    
    const createSecureAccessor = (userRole: UserRole) => {
      return {
        async readData(key: string) {
          const permissions = {
            admin: ['system-config', 'user-data', 'public-data'],
            user: ['user-data', 'public-data'],
            guest: ['public-data']
          };
          
          const allowedKeys = permissions[userRole];
          if (!allowedKeys.some(pattern => key.includes(pattern))) {
            throw new Error(`Access denied: ${userRole} cannot read ${key}`);
          }
          
          return await secureStorage.getSecure(key);
        },
        
        async writeData(key: string, data: any) {
          const writePermissions = {
            admin: ['system-config', 'user-data'],
            user: ['user-data'],
            guest: []
          };
          
          const allowedKeys = writePermissions[userRole];
          if (!allowedKeys.some(pattern => key.includes(pattern))) {
            throw new Error(`Access denied: ${userRole} cannot write ${key}`);
          }
          
          await secureStorage.setSecure(key, data);
          logger.success(`${userRole} wrote data to ${key}`);
        }
      };
    };
    
    const adminAccessor = createSecureAccessor('admin');
    const userAccessor = createSecureAccessor('user');
    const guestAccessor = createSecureAccessor('guest');
    
    // Test access control
    await adminAccessor.writeData('system-config', { maintenance: true });
    await userAccessor.writeData('user-data', { preferences: 'dark-theme' });
    
    try {
      await guestAccessor.writeData('user-data', { malicious: 'data' });
    } catch (error) {
      logger.success('Access control working', error instanceof Error ? error.message : 'Access denied');
    }
    
    // Cleanup
    await secureStorage.removeSecure('system-config');
    await secureStorage.removeSecure('user-data');
  } catch (error) {
    logger.error(`Access control failed: ${error}`);
  }
}

/**
 * Demonstrates security audit trail functionality
 */
async function demonstrateSecurityAudit(): Promise<void> {
  logger.section('📊 Security Audit Trail:');
  
  try {
    const { createSecureStorage } = await import('../modules/storage');
    const secureStorage = createSecureStorage('audit-key-101112');
    
    interface AuditLog {
      timestamp: number;
      action: string;
      user: string;
      details: any;
    }
    
    const securityAudit = {
      logs: [] as AuditLog[],
      
      log(action: string, user: string, details: any) {
        this.logs.push({
          timestamp: Date.now(),
          action,
          user,
          details
        });
      },
      
      async getSecurityReport() {
        const report = {
          totalActions: this.logs.length,
          suspiciousActivity: this.logs.filter(log => 
            log.action.includes('failed') || 
            log.details?.sensitive === true
          ),
          userActivity: this.logs.reduce((acc, log) => {
            acc[log.user] = (acc[log.user] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          recentActivity: this.logs.slice(-5)
        };
        
        // Store security report
        await secureStorage.setSecure('security-audit-report', report);
        return report;
      }
    };
    
    // Simulate security events
    securityAudit.log('login', 'john_doe', { ip: '192.168.1.100', success: true });
    securityAudit.log('failed_login', 'attacker', { ip: '10.0.0.1', reason: 'invalid_password' });
    securityAudit.log('data_access', 'jane_admin', { resource: 'user-profiles', sensitive: true });
    securityAudit.log('config_change', 'jane_admin', { 
      setting: 'security_level', 
      oldValue: 'medium', 
      newValue: 'high' 
    });
    
    const auditReport = await securityAudit.getSecurityReport();
    logger.success('Security audit report generated');
    logger.info(`Total actions: ${auditReport.totalActions}`);
    logger.info(`Suspicious activities: ${auditReport.suspiciousActivity.length}`);
    logger.info(`User activity: ${JSON.stringify(auditReport.userActivity)}`);
    
    // Cleanup
    await secureStorage.removeSecure('security-audit-report');
  } catch (error) {
    logger.error(`Security audit failed: ${error}`);
  }
}

/**
 * Demonstrates secure session management
 */
async function demonstrateSessionManagement(): Promise<void> {
  logger.section('🎫 Secure Session Management:');
  
  try {
    const { createTTLStorage } = await import('../modules/storage');
    const ttlStorage = createTTLStorage();
    
    interface SessionData {
      userId: string;
      permissions: string[];
      createdAt: number;
      lastAccess: number;
      ipAddress: string;
      userAgent: string;
    }
    
    const sessionManager = {
      async createSession(userId: string, permissions: string[]): Promise<string> {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const sessionData: SessionData = {
          userId,
          permissions,
          createdAt: Date.now(),
          lastAccess: Date.now(),
          ipAddress: '192.168.1.100', // Would be real IP in production
          userAgent: 'Bun/1.0 Example'
        };
        
        await ttlStorage.set(sessionId, sessionData, 30 * 60 * 1000); // 30 minutes
        logger.success(`Session created: ${sessionId}`);
        return sessionId;
      },
      
      async validateSession(sessionId: string): Promise<SessionData> {
        const session = await ttlStorage.get<SessionData>(sessionId);
        if (!session) {
          throw new Error('Session expired or invalid');
        }
        
        // Update last access
        session.lastAccess = Date.now();
        await ttlStorage.set(sessionId, session, 30 * 60 * 1000);
        
        return session;
      },
      
      async revokeSession(sessionId: string): Promise<void> {
        await ttlStorage.remove(sessionId);
        logger.success(`Session revoked: ${sessionId}`);
      }
    };
    
    const sessionId = await sessionManager.createSession('john_doe', ['read:profile', 'write:preferences']);
    const session = await sessionManager.validateSession(sessionId);
    logger.success('Session validated for user', session.userId);
    await sessionManager.revokeSession(sessionId);
  } catch (error) {
    logger.error(`Session management failed: ${error}`);
  }
}

/**
 * Demonstrates encryption key rotation
 */
async function demonstrateKeyRotation(): Promise<void> {
  logger.section('🔄 Encryption Key Rotation:');
  
  try {
    const { createSecureStorage } = await import('../modules/storage');
    
    const oldKey = 'old-encryption-key-123';
    const newKey = 'new-encryption-key-456';
    
    // Store data with old key
    const oldSecureStorage = createSecureStorage(oldKey);
    const testData = { data: 'sensitive information' };
    await oldSecureStorage.setSecure('rotation-test', testData);
    logger.success('Data stored with old encryption key');
    
    // Rotate to new key
    const oldData = await oldSecureStorage.getSecure('rotation-test');
    const newSecureStorage = createSecureStorage(newKey);
    await newSecureStorage.setSecure('rotation-test', oldData);
    await oldSecureStorage.removeSecure('rotation-test');
    logger.success('Encryption key rotated successfully');
    
    // Verify data integrity
    const rotatedData = await newSecureStorage.getSecure('rotation-test');
    logger.success('Data integrity verified after rotation', !!rotatedData);
    
    // Cleanup
    await newSecureStorage.removeSecure('rotation-test');
  } catch (error) {
    logger.error(`Key rotation failed: ${error}`);
  }
}

/**
 * Main function that runs all storage examples
 */
async function runStorageExamples(): Promise<void> {
  console.log('💾 Storage Module Example\n');

  try {
    await demonstrateBasicOperations();
    await demonstrateKeyManagement();
    await demonstrateNamespacedStorage();
    await demonstrateDataCleanup();
    await demonstrateSecureStorage();
    await demonstrateTTLStorage();
    await demonstrateVersionedStorage();
    await demonstrateObservableStorage();
    await demonstrateBackupAndMigration();
    await demonstrateAdvancedSecurity();

    logger.section('✅ Storage module example with security features completed!');

  } catch (error) {
    logger.error(`Storage example failed: ${error}`);
  } finally {
    // Cleanup
    try {
      await storage.clear();
      logger.success('Storage cleared');
    } catch (error) {
      logger.warning(`Cleanup warning: ${error}`);
    }
  }
}

// Run the example
if (import.meta.main) {
  await runStorageExamples();
}
