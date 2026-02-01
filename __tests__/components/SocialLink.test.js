import { render, screen, fireEvent } from '@testing-library/react';
import SocialLink from '../../components/SocialLink';

describe('SocialLink', () => {
  const defaultProps = {
    type: 'twitter',
    displayName: '@johndoe',
    label: 'X (Twitter)',
    url: 'https://x.com/johndoe',
    onClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the social link container', () => {
      const { container } = render(<SocialLink {...defaultProps} />);
      expect(container.querySelector('.socialLink')).toBeInTheDocument();
    });

    it('should render the icon image', () => {
      render(<SocialLink {...defaultProps} />);
      const icon = screen.getByRole('img');
      expect(icon).toBeInTheDocument();
    });

    it('should have correct alt text for icon', () => {
      render(<SocialLink {...defaultProps} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('alt', 'twitter');
    });
  });

  describe('data attributes', () => {
    it('should set data-displayname attribute', () => {
      const { container } = render(<SocialLink {...defaultProps} />);
      const link = container.querySelector('.socialLink');
      expect(link).toHaveAttribute('data-displayname', '@johndoe');
    });

    it('should set data-label attribute', () => {
      const { container } = render(<SocialLink {...defaultProps} />);
      const link = container.querySelector('.socialLink');
      expect(link).toHaveAttribute('data-label', 'X (Twitter)');
    });

    it('should set data-url attribute', () => {
      const { container } = render(<SocialLink {...defaultProps} />);
      const link = container.querySelector('.socialLink');
      expect(link).toHaveAttribute('data-url', 'https://x.com/johndoe');
    });

    it('should set data-type attribute', () => {
      const { container } = render(<SocialLink {...defaultProps} />);
      const link = container.querySelector('.socialLink');
      expect(link).toHaveAttribute('data-type', 'twitter');
    });
  });

  describe('click handling', () => {
    it('should call onClick when clicked', () => {
      const mockOnClick = jest.fn();
      const { container } = render(<SocialLink {...defaultProps} onClick={mockOnClick} />);
      const link = container.querySelector('.socialLink');
      
      fireEvent.click(link);
      
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should pass event to onClick', () => {
      const mockOnClick = jest.fn();
      const { container } = render(<SocialLink {...defaultProps} onClick={mockOnClick} />);
      const link = container.querySelector('.socialLink');
      
      fireEvent.click(link);
      
      expect(mockOnClick).toHaveBeenCalledWith(expect.any(Object));
    });
  });

  describe('different social link types', () => {
    it('should render contact type', () => {
      render(<SocialLink type="contact" displayName="Contact" label="Contact" url="" onClick={jest.fn()} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('alt', 'contact card');
    });

    it('should render linkedin type', () => {
      render(<SocialLink type="linkedin" displayName="@johndoe" label="LinkedIn" url="https://linkedin.com/in/johndoe" onClick={jest.fn()} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('alt', 'linkedin');
    });

    it('should render github type', () => {
      render(<SocialLink type="github" displayName="@johndoe" label="GitHub" url="https://github.com/johndoe" onClick={jest.fn()} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('alt', 'github');
    });

    it('should render telegram type', () => {
      render(<SocialLink type="telegram" displayName="@johndoe" label="Telegram" url="https://t.me/johndoe" onClick={jest.fn()} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('alt', 'telegram');
    });

    it('should render instagram type', () => {
      render(<SocialLink type="instagram" displayName="@johndoe" label="Instagram" url="https://instagram.com/johndoe" onClick={jest.fn()} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('alt', 'instagram');
    });

    it('should render facebook type', () => {
      render(<SocialLink type="facebook" displayName="johndoe" label="Facebook" url="https://facebook.com/johndoe" onClick={jest.fn()} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('alt', 'facebook');
    });

    it('should render snapchat type', () => {
      render(<SocialLink type="snapchat" displayName="@johndoe" label="Snapchat" url="https://snapchat.com/add/johndoe" onClick={jest.fn()} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('alt', 'snapchat');
    });

    it('should render tiktok type', () => {
      render(<SocialLink type="tiktok" displayName="@johndoe" label="TikTok" url="https://tiktok.com/@johndoe" onClick={jest.fn()} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('alt', 'tiktok');
    });

    it('should render youtube type', () => {
      render(<SocialLink type="youtube" displayName="@johndoe" label="YouTube" url="https://youtube.com/@johndoe" onClick={jest.fn()} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('alt', 'youtube');
    });

    it('should render twitch type', () => {
      render(<SocialLink type="twitch" displayName="johndoe" label="Twitch" url="https://twitch.tv/johndoe" onClick={jest.fn()} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('alt', 'twitch');
    });

    it('should render discord type', () => {
      render(<SocialLink type="discord" displayName="abc123" label="Discord" url="https://discord.gg/abc123" onClick={jest.fn()} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('alt', 'discord');
    });

    it('should render venmo type', () => {
      render(<SocialLink type="venmo" displayName="@johndoe" label="Venmo" url="https://venmo.com/johndoe" onClick={jest.fn()} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('alt', 'venmo');
    });

    it('should render custom type with fallback', () => {
      render(<SocialLink type="custom" displayName="example.com" label="Link" url="https://example.com" onClick={jest.fn()} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('alt', 'link');
    });
  });

  describe('styling', () => {
    it('should apply custom className', () => {
      const { container } = render(<SocialLink {...defaultProps} className="custom-class" />);
      const link = container.querySelector('.socialLink');
      expect(link).toHaveClass('custom-class');
    });

    it('should have rounded-full class', () => {
      const { container } = render(<SocialLink {...defaultProps} />);
      const link = container.querySelector('.socialLink');
      expect(link).toHaveClass('rounded-full');
    });

    it('should have shadow-md class', () => {
      const { container } = render(<SocialLink {...defaultProps} />);
      const link = container.querySelector('.socialLink');
      expect(link).toHaveClass('shadow-md');
    });
  });

  describe('icon pointer events', () => {
    it('should have pointer-events-none on icon to prevent click interference', () => {
      render(<SocialLink {...defaultProps} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveClass('pointer-events-none');
    });
  });
});
