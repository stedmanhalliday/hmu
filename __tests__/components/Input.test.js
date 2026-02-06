import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../../components/Input';

describe('Input', () => {
  const defaultProps = {
    name: 'email',
    label: 'Email',
    type: 'email',
    value: '',
    placeholder: 'test@example.com',
    onChange: jest.fn(),
    onBlur: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render label text', () => {
      render(<Input {...defaultProps} />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should render input with correct type', () => {
      render(<Input {...defaultProps} />);
      expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
    });

    it('should render placeholder text', () => {
      render(<Input {...defaultProps} />);
      expect(screen.getByPlaceholderText('test@example.com')).toBeInTheDocument();
    });

    it('should render current value', () => {
      render(<Input {...defaultProps} value="hello@test.com" />);
      expect(screen.getByRole('textbox')).toHaveValue('hello@test.com');
    });

    it('should disable autocorrect and spellcheck', () => {
      render(<Input {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('autocorrect', 'off');
      expect(input).toHaveAttribute('autocapitalize', 'off');
      expect(input).toHaveAttribute('spellcheck', 'false');
    });
  });

  describe('interactions', () => {
    it('should call onChange when value changes', () => {
      render(<Input {...defaultProps} />);
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new' } });
      expect(defaultProps.onChange).toHaveBeenCalled();
    });

    it('should call onBlur when input loses focus', () => {
      render(<Input {...defaultProps} />);
      fireEvent.blur(screen.getByRole('textbox'));
      expect(defaultProps.onBlur).toHaveBeenCalled();
    });
  });

  describe('error state', () => {
    it('should show error message when error is provided', () => {
      render(<Input {...defaultProps} error="Invalid email" />);
      expect(screen.getByText('Invalid email')).toBeInTheDocument();
    });

    it('should not show error when error is empty string', () => {
      render(<Input {...defaultProps} error="" />);
      expect(screen.queryByText('Invalid email')).not.toBeInTheDocument();
    });

    it('should apply error border styling when error exists', () => {
      render(<Input {...defaultProps} error="Required" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-400');
    });

    it('should apply normal border when no error', () => {
      render(<Input {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-slate-300');
    });
  });

  describe('required field', () => {
    it('should set required attribute when required is true', () => {
      render(<Input {...defaultProps} required={true} />);
      expect(screen.getByRole('textbox')).toBeRequired();
    });

    it('should not be required by default', () => {
      render(<Input {...defaultProps} />);
      expect(screen.getByRole('textbox')).not.toBeRequired();
    });
  });
});
