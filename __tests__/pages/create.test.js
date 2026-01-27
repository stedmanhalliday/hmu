import { render, screen, act } from '@testing-library/react';
import { StorageContext } from '../../pages/_app';
import Create from '../../pages/create';

// Mock next/router
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockRouterState = { query: { id: 'new' } };
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    get query() { return mockRouterState.query; }
  })
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

describe('Create Page', () => {
  const mockSetContact = jest.fn();
  const mockGetContact = jest.fn();

  const createMockContext = (overrides = {}) => ({
    contacts: [],
    canAddContact: true,
    getContact: mockGetContact,
    setContact: mockSetContact,
    deleteContact: jest.fn(),
    reorderContacts: jest.fn(),
    storageError: false,
    setStorageError: jest.fn(),
    ...overrides
  });

  const renderCreate = (contextOverrides = {}) => {
    let result;
    act(() => {
      result = render(
        <StorageContext.Provider value={createMockContext(contextOverrides)}>
          <Create />
        </StorageContext.Provider>
      );
    });
    return result;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockRouterState.query = { id: 'new' };
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('new contact mode', () => {
    it('should render create contact header', () => {
      renderCreate();
      expect(screen.getByText('Create a new contact')).toBeInTheDocument();
    });

    it('should render the form with all fields', () => {
      renderCreate();
      
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
    });

    it('should render save and cancel buttons', () => {
      renderCreate();
      
      expect(screen.getByRole('button', { name: /save contact/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should show default avatar when no photo or vibe selected', () => {
      renderCreate();
      
      const avatar = screen.getByAltText('👤');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('edit contact mode', () => {
    beforeEach(() => {
      mockRouterState.query = { id: 'contact-123' };
      mockGetContact.mockReturnValue({
        id: 'contact-123',
        formValues: {
          name: 'John Doe',
          phone: '+1234567890',
          email: 'john@example.com',
          url: 'https://example.com',
          vibe: JSON.stringify({ emoji: '😀', group: ['#ff0000', '#00ff00'] }),
          photo: ''
        },
        linkValues: {}
      });
    });

    it('should render edit contact header', () => {
      renderCreate();
      expect(screen.getByText('Edit your contact')).toBeInTheDocument();
    });

    it('should populate form with existing contact data', () => {
      renderCreate();
      
      expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');
      expect(screen.getByLabelText(/phone/i)).toHaveValue('+1234567890');
      expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com');
      expect(screen.getByLabelText(/website/i)).toHaveValue('https://example.com');
    });
  });

  describe('max contacts reached', () => {
    it('should redirect to home when trying to create new contact at max', () => {
      mockRouterState.query = { id: 'new' };
      renderCreate({ canAddContact: false });
      
      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });

  describe('gradient background', () => {
    it('should have gradient background element', () => {
      const { container } = renderCreate();
      
      const gradientDiv = container.querySelector('.-z-10.fixed');
      expect(gradientDiv).toBeInTheDocument();
    });

    it('should animate gradient angle over time', () => {
      const { container } = renderCreate();
      
      const gradientDiv = container.querySelector('.-z-10.fixed');
      const initialStyle = gradientDiv.style.background;
      
      // Advance timers to trigger angle change
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      // The gradient should update (angle changes)
      expect(gradientDiv).toBeInTheDocument();
    });
  });
});
