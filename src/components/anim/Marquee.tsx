import { useState } from "react";
import { View, Text, type TextStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  cancelAnimation,
} from "react-native-reanimated";

/**
 * Scrolls its text horizontally only when it overflows the container (§2/§3).
 * Falls back to a static 1-line label when it fits.
 */
export default function Marquee({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: TextStyle;
}) {
  const [box, setBox] = useState(0);
  const [content, setContent] = useState(0);
  const x = useSharedValue(0);

  const overflow = content > box + 4;
  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const start = () => {
    if (!overflow) return;
    const distance = content - box;
    cancelAnimation(x);
    x.value = 0;
    x.value = withDelay(
      1000,
      withRepeat(
        withTiming(-distance - 16, {
          duration: Math.max(2000, distance * 30),
          easing: Easing.linear,
        }),
        -1,
        true
      )
    );
  };

  return (
    <View className="overflow-hidden" onLayout={(e) => setBox(e.nativeEvent.layout.width)}>
      <Animated.View style={overflow ? animStyle : undefined}>
        <Text
          numberOfLines={1}
          className={className}
          style={style}
          onLayout={(e) => {
            setContent(e.nativeEvent.layout.width);
            start();
          }}
        >
          {text}
        </Text>
      </Animated.View>
    </View>
  );
}
