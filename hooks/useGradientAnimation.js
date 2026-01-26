import { useState, useEffect } from 'react';
import * as convert from 'color-convert';

/**
 * Hook for animated gradient backgrounds.
 *
 * @param {object} vibe - Vibe object with group array of hex colors
 * @param {number} intervalMs - Animation interval in ms (default: 15)
 * @returns {{ angle: number, stops: object }} Animated angle and color stops
 */
export function useGradientAnimation(vibe, intervalMs = 15) {
  const [angle, setAngle] = useState(180);
  const [stops, setStops] = useState({
    start: "",
    startRGBA: "",
    end: "",
    endRGBA: ""
  });

  // Convert hex to rgba
  const rgbaColor = (hexColor, alpha) => {
    const stop = convert.hex.rgb(hexColor);
    return `rgba(${stop.join(",")},${alpha})`;
  };

  // Update gradient colors when vibe changes
  useEffect(() => {
    if (vibe?.group && vibe.group.length > 0) {
      setStops({
        start: vibe.group[0],
        end: vibe.group[vibe.group.length - 1],
        startRGBA: rgbaColor(vibe.group[0], 0.5),
        endRGBA: rgbaColor(vibe.group[vibe.group.length - 1], 0.5)
      });
    }
  }, [vibe]);

  // Animate gradient angle
  useEffect(() => {
    const updateAngle = () => {
      setAngle((prev) => (prev + 1) % 360);
    };
    const interval = setInterval(updateAngle, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return { angle, stops };
}

export default useGradientAnimation;
