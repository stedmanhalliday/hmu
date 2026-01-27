import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { StorageContext } from '../../pages/_app';
import Preview from '../../pages/preview';

// Mock next/router
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockRouterState = { query: { id: 'contact-1' } };
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    get query() { return mockRouterState.query; }
  })
}));

// Mock qrcode with resolved promise
const mockToDataURL = jest.fn().mockResolvedValue('data:image/png;base64,mockqrcode');
jest.mock('qrcode', () => ({
  __esModule: true,
  default: {
    toDataURL: (...args) => mockToDataURL(...args)
  }
}));

// Mock the logger
jest.mock('../../utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('Preview Page', () => {
  const mockContact = {
    id: 'contact-1',
    formValues: {
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      url: 'https://example.com',
      vibe: JSON.stringify({ emoji: '😀', group: ['#ff0000', '#00ff00'] }),
      photo: ''
    },
    linkValues: {
      twitter: 'johndoe',
      linkedin: 'johndoe',
      github: '',
      telegram: '',
      instagram: '',
      venmo: '',
      custom: ''
    }
  };

  const createMockContext = (overrides = {}) => ({
    contacts: [mockContact],
    getContact: jest.fn().mockReturnValue(mockContact),
    setContact: jest.fn(),
    deleteContact: jest.fn(),
    reorderContacts: jest.fn(),
    canAddContact: true,
    storageError: false,
    setStorageError: jest.fn(),
    ...overrides
  });

  const renderPreview = async (contextOverrides = {}) => {
    let result;
    await act(async () => {
      result = render(
        <StorageContext.Provider value={createMockContext(contextOverrides)}>
          <Preview />
        </StorageContext.Provider>
      );
    });
    // Wait for async QR code generation
    await act(async () => {
      await Promise.resolve();
    });
    return result;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouterState.query = { id: 'contact-1' };
    mockLocalStorage.getItem.mockReturnValue(null);
    mockToDataURL.mockResolvedValue('data:image/png;base64,mockqrcode');
  });

  describe('rendering', () => {
    it('should render the contact name', async () => {
      await renderPreview();
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });

    it('should render navigation buttons', async () => {
      await renderPreview();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });
    });

    it('should render the hmu.world footer', async () => {
      await renderPreview();
      await waitFor(() => {
        expect(screen.getByText('hmu.world')).toBeInTheDocument();
      });
    });
  });

  describe('navigation', () => {
    it('should navigate to home when Home button is clicked', async () => {
      await renderPreview();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /home/i }));
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should toggle edit mode when Edit button is clicked', async () => {
      await renderPreview();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('edit pane', () => {
    it('should show edit pane when in edit mode', async () => {
      await renderPreview();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      expect(screen.getByText('Edit contact')).toBeInTheDocument();
      expect(screen.getByText('Edit links')).toBeInTheDocument();
      expect(screen.getByText('Delete contact')).toBeInTheDocument();
    });

    it('should navigate to contact edit when Edit contact is clicked', async () => {
      await renderPreview();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      fireEvent.click(screen.getByText('Edit contact'));

      expect(mockPush).toHaveBeenCalledWith('/create?id=contact-1&editing=true');
    });

    it('should navigate to links edit when Edit links is clicked', async () => {
      await renderPreview();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      fireEvent.click(screen.getByText('Edit links'));

      expect(mockPush).toHaveBeenCalledWith('/links?id=contact-1');
    });
  });

  describe('delete flow', () => {
    it('should show delete confirmation modal', async () => {
      await renderPreview();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));
      fireEvent.click(screen.getByText('Delete contact'));

      expect(screen.getByText('Delete Contact')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete this contact/)).toBeInTheDocument();
    });
  });

  describe('no contacts', () => {
    it('should redirect to home when no contacts exist', async () => {
      await renderPreview({ contacts: [], getContact: jest.fn().mockReturnValue(null) });
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('QR code generation', () => {
    it('should generate QR code for contact', async () => {
      await renderPreview();
      await waitFor(() => {
        expect(mockToDataURL).toHaveBeenCalled();
      });
    });
  });
});
