import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

/**
 * Pulsing skeleton block (§4 — no spinners on feeds). Give it width/height
 * via className; it animates opacity.
 */
export default function Skeleton({ className }: { className?: string }) {
  const o = useSharedValue(0.4);
  useEffect(() => {
    o.value = withRepeat(withTiming(0.9, { duration: 700 }), -1, true);
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View className={`bg-surface-raised ${className ?? ""}`} style={style} />;
}
