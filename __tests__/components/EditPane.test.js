import { render, screen, fireEvent, act } from '@testing-library/react';
import EditPane from '../../components/EditPane';

describe('EditPane', () => {
  const defaultProps = {
    editContact: jest.fn(),
    editLinks: jest.fn(),
    deleteContact: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('rendering', () => {
    it('should render edit contact button with label', () => {
      render(<EditPane {...defaultProps} />);
      expect(screen.getByText('Edit contact')).toBeInTheDocument();
    });

    it('should render edit links button with label', () => {
      render(<EditPane {...defaultProps} />);
      expect(screen.getByText('Edit links')).toBeInTheDocument();
    });

    it('should render delete button with label', () => {
      render(<EditPane {...defaultProps} />);
      expect(screen.getByText('Delete contact')).toBeInTheDocument();
    });

    it('should render three action buttons', () => {
      render(<EditPane {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });
  });

  describe('edit contact action', () => {
    it('should call editContact when Edit contact button is clicked', () => {
      render(<EditPane {...defaultProps} />);
      
      const editContactButton = screen.getByText('Edit contact').closest('div').querySelector('button');
      fireEvent.click(editContactButton);
      
      expect(defaultProps.editContact).toHaveBeenCalledTimes(1);
    });

    it('should have user icon in edit contact button', () => {
      const { container } = render(<EditPane {...defaultProps} />);
      const userIcons = container.querySelectorAll('svg');
      expect(userIcons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('edit links action', () => {
    it('should call editLinks when Edit links button is clicked', () => {
      render(<EditPane {...defaultProps} />);
      
      const editLinksButton = screen.getByText('Edit links').closest('div').querySelector('button');
      fireEvent.click(editLinksButton);
      
      expect(defaultProps.editLinks).toHaveBeenCalledTimes(1);
    });

    it('should have link icon in edit links button', () => {
      const { container } = render(<EditPane {...defaultProps} />);
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('delete action', () => {
    it('should call deleteContact when Delete button is clicked', () => {
      render(<EditPane {...defaultProps} />);
      
      const deleteButton = screen.getByText('Delete contact').closest('div').querySelector('button');
      fireEvent.click(deleteButton);
      
      expect(defaultProps.deleteContact).toHaveBeenCalledTimes(1);
    });

    it('should have red styling for delete section', () => {
      render(<EditPane {...defaultProps} />);
      const deleteLabel = screen.getByText('Delete contact');
      expect(deleteLabel).toHaveClass('text-red-600');
    });

    it('should have trash icon in delete button', () => {
      const { container } = render(<EditPane {...defaultProps} />);
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBe(3);
    });
  });

  describe('animation', () => {
    it('should start with opacity 0', () => {
      const { container } = render(<EditPane {...defaultProps} />);
      const pane = container.firstChild;
      expect(pane).toHaveClass('opacity-0');
    });

    it('should fade in after delay', () => {
      const { container } = render(<EditPane {...defaultProps} />);
      const pane = container.firstChild;
      
      // Initially opacity 0 (via class)
      expect(pane).toHaveClass('opacity-0');
      
      // After 150ms, opacity should be set to 1 via inline style
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      expect(pane.style.opacity).toBe('1');
    });
  });

  describe('layout', () => {
    it('should have fixed positioning', () => {
      const { container } = render(<EditPane {...defaultProps} />);
      const pane = container.firstChild;
      expect(pane).toHaveClass('fixed');
    });

    it('should have inset-0 for full coverage', () => {
      const { container } = render(<EditPane {...defaultProps} />);
      const pane = container.firstChild;
      expect(pane).toHaveClass('inset-0');
    });

    it('should center content vertically', () => {
      const { container } = render(<EditPane {...defaultProps} />);
      const pane = container.firstChild;
      expect(pane).toHaveClass('justify-evenly');
      expect(pane).toHaveClass('items-center');
    });
  });

  describe('button styling', () => {
    it('should have pulse animation on buttons', () => {
      render(<EditPane {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('animate-pulse');
      });
    });

    it('should have rounded-full class on buttons', () => {
      render(<EditPane {...defaultProps} />);
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveClass('rounded-full');
      });
    });
  });
});
