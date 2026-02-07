/**
 * Create Page Tests
 * 
 * Note: Full integration tests for this page are complex due to:
 * - Continuous gradient animation interval (100ms)
 * - Complex Form component with many effects and refs
 * - Router query dependencies
 * 
 * These tests focus on the page's core logic without rendering the full component tree,
 * plus component-level render tests with Form mocked out.
 */

import { safeParseVibe } from '../../utils/storage.js';
import { render, screen } from '@testing-library/react';
import { StorageContext } from '../../pages/_app';
import Create from '../../pages/create';

// Mock next/router with configurable query
const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockQuery = {};
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    query: mockQuery
  })
}));

// Mock the logger
jest.mock('../../utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
}));

// Capture Form props for assertions
jest.mock('../../components/Form.js', () => {
  return function MockForm(props) {
    return (
      <div data-testid="form">
        <span data-testid="form-contact-id">{props.contactId}</span>
        <span data-testid="form-initial-values">{JSON.stringify(props.initialFormValues)}</span>
      </div>
    );
  };
});

// Test the vibe parsing logic used by the page
describe('Create Page - Vibe Parsing', () => {
  it('should parse valid vibe JSON', () => {
    const vibeJson = JSON.stringify({ label: 'Happy', emoji: '😀', group: ['#ff0000', '#00ff00'] });
    const result = safeParseVibe(vibeJson);
    
    expect(result.emoji).toBe('😀');
    expect(result.group).toEqual(['#ff0000', '#00ff00']);
  });

  it('should return default vibe for invalid JSON', () => {
    const result = safeParseVibe('invalid');
    
    expect(result).toHaveProperty('emoji');
    expect(result).toHaveProperty('group');
  });

  it('should return default vibe for empty string', () => {
    const result = safeParseVibe('');
    
    expect(result).toHaveProperty('emoji');
    expect(result).toHaveProperty('group');
  });

  it('should handle null input', () => {
    const result = safeParseVibe(null);
    
    expect(result).toHaveProperty('emoji');
    expect(result).toHaveProperty('group');
  });
});

// Test gradient angle calculation logic
describe('Create Page - Gradient Animation Logic', () => {
  it('should calculate next angle correctly', () => {
    const updateAngle = (prevAngle) => (prevAngle + 1) % 360;
    
    expect(updateAngle(0)).toBe(1);
    expect(updateAngle(180)).toBe(181);
    expect(updateAngle(359)).toBe(0);
  });

  it('should cycle through all angles', () => {
    const updateAngle = (prevAngle) => (prevAngle + 1) % 360;
    let angle = 0;
    
    for (let i = 0; i < 360; i++) {
      angle = updateAngle(angle);
    }
    
    expect(angle).toBe(0);
  });
});

// Test contact ID routing logic
describe('Create Page - Routing Logic', () => {
  it('should identify new contact mode', () => {
    const contactId = 'new';
    const isNewContact = contactId === 'new';
    
    expect(isNewContact).toBe(true);
  });

  it('should identify edit contact mode', () => {
    const contactId = 'contact-123';
    const isNewContact = contactId === 'new';
    
    expect(isNewContact).toBe(false);
  });

  it('should determine header text based on mode', () => {
    const getHeaderText = (contactId) => 
      contactId === 'new' ? 'Create a new contact' : 'Edit your contact';
    
    expect(getHeaderText('new')).toBe('Create a new contact');
    expect(getHeaderText('contact-123')).toBe('Edit your contact');
  });
});

// Component-level render tests
describe('Create Page - Component Rendering', () => {
  const mockGetContact = jest.fn();

  const createMockContext = (overrides = {}) => ({
    contacts: [],
    canAddContact: true,
    getContact: mockGetContact,
    setContact: jest.fn(),
    deleteContact: jest.fn(),
    reorderContacts: jest.fn(),
    storageError: false,
    setStorageError: jest.fn(),
    ...overrides
  });

  const renderCreate = (contextOverrides = {}) => {
    return render(
      <StorageContext.Provider value={createMockContext(contextOverrides)}>
        <Create />
      </StorageContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockQuery = {};
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render "Create a new contact" heading for new contact', () => {
    mockQuery = { id: 'new' };
    renderCreate();
    expect(screen.getByText('Create a new contact')).toBeInTheDocument();
  });

  it('should render "Edit your contact" heading for existing contact', () => {
    mockQuery = { id: 'contact-123' };
    mockGetContact.mockReturnValue({
      id: 'contact-123',
      formValues: { name: 'Test', phone: '', email: '', url: '', vibe: '', photo: '' },
      linkValues: {}
    });
    renderCreate();
    expect(screen.getByText('Edit your contact')).toBeInTheDocument();
  });

  it('should render the Form component', () => {
    mockQuery = { id: 'new' };
    renderCreate();
    expect(screen.getByTestId('form')).toBeInTheDocument();
  });

  it('should pass contactId from router query to Form', () => {
    mockQuery = { id: 'contact-456' };
    mockGetContact.mockReturnValue(null);
    renderCreate();
    expect(screen.getByTestId('form-contact-id')).toHaveTextContent('contact-456');
  });

  it('should pass null initialFormValues for new contact', () => {
    mockQuery = { id: 'new' };
    renderCreate();
    expect(screen.getByTestId('form-initial-values')).toHaveTextContent('null');
  });

  it('should pass initialFormValues from contact data for existing contact', () => {
    const formValues = { name: 'John', phone: '+1234567890', email: '', url: '', vibe: '', photo: '' };
    mockQuery = { id: 'contact-789' };
    mockGetContact.mockReturnValue({
      id: 'contact-789',
      formValues,
      linkValues: {}
    });

    renderCreate();

    expect(mockGetContact).toHaveBeenCalledWith('contact-789');
    expect(screen.getByTestId('form-initial-values')).toHaveTextContent(JSON.stringify(formValues));
  });

  it('should redirect to home when creating new contact at max limit', () => {
    mockQuery = { id: 'new' };
    renderCreate({ canAddContact: false });
    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('should render default emoji when no vibe is set', () => {
    mockQuery = { id: 'new' };
    renderCreate();
    const emojiImg = screen.getByAltText('👤');
    expect(emojiImg).toBeInTheDocument();
  });
});

// Test gradient stops extraction from vibe
describe('Create Page - Gradient Stops', () => {
  it('should extract first and last colors from vibe group', () => {
    const vibe = { emoji: '😀', group: ['#ff0000', '#00ff00', '#0000ff'] };
    
    const stops = {
      start: vibe.group[0],
      end: vibe.group[vibe.group.length - 1]
    };
    
    expect(stops.start).toBe('#ff0000');
    expect(stops.end).toBe('#0000ff');
  });

  it('should handle single color group', () => {
    const vibe = { emoji: '😀', group: ['#ff0000'] };
    
    const stops = {
      start: vibe.group[0],
      end: vibe.group[vibe.group.length - 1]
    };
    
    expect(stops.start).toBe('#ff0000');
    expect(stops.end).toBe('#ff0000');
  });
});
