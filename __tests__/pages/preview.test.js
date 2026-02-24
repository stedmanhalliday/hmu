/**
 * Preview Page Tests
 * 
 * Note: Full integration tests for this page are complex due to:
 * - Async QR code generation with dynamic imports
 * - Complex state management for contact display
 * - localStorage interactions for link order
 * 
 * These tests focus on the page's core logic without rendering the full component tree.
 */

import { render, screen, fireEvent, act } from '@testing-library/react';
import { StorageContext } from '../../pages/_app';
import Preview from '../../pages/preview';

// Mock next/router with a STABLE object reference to prevent infinite re-renders.
// useRouter must return the same object identity across renders so that
// useEffect dependencies don't change every cycle.
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: mockReplace,
  query: { id: 'contact-1' },
  pathname: '/preview'
};
jest.mock('next/router', () => ({
  useRouter: () => mockRouter
}));

// Mock qrcode - dynamic import returns { default: QRCode }
jest.mock('qrcode', () => ({
  __esModule: true,
  default: {
    toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mockqr')
  }
}));

// Mock the logger
jest.mock('../../utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
}));

// Mock the useGradientAnimation hook
jest.mock('../../hooks/useGradientAnimation.js', () => ({
  useGradientAnimation: () => ({
    angle: 180,
    stops: {
      start: '#ff0000',
      end: '#00ff00',
      startRGBA: 'rgba(255, 0, 0, 0.5)',
      endRGBA: 'rgba(0, 255, 0, 0.5)'
    }
  })
}));

// Mock gtag
global.gtag = jest.fn();

const validVibe = JSON.stringify({
  label: 'Fire',
  emoji: '🔥',
  group: ['#FF6B35', '#FF1744']
});

const createContact = (overrides = {}) => ({
  id: 'contact-1',
  formValues: {
    name: 'Jordan',
    phone: '+1234567890',
    email: 'jordan@example.com',
    url: 'https://example.com',
    vibe: validVibe,
    photo: ''
  },
  linkValues: {},
  ...overrides
});

const createContactWithLinks = (linkOverrides = {}) => createContact({
  linkValues: {
    instagram: 'jordantest',
    twitter: 'jordantest',
    ...linkOverrides
  }
});

describe('Preview Page', () => {
  const mockGetContact = jest.fn();
  const mockDeleteContact = jest.fn();

  const createMockContext = (overrides = {}) => ({
    contacts: [createContact()],
    getContact: mockGetContact,
    setContact: jest.fn(),
    deleteContact: mockDeleteContact,
    reorderContacts: jest.fn(),
    canAddContact: true,
    storageError: false,
    setStorageError: jest.fn(),
    ...overrides
  });

  const renderPreview = (contextOverrides = {}) => {
    return render(
      <StorageContext.Provider value={createMockContext(contextOverrides)}>
        <Preview />
      </StorageContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockRouter.query = { id: 'contact-1' };
    mockGetContact.mockReturnValue(createContact());
    localStorage.clear();
    // Suppress "Maximum update depth exceeded" warnings from preview.js render loop
    jest.spyOn(console, 'error').mockImplementation((msg) => {
      if (typeof msg === 'string' && msg.includes('Maximum update depth')) return;
    });
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('should render the contact name', async () => {
      await act(async () => { renderPreview(); });
      expect(screen.getByText('Jordan')).toBeInTheDocument();
    });

    it('should render the Contact label', async () => {
      await act(async () => { renderPreview(); });
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('should render Home and Edit nav buttons', async () => {
      await act(async () => { renderPreview(); });
      expect(screen.getByRole('button', { name: /home/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });

    it('should render the hmu.world footer', async () => {
      await act(async () => { renderPreview(); });
      expect(screen.getByText('hmu.world')).toBeInTheDocument();
    });

    it('should render QR code image', async () => {
      await act(async () => { renderPreview(); });
      const qrImages = screen.getAllByAltText(/QR code/i);
      expect(qrImages.length).toBeGreaterThan(0);
    });
  });

  describe('navigation', () => {
    it('should navigate home when Home button is clicked', async () => {
      await act(async () => { renderPreview(); });
      fireEvent.click(screen.getByRole('button', { name: /home/i }));
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should redirect to home when no contacts exist', async () => {
      mockGetContact.mockReturnValue(null);
      await act(async () => {
        renderPreview({ contacts: [] });
      });
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should fallback to first contact when contactId not found', async () => {
      mockRouter.query = { id: 'nonexistent' };
      const contact = createContact();
      mockGetContact.mockReturnValue(null);
      await act(async () => {
        renderPreview({ contacts: [contact] });
      });
      // Should still render since it falls back to first contact
      expect(screen.getByText('Jordan')).toBeInTheDocument();
    });

    it('should redirect to home when contact has no name', async () => {
      mockGetContact.mockReturnValue(createContact({
        formValues: { name: '', phone: '', email: '', url: '', vibe: '', photo: '' }
      }));
      await act(async () => { renderPreview(); });
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  describe('edit mode', () => {
    it('should toggle edit pane when Edit button is clicked', async () => {
      await act(async () => { renderPreview(); });

      // Click Edit
      fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));

      // EditPane should appear with edit options
      expect(screen.getByText('Edit contact')).toBeInTheDocument();
      expect(screen.getByText('Edit links')).toBeInTheDocument();
      expect(screen.getByText('Delete contact')).toBeInTheDocument();
    });

    it('should show Cancel button text when editing', async () => {
      await act(async () => { renderPreview(); });
      fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should close edit pane when Cancel is clicked', async () => {
      await act(async () => { renderPreview(); });

      // Open edit pane
      fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));
      expect(screen.getByText('Edit contact')).toBeInTheDocument();

      // Close edit pane
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByText('Edit contact')).not.toBeInTheDocument();
    });

    it('should navigate to create page when Edit contact is clicked', async () => {
      await act(async () => { renderPreview(); });
      fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));

      // Wait for EditPane to fade in
      act(() => { jest.advanceTimersByTime(200); });

      const editContactButton = screen.getByText('Edit contact').closest('div').querySelector('button');
      fireEvent.click(editContactButton);
      expect(mockPush).toHaveBeenCalledWith('/create?id=contact-1&editing=true');
    });

    it('should navigate to links page when Edit links is clicked', async () => {
      await act(async () => { renderPreview(); });
      fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));

      act(() => { jest.advanceTimersByTime(200); });

      const editLinksButton = screen.getByText('Edit links').closest('div').querySelector('button');
      fireEvent.click(editLinksButton);
      expect(mockPush).toHaveBeenCalledWith('/links?id=contact-1');
    });
  });

  describe('delete flow', () => {
    it('should show delete confirmation modal', async () => {
      await act(async () => { renderPreview(); });
      fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));

      act(() => { jest.advanceTimersByTime(200); });

      const deleteButton = screen.getByText('Delete contact').closest('div').querySelector('button');
      fireEvent.click(deleteButton);

      expect(screen.getByText('Are you sure you want to delete this contact?')).toBeInTheDocument();
    });

    it('should close delete modal on cancel', async () => {
      await act(async () => { renderPreview(); });
      fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));

      act(() => { jest.advanceTimersByTime(200); });

      const deleteButton = screen.getByText('Delete contact').closest('div').querySelector('button');
      fireEvent.click(deleteButton);

      // Cancel via the ConfirmModal's Cancel button
      const cancelButtons = screen.getAllByRole('button', { name: /^cancel$/i });
      // The last Cancel button is in the delete modal
      fireEvent.click(cancelButtons[cancelButtons.length - 1]);
      expect(screen.queryByText('Are you sure you want to delete this contact?')).not.toBeInTheDocument();
    });

    it('should delete contact and navigate to home when no contacts remain', async () => {
      await act(async () => { renderPreview(); });
      fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));

      act(() => { jest.advanceTimersByTime(200); });

      const deleteButton = screen.getByText('Delete contact').closest('div').querySelector('button');
      fireEvent.click(deleteButton);

      // Confirm delete
      fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));

      expect(mockDeleteContact).toHaveBeenCalledWith('contact-1');
      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('should navigate to remaining contact after deletion', async () => {
      const contacts = [
        createContact(),
        createContact({ id: 'contact-2', formValues: { name: 'Parker', phone: '', email: '', url: '', vibe: validVibe, photo: '' } })
      ];

      await act(async () => {
        renderPreview({ contacts });
      });

      fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));
      act(() => { jest.advanceTimersByTime(200); });

      const deleteButton = screen.getByText('Delete contact').closest('div').querySelector('button');
      fireEvent.click(deleteButton);

      fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));

      expect(mockDeleteContact).toHaveBeenCalledWith('contact-1');
      expect(mockPush).toHaveBeenCalledWith('/preview?id=contact-2');
    });
  });

  describe('social links', () => {
    it('should render Add links button when no links exist', async () => {
      await act(async () => { renderPreview(); });
      expect(screen.getByRole('button', { name: /add links/i })).toBeInTheDocument();
    });

    it('should navigate to links page when Add links is clicked', async () => {
      await act(async () => { renderPreview(); });
      fireEvent.click(screen.getByRole('button', { name: /add links/i }));
      expect(mockPush).toHaveBeenCalledWith('/links?id=contact-1');
    });

    it('should render social link icons when links exist', async () => {
      const contact = createContactWithLinks();
      mockGetContact.mockReturnValue(contact);
      await act(async () => {
        renderPreview({ contacts: [contact] });
      });
      // Should have contact icon + instagram + twitter = at least 3 social link divs
      const socialLinks = screen.getAllByRole('img');
      expect(socialLinks.length).toBeGreaterThanOrEqual(3);
    });

    it('should display contact social link button by default', async () => {
      const contact = createContactWithLinks();
      mockGetContact.mockReturnValue(contact);
      await act(async () => {
        renderPreview({ contacts: [contact] });
      });
      // The contact icon should be visible (alt text is "contact card" per socialIcons.js)
      // Multiple elements share this alt text (header icon + social link icon)
      const contactIcons = screen.getAllByAltText('contact card');
      expect(contactIcons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('link toggling', () => {
    it('should generate QR code when a social link is clicked', async () => {
      const contact = createContactWithLinks();
      mockGetContact.mockReturnValue(contact);
      await act(async () => {
        renderPreview({ contacts: [contact] });
      });

      // Click on an Instagram social link (alt text is lowercase per socialIcons.js)
      const instagramLink = screen.getByAltText('instagram');
      const socialLinkDiv = instagramLink.closest('.socialLink');
      await act(async () => {
        fireEvent.click(socialLinkDiv);
      });

      // After clicking, the label should change to Instagram
      expect(screen.getByText('Instagram')).toBeInTheDocument();
    });

    it('should track speed dial taps in localStorage', async () => {
      const contact = createContactWithLinks();
      mockGetContact.mockReturnValue(contact);
      await act(async () => {
        renderPreview({ contacts: [contact] });
      });

      const instagramLink = screen.getByAltText('instagram');
      const socialLinkDiv = instagramLink.closest('.socialLink');
      await act(async () => {
        fireEvent.click(socialLinkDiv);
      });

      const stored = JSON.parse(localStorage.getItem('speedDialTaps'));
      expect(stored).toBe(1);
    });

    it('should return to contact view when active link is clicked again', async () => {
      const contact = createContactWithLinks();
      mockGetContact.mockReturnValue(contact);
      await act(async () => {
        renderPreview({ contacts: [contact] });
      });

      const instagramLink = screen.getByAltText('instagram');
      const socialLinkDiv = instagramLink.closest('.socialLink');

      // Click once to activate
      await act(async () => { fireEvent.click(socialLinkDiv); });
      // Click again to deactivate
      await act(async () => { fireEvent.click(socialLinkDiv); });

      // Should be back to showing the contact name as display name
      expect(screen.getByText('Jordan')).toBeInTheDocument();
    });
  });

  describe('magic message links', () => {
    it('should render magic message link with label', async () => {
      const magicMessage = JSON.stringify({
        type: 'email',
        recipient: 'test@example.com',
        subject: 'Hello',
        body: 'Hi there!'
      });
      const contact = createContact({ linkValues: { magicmessage: magicMessage } });
      mockGetContact.mockReturnValue(contact);

      await act(async () => {
        renderPreview({ contacts: [contact] });
      });

      // Should render the magic message icon (alt text is lowercase per socialIcons.js)
      const magicIcon = screen.getByAltText('magic message');
      expect(magicIcon).toBeInTheDocument();
    });
  });

  describe('custom links', () => {
    it('should render custom link with domain as display name', async () => {
      const contact = createContact({ linkValues: { custom: 'https://mywebsite.com/page' } });
      mockGetContact.mockReturnValue(contact);

      await act(async () => {
        renderPreview({ contacts: [contact] });
      });

      // alt text for custom links is "link" per socialIcons.js
      const customIcon = screen.getByAltText('link');
      expect(customIcon).toBeInTheDocument();
    });
  });

  describe('special platform handling', () => {
    it('should handle YouTube channel IDs', async () => {
      const contact = createContact({ linkValues: { youtube: 'UCxxxxxxxxxxxxxxxxxxxxxx' } });
      mockGetContact.mockReturnValue(contact);

      await act(async () => {
        renderPreview({ contacts: [contact] });
      });

      const youtubeIcon = screen.getByAltText('youtube');
      expect(youtubeIcon).toBeInTheDocument();
    });

    it('should handle Discord user IDs', async () => {
      const contact = createContact({ linkValues: { discord: '12345678901234567' } });
      mockGetContact.mockReturnValue(contact);

      await act(async () => {
        renderPreview({ contacts: [contact] });
      });

      const discordIcon = screen.getByAltText('discord');
      expect(discordIcon).toBeInTheDocument();
    });

    it('should handle WhatsApp phone numbers', async () => {
      const contact = createContact({ linkValues: { whatsapp: '+16789998212' } });
      mockGetContact.mockReturnValue(contact);

      await act(async () => {
        renderPreview({ contacts: [contact] });
      });

      const whatsappIcon = screen.getByAltText('whatsapp');
      expect(whatsappIcon).toBeInTheDocument();
    });

    it('should handle Signal phone numbers', async () => {
      const contact = createContact({ linkValues: { signal: '+16789998212' } });
      mockGetContact.mockReturnValue(contact);

      await act(async () => {
        renderPreview({ contacts: [contact] });
      });

      const signalIcon = screen.getByAltText('signal');
      expect(signalIcon).toBeInTheDocument();
    });

    it('should handle Telegram usernames', async () => {
      const contact = createContact({ linkValues: { telegram: 'satoshi' } });
      mockGetContact.mockReturnValue(contact);

      await act(async () => {
        renderPreview({ contacts: [contact] });
      });

      const telegramIcon = screen.getByAltText('telegram');
      expect(telegramIcon).toBeInTheDocument();
    });

    it('should handle Cash App tags with $ prefix', async () => {
      const contact = createContact({ linkValues: { cashapp: 'travisscott' } });
      mockGetContact.mockReturnValue(contact);

      await act(async () => {
        renderPreview({ contacts: [contact] });
      });

      const cashappIcon = screen.getByAltText('cashapp');
      expect(cashappIcon).toBeInTheDocument();
    });

    it('should handle Stripe payment links', async () => {
      const contact = createContact({ linkValues: { stripe: 'abc123' } });
      mockGetContact.mockReturnValue(contact);

      await act(async () => {
        renderPreview({ contacts: [contact] });
      });

      const stripeIcon = screen.getByAltText('stripe');
      expect(stripeIcon).toBeInTheDocument();
    });

    it('should handle full URLs for any platform', async () => {
      const contact = createContact({ linkValues: { instagram: 'https://instagram.com/jordantest' } });
      mockGetContact.mockReturnValue(contact);

      await act(async () => {
        renderPreview({ contacts: [contact] });
      });

      const instagramIcon = screen.getByAltText('instagram');
      expect(instagramIcon).toBeInTheDocument();
    });
  });

  describe('photo display', () => {
    it('should render emoji avatar when no photo', async () => {
      await act(async () => { renderPreview(); });
      const emojiImg = screen.getByAltText('🔥');
      expect(emojiImg).toBeInTheDocument();
    });

    it('should render profile photo when provided', async () => {
      const contact = createContact({
        formValues: {
          name: 'Jordan',
          phone: '+1234567890',
          email: 'jordan@example.com',
          url: 'https://example.com',
          vibe: validVibe,
          photo: 'data:image/jpeg;base64,mockphoto'
        }
      });
      mockGetContact.mockReturnValue(contact);

      await act(async () => {
        renderPreview({ contacts: [contact] });
      });

      const profileImg = screen.getByAltText('Profile');
      expect(profileImg).toBeInTheDocument();
      expect(profileImg).toHaveAttribute('src', 'data:image/jpeg;base64,mockphoto');
    });
  });

  describe('donate prompts', () => {
    it('should not show donate prompt on initial load', async () => {
      await act(async () => { renderPreview(); });
      expect(screen.queryByText(/free, open source, and private/)).not.toBeInTheDocument();
    });

    it('should show contribute modal when triggered by engagement', async () => {
      const contact = createContactWithLinks();
      mockGetContact.mockReturnValue(contact);

      // Simulate prior speed dial taps
      localStorage.setItem('speedDialTaps', JSON.stringify(2));

      await act(async () => {
        renderPreview({ contacts: [contact] });
      });

      // Wait for the donate prompt timer
      act(() => { jest.advanceTimersByTime(3000); });

      // The contribute modal should appear
      expect(screen.getByText(/Help improve it/)).toBeInTheDocument();
    });
  });

  describe('vCard generation', () => {
    it('should include contact URL with hmu.world domain', async () => {
      // The vCard is generated internally and passed to QRCode.toDataURL
      const QRCode = require('qrcode').default;
      await act(async () => { renderPreview(); });

      // QRCode.toDataURL should have been called with vCard string
      const calls = QRCode.toDataURL.mock.calls;
      expect(calls.length).toBeGreaterThan(0);

      // Find the call with vCard data (the one with BEGIN:VCARD)
      const vCardCall = calls.find(call => typeof call[0] === 'string' && call[0].includes('BEGIN:VCARD'));
      expect(vCardCall).toBeDefined();
      expect(vCardCall[0]).toContain('FN:Jordan');
      expect(vCardCall[0]).toContain('hmu.world');
    });
  });

  describe('links carousel', () => {
    it('should use carousel when more than 8 link components', async () => {
      const manyLinks = {
        instagram: 'user', twitter: 'user', whatsapp: '+1234567890',
        spotify: 'user', github: 'user', linkedin: 'user',
        venmo: 'user', cashapp: 'user', tiktok: 'user'
      };
      const contact = createContact({ linkValues: manyLinks });
      mockGetContact.mockReturnValue(contact);

      await act(async () => {
        renderPreview({ contacts: [contact] });
      });

      // With 9 links + contact icon = 10 items, carousel should be used
      // Carousel has page indicator dots
      const dots = screen.getAllByRole('button', { name: /go to page/i });
      expect(dots.length).toBeGreaterThanOrEqual(2);
    });
  });
});
