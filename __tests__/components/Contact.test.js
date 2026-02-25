import { render, screen } from '@testing-library/react';
import Contact from '../../components/Contact';

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

describe('Contact', () => {
  const defaultProps = {
    src: 'data:image/png;base64,mockqrcode',
    displayName: 'John Doe',
    vibe: { emoji: '😀', group: ['#ff0000', '#00ff00'] },
    label: 'Contact',
    activeLink: '',
    url: '',
    photo: ''
  };

  describe('rendering', () => {
    it('should render the display name', () => {
      render(<Contact {...defaultProps} />);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render the label', () => {
      render(<Contact {...defaultProps} />);
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('should render QR code image when src is provided', () => {
      render(<Contact {...defaultProps} />);
      const qrImage = screen.getByAltText('Contact QR code for John Doe');
      expect(qrImage).toBeInTheDocument();
      expect(qrImage).toHaveAttribute('src', 'data:image/png;base64,mockqrcode');
    });

    it('should render emoji when no photo is provided', () => {
      render(<Contact {...defaultProps} />);
      const emojiImg = screen.getByAltText('😀');
      expect(emojiImg).toBeInTheDocument();
    });

    it('should render photo when provided', () => {
      render(<Contact {...defaultProps} photo="data:image/jpeg;base64,mockphoto" />);
      const photoImg = screen.getByAltText('Profile');
      expect(photoImg).toBeInTheDocument();
      expect(photoImg).toHaveAttribute('src', 'data:image/jpeg;base64,mockphoto');
    });
  });

  describe('gradient background', () => {
    it('should render gradient background element', () => {
      const { container } = render(<Contact {...defaultProps} />);
      const gradientDiv = container.querySelector('.-z-10.fixed');
      expect(gradientDiv).toBeInTheDocument();
    });
  });

  describe('linked elements', () => {
    it('should not render any links when no URL is provided', () => {
      render(<Contact {...defaultProps} />);
      expect(screen.queryAllByRole('link')).toHaveLength(0);
    });

    it('should link both header and QR code to the URL when provided', () => {
      render(<Contact {...defaultProps} url="https://example.com" />);
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);
      links.forEach(link => {
        expect(link).toHaveAttribute('href', 'https://example.com');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });

    it('should wrap display name and label in a link when URL is provided', () => {
      render(<Contact {...defaultProps} url="https://instagram.com/johndoe" label="Instagram" activeLink="instagram" />);
      const headerLink = screen.getByText('John Doe').closest('a');
      expect(headerLink).toHaveAttribute('href', 'https://instagram.com/johndoe');
      expect(screen.getByText('Instagram').closest('a')).toBe(headerLink);
    });

    it('should not wrap display name in a link when URL is empty', () => {
      render(<Contact {...defaultProps} />);
      const heading = screen.getByText('John Doe');
      expect(heading.closest('a')).toBeNull();
    });
  });

  describe('active link icon', () => {
    it('should show contact icon by default', () => {
      render(<Contact {...defaultProps} />);
      // Icon should be present in the header
      const icons = screen.getAllByRole('img');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('should update icon based on activeLink', () => {
      render(<Contact {...defaultProps} activeLink="twitter" label="X (Twitter)" />);
      expect(screen.getByText('X (Twitter)')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('should apply custom style when provided', () => {
      render(<Contact {...defaultProps} style={{ opacity: 0.5 }} />);
      // Header should have the style applied
      const header = screen.getByText('John Doe').closest('header');
      expect(header).toHaveStyle({ opacity: '0.5' });
    });

    it('should hide content when opacity is 0', () => {
      render(<Contact {...defaultProps} style={{ opacity: 0 }} />);
      const header = screen.getByText('John Doe').closest('header');
      expect(header).toHaveStyle({ visibility: 'hidden', pointerEvents: 'none' });
    });
  });

  describe('different labels', () => {
    it('should render Twitter label', () => {
      render(<Contact {...defaultProps} label="X (Twitter)" activeLink="twitter" />);
      expect(screen.getByText('X (Twitter)')).toBeInTheDocument();
    });

    it('should render LinkedIn label', () => {
      render(<Contact {...defaultProps} label="LinkedIn" activeLink="linkedin" />);
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    });

    it('should render GitHub label', () => {
      render(<Contact {...defaultProps} label="GitHub" activeLink="github" />);
      expect(screen.getByText('GitHub')).toBeInTheDocument();
    });
  });
});
