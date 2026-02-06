import { logger } from '../../utils/logger';

describe('logger', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env.NODE_ENV = originalEnv;
  });

  describe('in development mode', () => {
    it('should call console.log', () => {
      logger.log('test message');
      expect(console.log).toHaveBeenCalledWith('test message');
    });

    it('should call console.warn', () => {
      logger.warn('warning message');
      expect(console.warn).toHaveBeenCalledWith('warning message');
    });

    it('should call console.info', () => {
      logger.info('info message');
      expect(console.info).toHaveBeenCalledWith('info message');
    });

    it('should pass multiple arguments', () => {
      logger.log('msg', 'extra', 123);
      expect(console.log).toHaveBeenCalledWith('msg', 'extra', 123);
    });
  });

  describe('error logging', () => {
    it('should always call console.error', () => {
      logger.error('error message');
      expect(console.error).toHaveBeenCalledWith('error message');
    });

    it('should pass error objects', () => {
      const err = new Error('test');
      logger.error('failed:', err);
      expect(console.error).toHaveBeenCalledWith('failed:', err);
    });
  });

  describe('exports', () => {
    it('should export logger as named export', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.log).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.info).toBe('function');
    });

    it('should export logger as default export', async () => {
      const mod = await import('../../utils/logger');
      expect(mod.default).toBe(mod.logger);
    });
  });
});
