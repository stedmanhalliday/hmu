import { render, screen, fireEvent } from '@testing-library/react';
import { StorageContext } from '../../pages/_app';
import Form from '../../components/Form';

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

describe('Form', () => {
  const mockSetContact = jest.fn();
  const mockContextValue = {
    setContact: mockSetContact,
    contacts: [],
    getContact: jest.fn(),
    deleteContact: jest.fn(),
    reorderContacts: jest.fn(),
    canAddContact: true,
    storageError: false,
    setStorageError: jest.fn()
  };

  const renderForm = (props = {}) => {
    return render(
      <StorageContext.Provider value={mockContextValue}>
        <Form
          contactId="new"
          initialFormValues={null}
          handleChange={jest.fn()}
          onPhotoChange={jest.fn()}
          {...props}
        />
      </StorageContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all form fields', () => {
      renderForm();

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
      expect(screen.getByText(/theme/i)).toBeInTheDocument();
      expect(screen.getByText('Photo')).toBeInTheDocument();
    });

    it('should render submit and cancel buttons', () => {
      renderForm();

      expect(screen.getByRole('button', { name: /save contact/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should show placeholder text in inputs', () => {
      renderForm();

      expect(screen.getByPlaceholderText('Soulja Boy')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('+16789998212')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('swag@hmu.world')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('https://hmu.world')).toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    it('should update name field on input', () => {
      renderForm();

      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.change(nameInput, { target: { name: 'name', value: 'John Doe' } });

      expect(nameInput.value).toBe('John Doe');
    });

    it('should update phone field on input', () => {
      renderForm();

      const phoneInput = screen.getByLabelText(/phone/i);
      fireEvent.change(phoneInput, { target: { name: 'phone', value: '+1234567890' } });

      expect(phoneInput.value).toBe('+1234567890');
    });

    it('should update email field on input', () => {
      renderForm();

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should call onVibeChange when vibe is selected', () => {
      const mockVibeChange = jest.fn();
      renderForm({ handleChange: mockVibeChange });

      const vibeSelect = screen.getByRole('combobox');
      // Select first non-disabled option
      const options = vibeSelect.querySelectorAll('option:not([disabled])');
      if (options.length > 0) {
        fireEvent.change(vibeSelect, { target: { name: 'vibe', value: options[0].value } });
        expect(mockVibeChange).toHaveBeenCalled();
      }
    });
  });

  describe('validation', () => {
    it('should show error when name is empty on blur', () => {
      renderForm();

      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.blur(nameInput);

      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    it('should show error for invalid email', () => {
      renderForm();

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.change(emailInput, { target: { name: 'email', value: 'invalid-email' } });
      fireEvent.blur(emailInput);

      expect(screen.getByText('Enter a valid email address')).toBeInTheDocument();
    });

    it('should show error for invalid phone number', () => {
      renderForm();

      const phoneInput = screen.getByLabelText(/phone/i);
      fireEvent.change(phoneInput, { target: { name: 'phone', value: '123' } });
      fireEvent.blur(phoneInput);

      expect(screen.getByText('Enter a valid phone number')).toBeInTheDocument();
    });

    it('should clear error when user starts typing', () => {
      renderForm();

      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.blur(nameInput);
      expect(screen.getByText('Name is required')).toBeInTheDocument();

      fireEvent.change(nameInput, { target: { name: 'name', value: 'J' } });
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });
  });

  describe('initial values', () => {
    it('should populate fields with initial values', () => {
      const initialValues = {
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        url: 'https://example.com',
        vibe: '',
        photo: ''
      };

      renderForm({ initialFormValues: initialValues });

      expect(screen.getByLabelText(/name/i).value).toBe('John Doe');
      expect(screen.getByLabelText(/phone/i).value).toBe('+1234567890');
      expect(screen.getByLabelText(/email/i).value).toBe('john@example.com');
      expect(screen.getByLabelText(/website/i).value).toBe('https://example.com');
    });
  });

  describe('photo handling', () => {
    it('should show "Add photo" button when no photo', () => {
      renderForm();

      expect(screen.getByRole('button', { name: /add photo/i })).toBeInTheDocument();
    });

    it('should show "Change" button when photo exists', () => {
      const initialValues = {
        name: 'Test',
        phone: '',
        email: '',
        url: '',
        vibe: '',
        photo: 'data:image/jpeg;base64,/9j/4AAQ'
      };

      renderForm({ initialFormValues: initialValues });

      expect(screen.getByRole('button', { name: /change/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
    });
  });
});
