import { render, screen, fireEvent } from '@testing-library/react';
import MagicMessageForm from '../../components/MagicMessageForm';

describe('MagicMessageForm', () => {
  const defaultProps = {
    onSubmit: jest.fn(),
    onCancel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render email/sms toggle', () => {
      render(<MagicMessageForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /email/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sms/i })).toBeInTheDocument();
    });

    it('should render recipient input', () => {
      render(<MagicMessageForm {...defaultProps} />);
      expect(screen.getByText(/send email to/i)).toBeInTheDocument();
    });

    it('should render message textarea', () => {
      render(<MagicMessageForm {...defaultProps} />);
      expect(screen.getByText('Message')).toBeInTheDocument();
    });

    it('should render save and cancel buttons', () => {
      render(<MagicMessageForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should default to email type', () => {
      render(<MagicMessageForm {...defaultProps} />);
      expect(screen.getByText(/send email to/i)).toBeInTheDocument();
    });
  });

  describe('type switching', () => {
    it('should switch to SMS mode', () => {
      render(<MagicMessageForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /sms/i }));
      expect(screen.getByText(/send sms to/i)).toBeInTheDocument();
    });

    it('should switch back to email mode', () => {
      render(<MagicMessageForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /sms/i }));
      fireEvent.click(screen.getByRole('button', { name: /email/i }));
      expect(screen.getByText(/send email to/i)).toBeInTheDocument();
    });

    it('should show subject field only in email mode', () => {
      render(<MagicMessageForm {...defaultProps} />);
      expect(screen.getByText(/subject/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /sms/i }));
      // Subject field should be hidden (max-h-0)
      const subjectContainer = screen.getByText(/subject/i).closest('div.overflow-hidden');
      expect(subjectContainer).toHaveClass('max-h-0');
    });

    it('should clear recipient when switching type', () => {
      render(<MagicMessageForm {...defaultProps} />);
      const recipientInput = screen.getByPlaceholderText('swag@hmu.world');
      fireEvent.change(recipientInput, { target: { value: 'test@test.com' } });

      fireEvent.click(screen.getByRole('button', { name: /sms/i }));

      const smsInput = screen.getByPlaceholderText('+16789998212');
      expect(smsInput).toHaveValue('');
    });
  });

  describe('validation', () => {
    it('should show error when recipient is empty on submit', () => {
      render(<MagicMessageForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      expect(screen.getByText(/email address is required/i)).toBeInTheDocument();
    });

    it('should show error for invalid email', () => {
      render(<MagicMessageForm {...defaultProps} />);
      const recipientInput = screen.getByPlaceholderText('swag@hmu.world');
      fireEvent.change(recipientInput, { target: { value: 'not-an-email' } });

      const bodyInput = screen.getByPlaceholderText(/see you later/i);
      fireEvent.change(bodyInput, { target: { value: 'test message' } });

      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
    });

    it('should show error when message body is empty', () => {
      render(<MagicMessageForm {...defaultProps} />);
      const recipientInput = screen.getByPlaceholderText('swag@hmu.world');
      fireEvent.change(recipientInput, { target: { value: 'test@test.com' } });

      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      expect(screen.getByText(/message is required/i)).toBeInTheDocument();
    });

    it('should show phone error for SMS with short number', () => {
      render(<MagicMessageForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /sms/i }));

      const recipientInput = screen.getByPlaceholderText('+16789998212');
      fireEvent.change(recipientInput, { target: { value: '123' } });

      const bodyInput = screen.getByPlaceholderText(/see you later/i);
      fireEvent.change(bodyInput, { target: { value: 'test' } });

      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      expect(screen.getByText(/enter a valid phone/i)).toBeInTheDocument();
    });
  });

  describe('successful submission', () => {
    it('should call onSubmit with email data', () => {
      render(<MagicMessageForm {...defaultProps} />);

      fireEvent.change(screen.getByPlaceholderText('swag@hmu.world'), {
        target: { value: 'friend@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText(/see you later/i), {
        target: { value: 'Hello!' }
      });

      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        type: 'email',
        recipient: 'friend@example.com',
        body: 'Hello!'
      });
    });

    it('should include subject in email submission', () => {
      render(<MagicMessageForm {...defaultProps} />);

      fireEvent.change(screen.getByPlaceholderText('swag@hmu.world'), {
        target: { value: 'friend@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('hmu'), {
        target: { value: 'Meeting' }
      });
      fireEvent.change(screen.getByPlaceholderText(/see you later/i), {
        target: { value: 'Hello!' }
      });

      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        type: 'email',
        recipient: 'friend@example.com',
        subject: 'Meeting',
        body: 'Hello!'
      });
    });

    it('should not call onSubmit when validation fails', () => {
      render(<MagicMessageForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /save/i }));
      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('cancel', () => {
    it('should call onCancel when cancel button is clicked', () => {
      render(<MagicMessageForm {...defaultProps} />);
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('initial values', () => {
    it('should populate fields with initial values', () => {
      const initialValues = {
        type: 'sms',
        recipient: '+16789998212',
        body: 'Hey there'
      };
      render(<MagicMessageForm {...defaultProps} initialValues={initialValues} />);

      expect(screen.getByText(/send sms to/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('+16789998212')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Hey there')).toBeInTheDocument();
    });
  });
});
