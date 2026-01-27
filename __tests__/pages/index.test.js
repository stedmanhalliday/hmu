import { render, screen, fireEvent } from '@testing-library/react';
import { StorageContext } from '../../pages/_app';
import Home from '../../pages/index';

// Mock next/router
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    query: {}
  })
}));

// Mock typed.js - the dynamic import returns { default: Typed } so we mock the whole module
jest.mock('typed.js', () => ({
  __esModule: true,
  default: class MockTyped {
    constructor() {
      this.destroy = jest.fn();
    }
  }
}));

// Mock the logger
jest.mock('../../utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
}));

// Mock gtag
global.gtag = jest.fn();

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('Home Page', () => {
  const mockReorderContacts = jest.fn();

  const createMockContext = (overrides = {}) => ({
    contacts: [],
    canAddContact: true,
    reorderContacts: mockReorderContacts,
    getContact: jest.fn(),
    setContact: jest.fn(),
    deleteContact: jest.fn(),
    storageError: false,
    setStorageError: jest.fn(),
    ...overrides
  });

  const renderHome = (contextOverrides = {}) => {
    return render(
      <StorageContext.Provider value={createMockContext(contextOverrides)}>
        <Home />
      </StorageContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the main headline', () => {
      renderHome();
      expect(screen.getByText('Share what matters')).toBeInTheDocument();
    });

    it('should render the subheadline', () => {
      renderHome();
      expect(screen.getByText(/Connect faster IRL with personal QR codes/)).toBeInTheDocument();
    });

    it('should render Install app button when not standalone', () => {
      renderHome();
      expect(screen.getByRole('button', { name: /install app/i })).toBeInTheDocument();
    });

    it('should render Privacy button', () => {
      renderHome();
      expect(screen.getByRole('button', { name: /privacy/i })).toBeInTheDocument();
    });

    it('should render the question mark help button', () => {
      renderHome();
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  describe('modals', () => {
    it('should show privacy modal when Privacy button is clicked', () => {
      renderHome();
      
      const privacyButton = screen.getByRole('button', { name: /privacy/i });
      fireEvent.click(privacyButton);

      // Modal should show privacy content
      expect(screen.getByText(/doesn't keep your personal information/)).toBeInTheDocument();
    });

    it('should close privacy modal when Dismiss is clicked', () => {
      renderHome();
      
      const privacyButton = screen.getByRole('button', { name: /privacy/i });
      fireEvent.click(privacyButton);

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);

      expect(screen.queryByText(/doesn't keep your personal information/)).not.toBeInTheDocument();
    });

    it('should show feedback modal when ? button is clicked', () => {
      renderHome();
      
      const helpButton = screen.getByText('?');
      fireEvent.click(helpButton);

      expect(screen.getByText('Contribute')).toBeInTheDocument();
      expect(screen.getByText(/Help improve hmu.world/)).toBeInTheDocument();
    });
  });

  describe('install flow', () => {
    it('should call gtag when install button is clicked', () => {
      renderHome();
      
      const installButton = screen.getByRole('button', { name: /install app/i });
      fireEvent.click(installButton);

      expect(global.gtag).toHaveBeenCalledWith('event', 'install_button');
    });

    it('should show install modal when no install prompt available', () => {
      renderHome();
      
      const installButton = screen.getByRole('button', { name: /install app/i });
      fireEvent.click(installButton);

      // Install modal should appear with iOS/Android instructions
      expect(screen.getByText(/supports iOS and Android/i)).toBeInTheDocument();
    });
  });

  describe('standalone mode with contacts', () => {
    beforeEach(() => {
      // Mock standalone mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(display-mode: standalone)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    });

    it('should render New contact button when no contacts exist', () => {
      renderHome({ contacts: [] });
      expect(screen.getByRole('button', { name: /new contact/i })).toBeInTheDocument();
    });

    it('should navigate to create page when New contact is clicked', () => {
      renderHome({ contacts: [] });
      
      const newContactButton = screen.getByRole('button', { name: /new contact/i });
      fireEvent.click(newContactButton);

      expect(mockPush).toHaveBeenCalledWith('/create?id=new');
    });

    it('should render contacts when they exist', () => {
      const contacts = [
        {
          id: 'contact-1',
          formValues: {
            name: 'John Doe',
            vibe: JSON.stringify({ emoji: '😀', group: ['#ff0000', '#00ff00'] })
          }
        }
      ];

      renderHome({ contacts });
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
