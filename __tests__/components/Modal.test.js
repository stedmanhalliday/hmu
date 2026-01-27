import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../../components/Modal';

describe('Modal', () => {
  const mockDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the modal with title', () => {
      render(
        <Modal title="Test Title" dismiss={mockDismiss}>
          <p>Modal content</p>
        </Modal>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <Modal title="Title" dismiss={mockDismiss}>
          <p>This is the modal body</p>
          <button>Action button</button>
        </Modal>
      );

      expect(screen.getByText('This is the modal body')).toBeInTheDocument();
      expect(screen.getByText('Action button')).toBeInTheDocument();
    });

    it('should render dismiss button', () => {
      render(
        <Modal title="Title" dismiss={mockDismiss}>
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('should have correct title styling', () => {
      render(
        <Modal title="Styled Title" dismiss={mockDismiss}>
          <p>Content</p>
        </Modal>
      );

      const title = screen.getByText('Styled Title');
      expect(title).toHaveClass('text-xl');
      expect(title).toHaveClass('uppercase');
      expect(title).toHaveClass('tracking-wider');
      expect(title).toHaveClass('text-purple-600');
    });
  });

  describe('dismiss functionality', () => {
    it('should call dismiss callback when dismiss button is clicked', () => {
      render(
        <Modal title="Title" dismiss={mockDismiss}>
          <p>Content</p>
        </Modal>
      );

      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);

      expect(mockDismiss).toHaveBeenCalledTimes(1);
    });

    it('should not call dismiss on other interactions', () => {
      render(
        <Modal title="Title" dismiss={mockDismiss}>
          <button>Other button</button>
        </Modal>
      );

      const otherButton = screen.getByText('Other button');
      fireEvent.click(otherButton);

      expect(mockDismiss).not.toHaveBeenCalled();
    });
  });

  describe('overlay (shim)', () => {
    it('should render overlay background', () => {
      const { container } = render(
        <Modal title="Title" dismiss={mockDismiss}>
          <p>Content</p>
        </Modal>
      );

      const overlay = container.querySelector('.fixed.w-full.h-full');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('modal container', () => {
    it('should have correct positioning classes', () => {
      const { container } = render(
        <Modal title="Title" dismiss={mockDismiss}>
          <p>Content</p>
        </Modal>
      );

      const modalBox = container.querySelector('.bg-white.shadow-2xl');
      expect(modalBox).toBeInTheDocument();
      expect(modalBox).toHaveClass('fixed');
      expect(modalBox).toHaveClass('rounded-xl');
    });

    it('should have max-width constraint', () => {
      const { container } = render(
        <Modal title="Title" dismiss={mockDismiss}>
          <p>Content</p>
        </Modal>
      );

      const modalBox = container.querySelector('.max-w-\\[23rem\\]');
      expect(modalBox).toBeInTheDocument();
    });
  });

  describe('animation effects', () => {
    it('should set initial styles via useEffect', () => {
      const { container } = render(
        <Modal title="Title" dismiss={mockDismiss}>
          <p>Content</p>
        </Modal>
      );

      const overlay = container.querySelector('.fixed.w-full.h-full');
      const modalBox = container.querySelector('.bg-white.shadow-2xl');

      // After useEffect runs, opacity should be 1
      expect(overlay.style.opacity).toBe('1');
      // After useEffect runs, top should be 50%
      expect(modalBox.style.top).toBe('50%');
    });
  });

  describe('content structure', () => {
    it('should have header border separator', () => {
      const { container } = render(
        <Modal title="Title" dismiss={mockDismiss}>
          <p>Content</p>
        </Modal>
      );

      const headerSection = container.querySelector('.border-b.border-purple-200');
      expect(headerSection).toBeInTheDocument();
    });

    it('should render complex children correctly', () => {
      render(
        <Modal title="Complex Modal" dismiss={mockDismiss}>
          <div data-testid="section-1">
            <h2>Section 1</h2>
            <p>Paragraph 1</p>
          </div>
          <div data-testid="section-2">
            <h2>Section 2</h2>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </Modal>
      );

      expect(screen.getByTestId('section-1')).toBeInTheDocument();
      expect(screen.getByTestId('section-2')).toBeInTheDocument();
      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });
});
