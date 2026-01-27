import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MyApp, { StorageContext } from '../../pages/_app';
import { useContext } from 'react';

// Mock the logger
jest.mock('../../utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
}));

// Mock the migration function
jest.mock('../../utils/migration.js', () => ({
  migrateFromSecureStorage: jest.fn()
}));

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn(key => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; })
  };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock navigator.storage
Object.defineProperty(navigator, 'storage', {
  value: {
    persist: jest.fn().mockResolvedValue(true),
    estimate: jest.fn().mockResolvedValue({ usage: 1024, quota: 1024 * 1024 * 100 })
  },
  writable: true
});

// Test component that uses context
function TestConsumer() {
  const context = useContext(StorageContext);
  return (
    <div>
      <span data-testid="contacts-count">{context.contacts.length}</span>
      <span data-testid="can-add">{context.canAddContact ? 'yes' : 'no'}</span>
      <span data-testid="storage-error">{context.storageError ? 'error' : 'ok'}</span>
      <button onClick={() => context.setContact('new', { formValues: { name: 'Test' } })}>
        Add Contact
      </button>
      <button onClick={() => context.setStorageError(true)}>
        Trigger Error
      </button>
    </div>
  );
}

describe('MyApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('initialization', () => {
    it('should render children after loading', async () => {
      const TestComponent = () => <div>Test Content</div>;
      
      render(<MyApp Component={TestComponent} pageProps={{}} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Content')).toBeInTheDocument();
      });
    });

    it('should provide StorageContext to children', async () => {
      render(<MyApp Component={TestConsumer} pageProps={{}} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('contacts-count')).toBeInTheDocument();
      });
    });

    it('should start with empty contacts array', async () => {
      render(<MyApp Component={TestConsumer} pageProps={{}} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('contacts-count')).toHaveTextContent('0');
      });
    });

    it('should allow adding contacts initially', async () => {
      render(<MyApp Component={TestConsumer} pageProps={{}} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('can-add')).toHaveTextContent('yes');
      });
    });
  });

  describe('loading existing contacts', () => {
    it('should load contacts from localStorage', async () => {
      const savedContacts = [
        { id: 'contact-1', formValues: { name: 'John' }, linkValues: {} }
      ];
      mockLocalStorage.getItem.mockImplementation(key => {
        if (key === 'contacts') return JSON.stringify(savedContacts);
        if (key === 'multiContactMigrationComplete') return 'true';
        return null;
      });

      render(<MyApp Component={TestConsumer} pageProps={{}} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('contacts-count')).toHaveTextContent('1');
      });
    });
  });

  describe('storage error handling', () => {
    it('should show error banner when storage error occurs', async () => {
      render(<MyApp Component={TestConsumer} pageProps={{}} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('storage-error')).toHaveTextContent('ok');
      });

      // Trigger error
      fireEvent.click(screen.getByText('Trigger Error'));

      await waitFor(() => {
        expect(screen.getByText(/Unable to save your data/)).toBeInTheDocument();
      });
    });

    it('should dismiss error banner when Dismiss is clicked', async () => {
      render(<MyApp Component={TestConsumer} pageProps={{}} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('storage-error')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Trigger Error'));

      await waitFor(() => {
        expect(screen.getByText(/Unable to save your data/)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Dismiss'));

      await waitFor(() => {
        expect(screen.queryByText(/Unable to save your data/)).not.toBeInTheDocument();
      });
    });
  });

  describe('context operations', () => {
    it('should add a new contact', async () => {
      render(<MyApp Component={TestConsumer} pageProps={{}} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('contacts-count')).toHaveTextContent('0');
      });

      fireEvent.click(screen.getByText('Add Contact'));

      await waitFor(() => {
        expect(screen.getByTestId('contacts-count')).toHaveTextContent('1');
      });
    });
  });

  describe('ErrorBoundary', () => {
    // Suppress console.error for expected errors
    const originalError = console.error;
    beforeAll(() => {
      console.error = jest.fn();
    });
    afterAll(() => {
      console.error = originalError;
    });

    it('should catch errors in child components', async () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      render(<MyApp Component={ThrowError} pageProps={{}} />);
      
      await waitFor(() => {
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      });
    });
  });
});
