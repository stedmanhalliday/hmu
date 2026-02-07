import { render, screen, act } from '@testing-library/react';
import { StorageContext } from '../../pages/_app';
import Links from '../../pages/links';

// Mock next/router
const mockPush = jest.fn();
let mockQuery = {};
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    query: mockQuery
  })
}));

// Mock the logger
jest.mock('../../utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
}));

// Capture LinkForm props for assertions
let capturedLinkFormProps = {};
jest.mock('../../components/LinkForm.js', () => {
  return function MockLinkForm(props) {
    capturedLinkFormProps = props;
    return (
      <div data-testid="link-form">
        <span data-testid="link-form-contact-id">{props.contactId}</span>
        <span data-testid="link-form-initial-values">{JSON.stringify(props.initialLinkValues)}</span>
        <button
          data-testid="toggle-magic-form"
          onClick={() => props.setShowMagicForm(true)}
        >
          Toggle Magic Form
        </button>
      </div>
    );
  };
});

// Mock gtag
global.gtag = jest.fn();

describe('Links Page', () => {
  const mockGetContact = jest.fn();

  const createMockContext = (overrides = {}) => ({
    contacts: [],
    canAddContact: true,
    getContact: mockGetContact,
    setContact: jest.fn(),
    deleteContact: jest.fn(),
    reorderContacts: jest.fn(),
    storageError: false,
    setStorageError: jest.fn(),
    ...overrides
  });

  const renderLinks = (contextOverrides = {}) => {
    return render(
      <StorageContext.Provider value={createMockContext(contextOverrides)}>
        <Links />
      </StorageContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = {};
    capturedLinkFormProps = {};
  });

  describe('rendering', () => {
    it('should render the "Edit your links" heading', () => {
      renderLinks();
      expect(screen.getByText('Edit your links')).toBeInTheDocument();
    });

    it('should render the link emoji image', () => {
      renderLinks();
      const emojiImg = screen.getByAltText('🔗');
      expect(emojiImg).toBeInTheDocument();
    });

    it('should render the LinkForm component', () => {
      renderLinks();
      expect(screen.getByTestId('link-form')).toBeInTheDocument();
    });
  });

  describe('LinkForm props', () => {
    it('should pass contactId from router query to LinkForm', () => {
      mockQuery = { id: 'contact-123' };
      renderLinks();
      expect(screen.getByTestId('link-form-contact-id')).toHaveTextContent('contact-123');
    });

    it('should pass null initialLinkValues when no contact data', () => {
      mockQuery = { id: 'contact-123' };
      mockGetContact.mockReturnValue(null);
      renderLinks();
      expect(screen.getByTestId('link-form-initial-values')).toHaveTextContent('null');
    });

    it('should pass initialLinkValues from contact data', () => {
      const linkValues = { twitter: 'testuser', instagram: 'instauser' };
      mockQuery = { id: 'contact-123' };
      mockGetContact.mockReturnValue({
        id: 'contact-123',
        formValues: { name: 'Test' },
        linkValues
      });

      renderLinks();

      expect(mockGetContact).toHaveBeenCalledWith('contact-123');
      expect(screen.getByTestId('link-form-initial-values')).toHaveTextContent(
        JSON.stringify(linkValues)
      );
    });

    it('should not call getContact when contactId is missing', () => {
      mockQuery = {};
      renderLinks();
      expect(mockGetContact).not.toHaveBeenCalled();
    });

    it('should pass showMagicForm as false initially', () => {
      renderLinks();
      expect(capturedLinkFormProps.showMagicForm).toBe(false);
    });
  });

  describe('Magic Message mode', () => {
    it('should show Magic Message heading when showMagicForm is toggled', () => {
      renderLinks();

      // Initially shows "Edit your links"
      expect(screen.getByText('Edit your links')).toBeInTheDocument();

      // Toggle magic form via the LinkForm callback
      act(() => {
        capturedLinkFormProps.setShowMagicForm(true);
      });

      expect(screen.getByText('Magic Message')).toBeInTheDocument();
      expect(screen.queryByText('Edit your links')).not.toBeInTheDocument();
    });

    it('should show Magic Message subtitle when in magic form mode', () => {
      renderLinks();

      act(() => {
        capturedLinkFormProps.setShowMagicForm(true);
      });

      expect(screen.getByText(/Draft a ready-made message/)).toBeInTheDocument();
    });

    it('should show magic message 3D image when in magic form mode', () => {
      renderLinks();

      act(() => {
        capturedLinkFormProps.setShowMagicForm(true);
      });

      const magicImg = screen.getByAltText('Magic Message');
      expect(magicImg).toBeInTheDocument();
    });
  });

  describe('contact loading', () => {
    it('should handle contact with no linkValues', () => {
      mockQuery = { id: 'contact-456' };
      mockGetContact.mockReturnValue({
        id: 'contact-456',
        formValues: { name: 'Test' }
      });

      renderLinks();

      expect(screen.getByTestId('link-form-initial-values')).toHaveTextContent('null');
    });
  });
});
