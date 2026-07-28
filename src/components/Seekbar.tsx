import { useRef, useState } from "react";
import { View, Text, PanResponder, LayoutChangeEvent } from "react-native";
import { useProgress } from "react-native-track-player";
import { formatDuration } from "@/lib/utils";
import { COLORS } from "@/lib/tokens";
import { seekTo } from "@/lib/playback";

/**
 * YT Music scrubber. Live progress from track-player; drag or tap to seek.
 * Track thickens 3→5px and the thumb scales 12→18px while scrubbing.
 */
export default function Seekbar({ accent = COLORS.accent }: { accent?: string }) {
  const { position, duration } = useProgress(250);
  const [width, setWidth] = useState(0);
  const [scrub, setScrub] = useState<number | null>(null);
  const widthRef = useRef(0);
  const durRef = useRef(0);
  durRef.current = duration;

  const seekFrac = (x: number) => Math.max(0, Math.min(1, x / (widthRef.current || 1)));

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) =>
        setScrub(seekFrac(e.nativeEvent.locationX) * durRef.current),
      onPanResponderMove: (e) =>
        setScrub(seekFrac(e.nativeEvent.locationX) * durRef.current),
      onPanResponderRelease: async (e) => {
        const to = seekFrac(e.nativeEvent.locationX) * durRef.current;
        await seekTo(to);
        setScrub(null);
      },
      onPanResponderTerminate: () => setScrub(null),
    })
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    widthRef.current = w;
    setWidth(w);
  };

  const shown = scrub ?? position;
  const pct = duration > 0 ? Math.max(0, Math.min(1, shown / duration)) : 0;
  const scrubbing = scrub !== null;

  return (
    <View className="w-full">
      {/* Wider touch target than the visible 3px track */}
      <View
        {...pan.panHandlers}
        onLayout={onLayout}
        className="justify-center"
        style={{ height: 24 }}
      >
        <View
          className="w-full rounded-full bg-white/20"
          style={{ height: scrubbing ? 5 : 3 }}
        >
          <View
            className="h-full rounded-full"
            style={{ width: pct * width, backgroundColor: accent }}
          />
        </View>
        <View
          className="absolute rounded-full"
          style={{
            width: scrubbing ? 18 : 12,
            height: scrubbing ? 18 : 12,
            backgroundColor: accent,
            left: pct * width - (scrubbing ? 9 : 6),
          }}
        />
      </View>
      <View className="mt-1 flex-row justify-between">
        <Text className="text-[13px] text-secondary">{formatDuration(shown)}</Text>
        <Text className="text-[13px] text-secondary">{formatDuration(duration)}</Text>
      </View>
    </View>
  );
}
