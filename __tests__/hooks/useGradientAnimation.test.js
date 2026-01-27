import { renderHook, act } from '@testing-library/react';
import { useGradientAnimation } from '../../hooks/useGradientAnimation';

describe('useGradientAnimation', () => {
  // Mock vibe data
  const mockVibe = {
    label: 'Test',
    emoji: '🔥',
    group: ['#f9d423', '#ff4e50']
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial angle of 180', () => {
    const { result } = renderHook(() => useGradientAnimation(mockVibe));
    expect(result.current.angle).toBe(180);
  });

  it('should set stops from vibe colors', () => {
    const { result } = renderHook(() => useGradientAnimation(mockVibe));
    
    expect(result.current.stops.start).toBe('#f9d423');
    expect(result.current.stops.end).toBe('#ff4e50');
  });

  it('should generate RGBA colors with 0.5 alpha', () => {
    const { result } = renderHook(() => useGradientAnimation(mockVibe));
    
    expect(result.current.stops.startRGBA).toMatch(/^rgba\(\d+,\d+,\d+,0\.5\)$/);
    expect(result.current.stops.endRGBA).toMatch(/^rgba\(\d+,\d+,\d+,0\.5\)$/);
  });

  it('should increment angle over time', () => {
    const { result } = renderHook(() => useGradientAnimation(mockVibe, 15));
    
    const initialAngle = result.current.angle;
    
    act(() => {
      jest.advanceTimersByTime(15);
    });
    
    expect(result.current.angle).toBe((initialAngle + 1) % 360);
  });

  it('should wrap angle at 360', () => {
    const { result } = renderHook(() => useGradientAnimation(mockVibe, 15));
    
    // Advance to near 360
    act(() => {
      jest.advanceTimersByTime(15 * 180); // 180 increments from 180 = 360 → 0
    });
    
    expect(result.current.angle).toBe(0);
  });

  it('should handle null vibe gracefully', () => {
    const { result } = renderHook(() => useGradientAnimation(null));
    
    expect(result.current.stops.start).toBe('');
    expect(result.current.stops.end).toBe('');
  });

  it('should handle vibe without group array', () => {
    const invalidVibe = { label: 'Test', emoji: '🔥' };
    const { result } = renderHook(() => useGradientAnimation(invalidVibe));
    
    expect(result.current.stops.start).toBe('');
    expect(result.current.stops.end).toBe('');
  });

  it('should update stops when vibe changes', () => {
    const { result, rerender } = renderHook(
      ({ vibe }) => useGradientAnimation(vibe),
      { initialProps: { vibe: mockVibe } }
    );
    
    expect(result.current.stops.start).toBe('#f9d423');
    
    const newVibe = {
      label: 'New',
      emoji: '❄️',
      group: ['#89f7fe', '#66a6ff']
    };
    
    rerender({ vibe: newVibe });
    
    expect(result.current.stops.start).toBe('#89f7fe');
    expect(result.current.stops.end).toBe('#66a6ff');
  });

  it('should use custom interval when provided', () => {
    const customInterval = 100;
    const { result } = renderHook(() => useGradientAnimation(mockVibe, customInterval));
    
    const initialAngle = result.current.angle;
    
    // Should not change at default interval
    act(() => {
      jest.advanceTimersByTime(15);
    });
    expect(result.current.angle).toBe(initialAngle);
    
    // Should change at custom interval
    act(() => {
      jest.advanceTimersByTime(85); // Total 100ms
    });
    expect(result.current.angle).toBe((initialAngle + 1) % 360);
  });

  it('should clean up interval on unmount', () => {
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    const { unmount } = renderHook(() => useGradientAnimation(mockVibe));
    
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});
