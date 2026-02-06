import { migrateFromSecureStorage } from '../../utils/migration';
import { safeGetItem, safeSetItem, STORAGE_KEYS } from '../../utils/storage.js';

// Mock the storage module
jest.mock('../../utils/storage.js', () => ({
  safeGetItem: jest.fn(),
  safeSetItem: jest.fn(),
  STORAGE_KEYS: {
    MIGRATION_COMPLETE: 'MIGRATION_COMPLETE',
  },
}));

// Mock the logger
jest.mock('../../utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
}));

describe('migrateFromSecureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should skip if migration already complete', () => {
    safeGetItem.mockReturnValue('true');

    const result = migrateFromSecureStorage();

    expect(safeGetItem).toHaveBeenCalledWith(STORAGE_KEYS.MIGRATION_COMPLETE);
    expect(result.skipped).toBe(true);
    expect(result.migrated).toEqual([]);
    expect(result.failed).toEqual([]);
    expect(safeSetItem).not.toHaveBeenCalled();
  });

  it('should mark migration complete on first run', () => {
    safeGetItem.mockReturnValue(null);

    migrateFromSecureStorage();

    expect(safeSetItem).toHaveBeenCalledWith(
      STORAGE_KEYS.MIGRATION_COMPLETE,
      true
    );
  });

  it('should return standard result shape', () => {
    safeGetItem.mockReturnValue(null);

    const result = migrateFromSecureStorage();

    expect(result).toHaveProperty('migrated');
    expect(result).toHaveProperty('failed');
    expect(result).toHaveProperty('skipped');
    expect(Array.isArray(result.migrated)).toBe(true);
    expect(Array.isArray(result.failed)).toBe(true);
  });

  it('should be idempotent (safe to call multiple times)', () => {
    safeGetItem.mockReturnValue(null);

    migrateFromSecureStorage();
    migrateFromSecureStorage();

    expect(safeSetItem).toHaveBeenCalledTimes(2);
  });
});
