import { render, screen } from '@testing-library/react';
import InstallModal from '../../components/InstallModal';

describe('InstallModal', () => {
  const mockDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('iOS instructions', () => {
    it('should show Safari share instruction', () => {
      render(<InstallModal os="ios" dismiss={mockDismiss} />);
      expect(screen.getByText(/share/i)).toBeInTheDocument();
    });

    it('should show Add to home screen instruction', () => {
      render(<InstallModal os="ios" dismiss={mockDismiss} />);
      expect(screen.getByText(/add to home screen/i)).toBeInTheDocument();
    });

    it('should show troubleshooting help', () => {
      render(<InstallModal os="ios" dismiss={mockDismiss} />);
      expect(screen.getByText(/having trouble/i)).toBeInTheDocument();
    });
  });

  describe('Android instructions', () => {
    it('should show Chrome instruction', () => {
      render(<InstallModal os="android" dismiss={mockDismiss} />);
      expect(screen.getByText(/open this page in chrome/i)).toBeInTheDocument();
    });

    it('should show install app button instruction', () => {
      render(<InstallModal os="android" dismiss={mockDismiss} />);
      expect(screen.getByText(/install app/i)).toBeInTheDocument();
    });

    it('should mention latest version of Chrome (typo was fixed)', () => {
      render(<InstallModal os="android" dismiss={mockDismiss} />);
      expect(screen.getByText(/latest version of chrome/i)).toBeInTheDocument();
    });
  });

  describe('generic instructions (no OS detected)', () => {
    it('should show cross-platform message', () => {
      render(<InstallModal os={null} dismiss={mockDismiss} />);
      expect(screen.getByText(/supports iOS and Android/i)).toBeInTheDocument();
    });

    it('should mention scanning QR code', () => {
      render(<InstallModal os={null} dismiss={mockDismiss} />);
      expect(screen.getByText(/scan the QR code/i)).toBeInTheDocument();
    });
  });

  describe('modal wrapper', () => {
    it('should render with Install title', () => {
      render(<InstallModal os={null} dismiss={mockDismiss} />);
      expect(screen.getByText('Install hmu.world')).toBeInTheDocument();
    });

    it('should have dismiss button', () => {
      render(<InstallModal os={null} dismiss={mockDismiss} />);
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });
  });
});
