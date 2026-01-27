import { render, screen, fireEvent } from '@testing-library/react';
import { StorageContext } from '../../pages/_app';
import LinkForm from '../../components/LinkForm';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    query: {}
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

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    clear: jest.fn(() => { store = {}; }),
    removeItem: jest.fn((key) => { delete store[key]; })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('LinkForm', () => {
  const mockSetContact = jest.fn();
  const mockGetContact = jest.fn();
  const mockContextValue = {
    setContact: mockSetContact,
    getContact: mockGetContact,
    contacts: [{ id: 'test-contact-1', formValues: { name: 'Test' }, linkValues: {} }],
    deleteContact: jest.fn(),
    reorderContacts: jest.fn(),
    canAddContact: true,
    storageError: false,
    setStorageError: jest.fn()
  };

  const renderLinkForm = (props = {}) => {
    return render(
      <StorageContext.Provider value={mockContextValue}>
        <LinkForm
          contactId="test-contact-1"
          initialLinkValues={null}
          {...props}
        />
      </StorageContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    mockGetContact.mockReturnValue({ id: 'test-contact-1', formValues: { name: 'Test' }, linkValues: {} });
  });

  describe('rendering', () => {
    it('should render all link input fields', () => {
      renderLinkForm();

      expect(screen.getByLabelText(/x \(twitter\)/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/linkedin/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/github/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/telegram/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/instagram/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/venmo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^link$/i)).toBeInTheDocument();
    });

    it('should render submit and cancel buttons', () => {
      renderLinkForm();

      expect(screen.getByRole('button', { name: /save links/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should show placeholder text for username fields', () => {
      renderLinkForm();

      const placeholders = screen.getAllByPlaceholderText('snoopdogg');
      expect(placeholders.length).toBeGreaterThan(0);
    });

    it('should show placeholder for custom link field', () => {
      renderLinkForm();

      expect(screen.getByPlaceholderText('https://hmu.world')).toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    it('should update twitter field on input', () => {
      renderLinkForm();

      const twitterInput = screen.getByLabelText(/x \(twitter\)/i);
      fireEvent.change(twitterInput, { target: { name: 'twitter', value: 'testuser' } });

      expect(twitterInput.value).toBe('testuser');
    });

    it('should update linkedin field on input', () => {
      renderLinkForm();

      const linkedinInput = screen.getByLabelText(/linkedin/i);
      fireEvent.change(linkedinInput, { target: { name: 'linkedin', value: 'john-doe' } });

      expect(linkedinInput.value).toBe('john-doe');
    });

    it('should update github field on input', () => {
      renderLinkForm();

      const githubInput = screen.getByLabelText(/github/i);
      fireEvent.change(githubInput, { target: { name: 'github', value: 'octocat' } });

      expect(githubInput.value).toBe('octocat');
    });

    it('should update custom link field on input', () => {
      renderLinkForm();

      const customInput = screen.getByLabelText(/^link$/i);
      fireEvent.change(customInput, { target: { name: 'custom', value: 'https://mysite.com' } });

      expect(customInput.value).toBe('https://mysite.com');
    });
  });

  describe('initial values', () => {
    it('should populate fields with initial values', () => {
      const initialValues = {
        twitter: 'twitteruser',
        linkedin: 'linkedinuser',
        github: 'githubuser',
        telegram: 'telegramuser',
        instagram: 'instagramuser',
        venmo: 'venmouser',
        custom: 'https://custom.com'
      };

      renderLinkForm({ initialLinkValues: initialValues });

      expect(screen.getByLabelText(/x \(twitter\)/i).value).toBe('twitteruser');
      expect(screen.getByLabelText(/linkedin/i).value).toBe('linkedinuser');
      expect(screen.getByLabelText(/github/i).value).toBe('githubuser');
      expect(screen.getByLabelText(/telegram/i).value).toBe('telegramuser');
      expect(screen.getByLabelText(/instagram/i).value).toBe('instagramuser');
      expect(screen.getByLabelText(/venmo/i).value).toBe('venmouser');
      expect(screen.getByLabelText(/^link$/i).value).toBe('https://custom.com');
    });

    it('should handle partial initial values', () => {
      const initialValues = {
        twitter: 'onlytwitter',
        linkedin: '',
        github: '',
        telegram: '',
        instagram: '',
        venmo: '',
        custom: ''
      };

      renderLinkForm({ initialLinkValues: initialValues });

      expect(screen.getByLabelText(/x \(twitter\)/i).value).toBe('onlytwitter');
      expect(screen.getByLabelText(/linkedin/i).value).toBe('');
    });
  });

  describe('drag handles', () => {
    it('should render drag handles for each input', () => {
      renderLinkForm();

      // Each sortable input has a drag handle button
      const dragHandles = screen.getAllByRole('button', { name: '' });
      // Filter to only the drag handles (they have SVG children)
      const actualDragHandles = dragHandles.filter(btn => 
        btn.querySelector('svg') && btn.classList.contains('cursor-grab')
      );
      
      // Should have 7 drag handles (one for each link type)
      expect(actualDragHandles.length).toBe(7);
    });
  });

  describe('form submission', () => {
    it('should call setContact on valid submission', () => {
      mockSetContact.mockReturnValue('test-contact-1');
      renderLinkForm();

      const twitterInput = screen.getByLabelText(/x \(twitter\)/i);
      fireEvent.change(twitterInput, { target: { name: 'twitter', value: 'testuser' } });

      const submitButton = screen.getByRole('button', { name: /save links/i });
      fireEvent.click(submitButton);

      expect(mockSetContact).toHaveBeenCalledWith('test-contact-1', {
        linkValues: expect.objectContaining({
          twitter: 'testuser'
        })
      });
    });

    it('should process URLs to extract usernames', () => {
      mockSetContact.mockReturnValue('test-contact-1');
      renderLinkForm();

      const twitterInput = screen.getByLabelText(/x \(twitter\)/i);
      fireEvent.change(twitterInput, { target: { name: 'twitter', value: 'https://twitter.com/testuser' } });

      const submitButton = screen.getByRole('button', { name: /save links/i });
      fireEvent.click(submitButton);

      expect(mockSetContact).toHaveBeenCalledWith('test-contact-1', {
        linkValues: expect.objectContaining({
          twitter: 'testuser'
        })
      });
    });

    it('should not process custom link URLs', () => {
      mockSetContact.mockReturnValue('test-contact-1');
      renderLinkForm();

      const customInput = screen.getByLabelText(/^link$/i);
      fireEvent.change(customInput, { target: { name: 'custom', value: 'https://mysite.com/page' } });

      const submitButton = screen.getByRole('button', { name: /save links/i });
      fireEvent.click(submitButton);

      expect(mockSetContact).toHaveBeenCalledWith('test-contact-1', {
        linkValues: expect.objectContaining({
          custom: 'https://mysite.com/page'
        })
      });
    });
  });
});
