import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { COLORS } from "@/lib/tokens";

function Bar({ delay, color }: { delay: number; color: string }) {
  const v = useSharedValue(0.4);
  useEffect(() => {
    v.value = withDelay(delay, withRepeat(withTiming(1, { duration: 380 }), -1, true));
  }, []);
  const style = useAnimatedStyle(() => ({ height: 4 + v.value * 10 }));
  return <Animated.View style={[{ width: 3, borderRadius: 2, backgroundColor: color }, style]} />;
}

/** Three animated bars for the currently-playing row (§9 custom component). */
export default function EqualizerBars({ color = COLORS.accent }: { color?: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height: 14, gap: 2 }}>
      <Bar delay={0} color={color} />
      <Bar delay={160} color={color} />
      <Bar delay={80} color={color} />
    </View>
  );
}
