import { resizeImage } from '../../utils/image';

// Mock FileReader
class MockFileReader {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this.result = null;
  }

  readAsDataURL(file) {
    // Simulate async behavior
    setTimeout(() => {
      if (file._shouldFail) {
        this.onerror(new Error('Failed to read file'));
      } else {
        this.result = 'data:image/jpeg;base64,mockbase64data';
        this.onload({ target: { result: this.result } });
      }
    }, 0);
  }
}

// Mock Image
class MockImage {
  constructor() {
    this.onload = null;
    this.onerror = null;
    this._src = '';
  }

  set src(value) {
    this._src = value;
    setTimeout(() => {
      if (value.includes('error')) {
        this.onerror(new Error('Failed to load image'));
      } else {
        // Default dimensions
        this.width = 200;
        this.height = 100;
        this.onload();
      }
    }, 0);
  }

  get src() {
    return this._src;
  }
}

// Mock canvas context
const mockCtx = {
  drawImage: jest.fn()
};

// Mock canvas
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(() => mockCtx),
  toDataURL: jest.fn(() => 'data:image/jpeg;base64,resizedimagedata')
};

// Set up globals
global.FileReader = MockFileReader;
global.Image = MockImage;

describe('resizeImage', () => {
  let originalCreateElement;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock document.createElement for canvas
    originalCreateElement = document.createElement;
    document.createElement = jest.fn((tag) => {
      if (tag === 'canvas') {
        return mockCanvas;
      }
      return originalCreateElement.call(document, tag);
    });
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
  });

  describe('basic functionality', () => {
    it('should return a promise', () => {
      const file = new Blob([''], { type: 'image/jpeg' });
      const result = resizeImage(file);
      expect(result).toBeInstanceOf(Promise);
    });

    it('should resolve with base64 string', async () => {
      const file = new Blob([''], { type: 'image/jpeg' });
      const result = await resizeImage(file);
      expect(result).toBe('data:image/jpeg;base64,resizedimagedata');
    });

    it('should create a canvas element', async () => {
      const file = new Blob([''], { type: 'image/jpeg' });
      await resizeImage(file);
      expect(document.createElement).toHaveBeenCalledWith('canvas');
    });

    it('should get 2d context from canvas', async () => {
      const file = new Blob([''], { type: 'image/jpeg' });
      await resizeImage(file);
      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
    });

    it('should draw image on canvas', async () => {
      const file = new Blob([''], { type: 'image/jpeg' });
      await resizeImage(file);
      expect(mockCtx.drawImage).toHaveBeenCalled();
    });
  });

  describe('default parameters', () => {
    it('should use default maxSize of 150', async () => {
      const file = new Blob([''], { type: 'image/jpeg' });
      await resizeImage(file);
      // With 200x100 image and maxSize 150, width should be 150, height 75
      expect(mockCanvas.width).toBe(150);
      expect(mockCanvas.height).toBe(75);
    });

    it('should use default quality of 0.8', async () => {
      const file = new Blob([''], { type: 'image/jpeg' });
      await resizeImage(file);
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.8);
    });
  });

  describe('custom parameters', () => {
    it('should accept custom maxSize', async () => {
      const file = new Blob([''], { type: 'image/jpeg' });
      await resizeImage(file, 100);
      // With 200x100 image and maxSize 100, width should be 100, height 50
      expect(mockCanvas.width).toBe(100);
      expect(mockCanvas.height).toBe(50);
    });

    it('should accept custom quality', async () => {
      const file = new Blob([''], { type: 'image/jpeg' });
      await resizeImage(file, 150, 0.5);
      expect(mockCanvas.toDataURL).toHaveBeenCalledWith('image/jpeg', 0.5);
    });
  });

  describe('aspect ratio handling', () => {
    it('should maintain aspect ratio for landscape images', async () => {
      const file = new Blob([''], { type: 'image/jpeg' });
      await resizeImage(file, 150);
      // 200x100 scaled to max 150 = 150x75
      expect(mockCanvas.width).toBe(150);
      expect(mockCanvas.height).toBe(75);
    });

    it('should maintain aspect ratio for portrait images', async () => {
      // Override Image to return portrait dimensions
      const OriginalImage = global.Image;
      global.Image = class extends MockImage {
        set src(value) {
          this._src = value;
          setTimeout(() => {
            this.width = 100;
            this.height = 200;
            this.onload();
          }, 0);
        }
      };

      const file = new Blob([''], { type: 'image/jpeg' });
      await resizeImage(file, 150);
      // 100x200 scaled to max 150 = 75x150
      expect(mockCanvas.width).toBe(75);
      expect(mockCanvas.height).toBe(150);

      global.Image = OriginalImage;
    });

    it('should not upscale small images', async () => {
      // Override Image to return small dimensions
      const OriginalImage = global.Image;
      global.Image = class extends MockImage {
        set src(value) {
          this._src = value;
          setTimeout(() => {
            this.width = 50;
            this.height = 50;
            this.onload();
          }, 0);
        }
      };

      const file = new Blob([''], { type: 'image/jpeg' });
      await resizeImage(file, 150);
      // 50x50 should not be upscaled
      expect(mockCanvas.width).toBe(50);
      expect(mockCanvas.height).toBe(50);

      global.Image = OriginalImage;
    });
  });

  describe('error handling', () => {
    it('should reject when FileReader fails', async () => {
      const file = new Blob([''], { type: 'image/jpeg' });
      file._shouldFail = true;

      await expect(resizeImage(file)).rejects.toThrow('Failed to read file');
    });

    it('should reject when Image fails to load', async () => {
      // Override Image to fail
      const OriginalImage = global.Image;
      global.Image = class extends MockImage {
        set src(value) {
          this._src = value;
          setTimeout(() => {
            this.onerror(new Error('Failed to load image'));
          }, 0);
        }
      };

      const file = new Blob([''], { type: 'image/jpeg' });
      await expect(resizeImage(file)).rejects.toThrow('Failed to load image');

      global.Image = OriginalImage;
    });
  });
});
