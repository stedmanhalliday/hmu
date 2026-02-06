import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../../components/ConfirmModal';

describe('ConfirmModal', () => {
  const defaultProps = {
    title: 'Delete Contact',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    children: <p>Are you sure?</p>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the title', () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.getByText('Delete Contact')).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    it('should render confirm and cancel buttons', () => {
      render(<ConfirmModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should use default labels when not provided', () => {
      render(
        <ConfirmModal title="Test" onConfirm={jest.fn()} onCancel={jest.fn()}>
          <p>Content</p>
        </ConfirmModal>
      );
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('should call onConfirm when confirm button is clicked', () => {
      render(<ConfirmModal {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
      expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(<ConfirmModal {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel when backdrop is clicked', () => {
      const { container } = render(<ConfirmModal {...defaultProps} />);
      const backdrop = container.querySelector('.fixed.w-full.h-full');
      fireEvent.click(backdrop);
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('should not call onCancel when modal content is clicked', () => {
      render(<ConfirmModal {...defaultProps} />);
      fireEvent.click(screen.getByText('Are you sure?'));
      expect(defaultProps.onCancel).not.toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('should show loading indicator when isLoading', () => {
      render(<ConfirmModal {...defaultProps} isLoading={true} />);
      expect(screen.getByRole('button', { name: '...' })).toBeInTheDocument();
    });

    it('should disable buttons when loading', () => {
      render(<ConfirmModal {...defaultProps} isLoading={true} />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('destructive styling', () => {
    it('should apply red styling when confirmDestructive is true', () => {
      render(<ConfirmModal {...defaultProps} confirmDestructive={true} />);
      const confirmButton = screen.getByRole('button', { name: /delete/i });
      expect(confirmButton).toHaveClass('bg-red-500');
    });

    it('should apply purple styling when confirmDestructive is false', () => {
      render(<ConfirmModal {...defaultProps} confirmDestructive={false} />);
      const confirmButton = screen.getByRole('button', { name: /delete/i });
      expect(confirmButton).toHaveClass('bg-purple-500');
    });
  });
});
