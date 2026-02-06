import { renderHook, act } from '@testing-library/react';
import { useDonatePrompt } from '../../hooks/useDonatePrompt';
import { STORAGE_KEYS } from '../../utils/storage';
import { DONATE_PROMPT_COOLDOWN_MS } from '../../lib/constants';

// Mock the logger
jest.mock('../../utils/logger.js', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn()
}));

describe('useDonatePrompt', () => {
  const contactWithLinks = {
    id: 'c1',
    linkValues: { instagram: 'user1', twitter: 'user2' }
  };

  const contactWithManyLinks = {
    id: 'c1',
    linkValues: { instagram: 'a', twitter: 'b', github: 'c', linkedin: 'd' }
  };

  const contactWithPowerFeature = {
    id: 'c1',
    linkValues: { custom: 'https://example.com' }
  };

  beforeEach(() => {
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return null donateModal initially', () => {
    const { result } = renderHook(() =>
      useDonatePrompt({ loading: false, contacts: [contactWithLinks], tapCount: 0 })
    );
    expect(result.current.donateModal).toBeNull();
  });

  it('should not show prompt while loading', () => {
    const { result } = renderHook(() =>
      useDonatePrompt({ loading: true, contacts: [contactWithLinks], tapCount: 5 })
    );

    act(() => { jest.advanceTimersByTime(3000); });
    expect(result.current.donateModal).toBeNull();
  });

  it('should not show prompt when no contacts', () => {
    const { result } = renderHook(() =>
      useDonatePrompt({ loading: false, contacts: [], tapCount: 5 })
    );

    act(() => { jest.advanceTimersByTime(3000); });
    expect(result.current.donateModal).toBeNull();
  });

  it('should show contribute prompt when user has links and taps >= 2', () => {
    const { result } = renderHook(() =>
      useDonatePrompt({ loading: false, contacts: [contactWithLinks], tapCount: 2 })
    );

    act(() => { jest.advanceTimersByTime(2000); });
    expect(result.current.donateModal).toBe('contribute');
  });

  it('should not show contribute prompt when taps < 2', () => {
    const { result } = renderHook(() =>
      useDonatePrompt({ loading: false, contacts: [contactWithLinks], tapCount: 1 })
    );

    act(() => { jest.advanceTimersByTime(3000); });
    expect(result.current.donateModal).toBeNull();
  });

  it('should not show contribute prompt when contact has no links', () => {
    const emptyContact = { id: 'c1', linkValues: {} };
    const { result } = renderHook(() =>
      useDonatePrompt({ loading: false, contacts: [emptyContact], tapCount: 5 })
    );

    act(() => { jest.advanceTimersByTime(3000); });
    expect(result.current.donateModal).toBeNull();
  });

  it('should show donate prompt for deep engagement (many links)', () => {
    // Mark prompt 1 as seen
    localStorage.setItem(STORAGE_KEYS.DONATE_PROMPT_1_SEEN, JSON.stringify(true));

    const { result } = renderHook(() =>
      useDonatePrompt({ loading: false, contacts: [contactWithManyLinks], tapCount: 0 })
    );

    act(() => { jest.advanceTimersByTime(2000); });
    expect(result.current.donateModal).toBe('donate');
  });

  it('should show donate prompt for power feature usage', () => {
    localStorage.setItem(STORAGE_KEYS.DONATE_PROMPT_1_SEEN, JSON.stringify(true));

    const { result } = renderHook(() =>
      useDonatePrompt({ loading: false, contacts: [contactWithPowerFeature], tapCount: 0 })
    );

    act(() => { jest.advanceTimersByTime(2000); });
    expect(result.current.donateModal).toBe('donate');
  });

  it('should show donate prompt when taps >= 8', () => {
    localStorage.setItem(STORAGE_KEYS.DONATE_PROMPT_1_SEEN, JSON.stringify(true));

    const { result } = renderHook(() =>
      useDonatePrompt({ loading: false, contacts: [contactWithLinks], tapCount: 8 })
    );

    act(() => { jest.advanceTimersByTime(2000); });
    expect(result.current.donateModal).toBe('donate');
  });

  it('should show donate prompt when 2+ contacts', () => {
    localStorage.setItem(STORAGE_KEYS.DONATE_PROMPT_1_SEEN, JSON.stringify(true));
    const contact2 = { id: 'c2', linkValues: {} };

    const { result } = renderHook(() =>
      useDonatePrompt({ loading: false, contacts: [contactWithLinks, contact2], tapCount: 0 })
    );

    act(() => { jest.advanceTimersByTime(2000); });
    expect(result.current.donateModal).toBe('donate');
  });

  it('should not show any prompt when both already seen', () => {
    localStorage.setItem(STORAGE_KEYS.DONATE_PROMPT_1_SEEN, JSON.stringify(true));
    localStorage.setItem(STORAGE_KEYS.DONATE_PROMPT_2_SEEN, JSON.stringify(true));

    const { result } = renderHook(() =>
      useDonatePrompt({ loading: false, contacts: [contactWithLinks], tapCount: 10 })
    );

    act(() => { jest.advanceTimersByTime(3000); });
    expect(result.current.donateModal).toBeNull();
  });

  it('should suppress prompt within 24h cooldown period', () => {
    // Set last shown to 1 hour ago
    const oneHourAgo = Date.now() - (1 * 60 * 60 * 1000);
    localStorage.setItem(STORAGE_KEYS.DONATE_PROMPT_LAST_SHOWN_AT, JSON.stringify(oneHourAgo));

    const { result } = renderHook(() =>
      useDonatePrompt({ loading: false, contacts: [contactWithLinks], tapCount: 5 })
    );

    act(() => { jest.advanceTimersByTime(3000); });
    expect(result.current.donateModal).toBeNull();
  });

  it('should allow prompt after 24h cooldown expires', () => {
    // Set last shown to 25 hours ago
    const twentyFiveHoursAgo = Date.now() - (25 * 60 * 60 * 1000);
    localStorage.setItem(STORAGE_KEYS.DONATE_PROMPT_LAST_SHOWN_AT, JSON.stringify(twentyFiveHoursAgo));

    const { result } = renderHook(() =>
      useDonatePrompt({ loading: false, contacts: [contactWithLinks], tapCount: 2 })
    );

    act(() => { jest.advanceTimersByTime(2000); });
    expect(result.current.donateModal).toBe('contribute');
  });

  it('should persist timestamp when showing prompt', () => {
    const { result } = renderHook(() =>
      useDonatePrompt({ loading: false, contacts: [contactWithLinks], tapCount: 2 })
    );

    act(() => { jest.advanceTimersByTime(2000); });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.DONATE_PROMPT_LAST_SHOWN_AT));
    expect(typeof stored).toBe('number');
    expect(stored).toBeGreaterThan(0);
  });

  it('should dismiss modal when dismissDonateModal is called', () => {
    const { result } = renderHook(() =>
      useDonatePrompt({ loading: false, contacts: [contactWithLinks], tapCount: 2 })
    );

    act(() => { jest.advanceTimersByTime(2000); });
    expect(result.current.donateModal).toBe('contribute');

    act(() => { result.current.dismissDonateModal(); });
    expect(result.current.donateModal).toBeNull();
  });

  it('should not restart timer on rapid tap changes', () => {
    const { result, rerender } = renderHook(
      ({ tapCount }) => useDonatePrompt({ loading: false, contacts: [contactWithLinks], tapCount }),
      { initialProps: { tapCount: 2 } }
    );

    // Advance 1.5s into the 2s timer
    act(() => { jest.advanceTimersByTime(1500); });
    expect(result.current.donateModal).toBeNull();

    // Rapid taps should not reset the timer
    rerender({ tapCount: 3 });
    rerender({ tapCount: 4 });
    rerender({ tapCount: 5 });

    // Only 500ms more needed if timer wasn't reset
    act(() => { jest.advanceTimersByTime(500); });
    expect(result.current.donateModal).toBe('contribute');
  });

  it('should clean up timer on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const { unmount } = renderHook(() =>
      useDonatePrompt({ loading: false, contacts: [contactWithLinks], tapCount: 2 })
    );

    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('should use DONATE_PROMPT_COOLDOWN_MS constant value', () => {
    expect(DONATE_PROMPT_COOLDOWN_MS).toBe(24 * 60 * 60 * 1000);
  });
});
