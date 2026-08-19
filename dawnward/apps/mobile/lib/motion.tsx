import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  type StyleProp,
  type ViewStyle,
} from "react-native";

/** prefers-reduced-motion: the three sanctioned moments become crossfades. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) setReduced(v);
    });
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return reduced;
}

/**
 * Touch that touches back. Every tappable surface settles 3% under the
 * finger and springs home on release: transform-only, under 200ms, ease-out
 * on the way down (per the craft canon: never ease-in, always interruptible).
 * With reduced motion on, it is a plain Pressable.
 */
export function Press({
  onPress,
  disabled,
  style,
  hitSlop,
  accessibilityLabel,
  children,
}: {
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  hitSlop?: number;
  accessibilityLabel?: string;
  children: ReactNode;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduced = useReducedMotion();

  function to(value: number, duration: number) {
    Animated.timing(scale, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled) }}
      onPressIn={() => !reduced && to(0.97, 110)}
      onPressOut={() => !reduced && to(1, 180)}
    >
      <Animated.View style={[style, reduced ? null : { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
