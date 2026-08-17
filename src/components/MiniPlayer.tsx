import { View, Text, Pressable } from "react-native";
import { Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { usePlayerStore } from "@/stores/playerStore";
import { getThumbnailUrl } from "@/lib/utils";
import { COLORS } from "@/lib/tokens";
import IconButton from "@/components/IconButton";
import Marquee from "@/components/anim/Marquee";
import { useProgress } from "react-native-track-player";
import { togglePlay, next, prev, stopAndClear } from "@/lib/playback";

export default function MiniPlayer() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentTrack, isPlaying } = usePlayerStore();
  const { position, duration } = useProgress(500);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  // Horizontal swipe = prev/next; swipe down = dismiss + stop (§6).
  const pan = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .activeOffsetY([-15, 15])
    .onUpdate((e) => {
      if (Math.abs(e.translationX) > Math.abs(e.translationY)) tx.value = e.translationX;
      else if (e.translationY > 0) ty.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > 80) {
        ty.value = withTiming(200, {}, () => runOnJS(stopAndClear)());
        return;
      }
      if (e.translationX < -80) {
        tx.value = withTiming(-400, {}, () => {
          tx.value = 0;
          runOnJS(next)();
        });
        return;
      }
      if (e.translationX > 80) {
        tx.value = withTiming(400, {}, () => {
          tx.value = 0;
          runOnJS(prev)();
        });
        return;
      }
      tx.value = withSpring(0);
      ty.value = withSpring(0);
    });

  if (!currentTrack) return null;

  const pct = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;
  const uri = getThumbnailUrl(currentTrack.thumbnail, 120);

  return (
    <Animated.View
      style={[
        { position: "absolute", left: 8, right: 8, bottom: 56 + insets.bottom + 4 },
        animStyle,
      ]}
    >
      <GestureDetector gesture={pan}>
        <Pressable
          onPress={() => router.push("/now-playing")}
          className="overflow-hidden rounded-card bg-surface-raised active:opacity-90"
        >
          <View className="flex-row items-center px-2 py-2">
            {uri ? (
              <Image
                source={{ uri }}
                className="h-10 w-10 rounded-thumb bg-surface"
                resizeMode="cover"
              />
            ) : (
              <View className="h-10 w-10 rounded-thumb bg-surface" />
            )}
            <View className="ml-3 flex-1">
              <Marquee text={currentTrack.title} className="text-[15px] font-medium text-primary" />
              <Text className="mt-0.5 text-[13px] text-secondary" numberOfLines={1}>
                {currentTrack.artist?.name ?? ""}
              </Text>
            </View>
            <IconButton
              name={isPlaying ? "pause" : "play"}
              size={26}
              color={COLORS.primary}
              onPress={togglePlay}
              className="px-2"
            />
            <IconButton
              name="play-skip-forward"
              size={22}
              color={COLORS.primary}
              onPress={next}
              className="pl-1 pr-2"
            />
          </View>

          <View className="h-[2px] w-full bg-surface">
            <View className="h-full bg-accent" style={{ width: `${pct}%` }} />
          </View>
        </Pressable>
      </GestureDetector>
    </Animated.View>
  );
}
