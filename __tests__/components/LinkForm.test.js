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
    it('should show empty state when no links are populated', () => {
      renderLinkForm();

      expect(screen.getByText(/tap a button below to add your first link/i)).toBeInTheDocument();
    });

    it('should show platform picker with add buttons', () => {
      renderLinkForm();

      expect(screen.getByRole('button', { name: /add instagram/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add x \(twitter\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add linkedin/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add github/i })).toBeInTheDocument();
    });

    it('should show custom link button in picker', () => {
      renderLinkForm();

      expect(screen.getByRole('button', { name: /custom link/i })).toBeInTheDocument();
    });

    it('should render only populated link inputs', () => {
      const initialValues = {
        twitter: 'twitteruser',
        instagram: 'instagramuser',
      };

      renderLinkForm({ initialLinkValues: initialValues });

      // Populated links should show inputs
      expect(screen.getByRole('textbox', { name: /x \(twitter\)/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /instagram/i })).toBeInTheDocument();

      // Empty links should not show inputs
      expect(screen.queryByRole('textbox', { name: /linkedin/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: /github/i })).not.toBeInTheDocument();
    });

    it('should render submit and cancel buttons', () => {
      renderLinkForm();

      expect(screen.getByRole('button', { name: /save links/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('adding and removing links', () => {
    it('should add a link when platform icon is tapped', () => {
      renderLinkForm();

      // No instagram input initially
      expect(screen.queryByRole('textbox', { name: /instagram/i })).not.toBeInTheDocument();

      // Click the add button
      fireEvent.click(screen.getByRole('button', { name: /add instagram/i }));

      // Input should appear
      expect(screen.getByRole('textbox', { name: /instagram/i })).toBeInTheDocument();
      // Add button should disappear from picker
      expect(screen.queryByRole('button', { name: /add instagram/i })).not.toBeInTheDocument();
    });

    it('should add custom link when custom button is tapped', () => {
      renderLinkForm();

      fireEvent.click(screen.getByRole('button', { name: /custom link/i }));

      expect(screen.getByRole('textbox', { name: /^custom link$/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^custom link$/i })).not.toBeInTheDocument();
    });

    it('should remove a link and return it to picker', () => {
      const initialValues = { instagram: 'testuser' };
      renderLinkForm({ initialLinkValues: initialValues });

      // Instagram input should be visible
      expect(screen.getByRole('textbox', { name: /instagram/i })).toBeInTheDocument();

      // Click the remove button
      fireEvent.click(screen.getByRole('button', { name: /remove instagram/i }));

      // Input should be gone
      expect(screen.queryByRole('textbox', { name: /instagram/i })).not.toBeInTheDocument();
      // Platform should reappear in picker
      expect(screen.getByRole('button', { name: /add instagram/i })).toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    it('should update field value on input', () => {
      renderLinkForm();

      // Add twitter first
      fireEvent.click(screen.getByRole('button', { name: /add x \(twitter\)/i }));

      const twitterInput = screen.getByRole('textbox', { name: /x \(twitter\)/i });
      fireEvent.change(twitterInput, { target: { name: 'twitter', value: 'testuser' } });

      expect(twitterInput.value).toBe('testuser');
    });

    it('should update custom link field on input', () => {
      renderLinkForm();

      fireEvent.click(screen.getByRole('button', { name: /custom link/i }));

      const customInput = screen.getByRole('textbox', { name: /^custom link$/i });
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
        instagram: 'instagramuser',
        facebook: 'facebookuser',
        snapchat: 'snapchatuser',
        tiktok: 'tiktokuser',
        youtube: 'youtubeuser',
        twitch: 'twitchuser',
        telegram: 'telegramuser',
        discord: 'discordcode',
        venmo: 'venmouser',
        custom: 'https://custom.com'
      };

      renderLinkForm({ initialLinkValues: initialValues });

      expect(screen.getByRole('textbox', { name: /x \(twitter\)/i }).value).toBe('twitteruser');
      expect(screen.getByRole('textbox', { name: /linkedin/i }).value).toBe('linkedinuser');
      expect(screen.getByRole('textbox', { name: /github/i }).value).toBe('githubuser');
      expect(screen.getByRole('textbox', { name: /instagram/i }).value).toBe('instagramuser');
      expect(screen.getByRole('textbox', { name: /facebook/i }).value).toBe('facebookuser');
      expect(screen.getByRole('textbox', { name: /snapchat/i }).value).toBe('snapchatuser');
      expect(screen.getByRole('textbox', { name: /tiktok/i }).value).toBe('tiktokuser');
      expect(screen.getByRole('textbox', { name: /youtube/i }).value).toBe('youtubeuser');
      expect(screen.getByRole('textbox', { name: /twitch/i }).value).toBe('twitchuser');
      expect(screen.getByRole('textbox', { name: /telegram/i }).value).toBe('telegramuser');
      expect(screen.getByRole('textbox', { name: /discord/i }).value).toBe('discordcode');
      expect(screen.getByRole('textbox', { name: /venmo/i }).value).toBe('venmouser');
      expect(screen.getByRole('textbox', { name: /^custom link$/i }).value).toBe('https://custom.com');
    });

    it('should only show inputs for populated initial values', () => {
      const initialValues = {
        twitter: 'onlytwitter',
      };

      renderLinkForm({ initialLinkValues: initialValues });

      // Twitter should have an input with value
      expect(screen.getByRole('textbox', { name: /x \(twitter\)/i }).value).toBe('onlytwitter');
      // LinkedIn should be in the picker, not as an input
      expect(screen.queryByRole('textbox', { name: /linkedin/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add linkedin/i })).toBeInTheDocument();
    });
  });

  describe('drag handles', () => {
    it('should render drag handles only for active links', () => {
      const initialValues = {
        instagram: 'instagramuser',
        twitter: 'twitteruser',
        github: 'githubuser',
      };

      renderLinkForm({ initialLinkValues: initialValues });

      const dragHandles = screen.getAllByRole('button', { name: /reorder/i });
      expect(dragHandles.length).toBe(3);
    });
  });

  describe('form submission', () => {
    it('should call setContact on valid submission', () => {
      mockSetContact.mockReturnValue('test-contact-1');
      renderLinkForm();

      // Add twitter and type a value
      fireEvent.click(screen.getByRole('button', { name: /add x \(twitter\)/i }));
      const twitterInput = screen.getByRole('textbox', { name: /x \(twitter\)/i });
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

      fireEvent.click(screen.getByRole('button', { name: /add x \(twitter\)/i }));
      const twitterInput = screen.getByRole('textbox', { name: /x \(twitter\)/i });
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

      fireEvent.click(screen.getByRole('button', { name: /custom link/i }));
      const customInput = screen.getByRole('textbox', { name: /^custom link$/i });
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
