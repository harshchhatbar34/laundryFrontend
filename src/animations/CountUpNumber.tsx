// CountUpNumber — Animated counting number display
// Uses requestAnimationFrame for smooth 60fps counting

import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';

// Default number formatter: integers stay whole, decimals get 2 places
const defaultFormatter = (num: number): string => {
  if (Number.isInteger(num)) {
    return num.toLocaleString();
  }
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// EaseOutQuart for natural deceleration feel
const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

export interface CountUpNumberProps {
  value?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: StyleProp<TextStyle>;
  formatter?: (num: number) => string;
}

const CountUpNumber = memo<CountUpNumberProps>(({
  value = 0,
  duration = 1000,
  prefix = '',
  suffix = '',
  style,
  formatter = defaultFormatter,
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startValueRef = useRef(0);
  const prevValueRef = useRef(0);

  const animate = useCallback((timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);

    const currentValue =
      startValueRef.current +
      (value - startValueRef.current) * easedProgress;

    setDisplayValue(currentValue);

    if (progress < 1) {
      rafRef.current = requestAnimationFrame(animate);
    } else {
      // Ensure we land exactly on the target
      setDisplayValue(value);
    }
  }, [value, duration]);

  useEffect(() => {
    // Start from previous displayed value for smooth transitions
    startValueRef.current = prevValueRef.current;
    startTimeRef.current = null;

    if (duration <= 0 || value === startValueRef.current) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration, animate]);

  // Track previous value for re-animation
  useEffect(() => {
    prevValueRef.current = value;
  }, [value]);

  const formattedValue = formatter(displayValue);

  return (
    <Text style={style}>
      {prefix}{formattedValue}{suffix}
    </Text>
  );
});

CountUpNumber.displayName = 'CountUpNumber';

export default CountUpNumber;
