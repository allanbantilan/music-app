import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { View } from "react-native";
import { COLORS } from "@/lib/tokens";

/**
 * Thin spinner ring around the play/pause button while buffering (§8).
 * A rotating arc drawn with a half-transparent border.
 */
export default function BufferingRing({ size = 64, color = COLORS.base }: { size?: number; color?: string }) {
  const rot = useSharedValue(0);
  useEffect(() => {
    rot.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1,
      false
    );
  }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot.value}deg` }] }));
  return (
    <View style={{ position: "absolute", width: size, height: size }} pointerEvents="none">
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: "transparent",
            borderTopColor: color,
          },
          style,
        ]}
      />
    </View>
  );
}
