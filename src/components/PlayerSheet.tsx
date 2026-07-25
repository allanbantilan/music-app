import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { usePlayerStore } from "@/stores/playerStore";
import { getThumbnailUrl, formatDuration } from "@/lib/utils";
import TrackPlayer from "react-native-track-player";

export default function PlayerSheet() {
  const {
    currentTrack,
    isPlaying,
    setPlaying,
    position,
    duration,
    setPosition,
    shuffle,
    repeat,
    toggleShuffle,
    cycleRepeat,
  } = usePlayerStore();

  if (!currentTrack) return null;

  const togglePlay = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
      setPlaying(false);
    } else {
      await TrackPlayer.play();
      setPlaying(true);
    }
  };

  const seek = async (value: number) => {
    await TrackPlayer.seekTo(value);
    setPosition(value);
  };

  const prev = async () => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch {}
  };

  const next = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch {}
  };

  return (
    <View className="flex-1 items-center justify-center bg-yt-bg px-6 pt-12">
      {/* Artwork */}
      <Image
        source={{ uri: getThumbnailUrl(currentTrack.thumbnail, 600) }}
        className="h-[320px] w-[320px] rounded-xl"
        contentFit="cover"
        transition={300}
      />

      {/* Title / Artist */}
      <View className="mt-8 w-full items-center">
        <Text className="text-xl font-bold text-yt-textPrimary" numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text className="mt-1 text-sm text-yt-textSecondary" numberOfLines={1}>
          {currentTrack.artist.name}
        </Text>
      </View>

      {/* Slider */}
      <View className="mt-6 w-full">
        <View className="h-1 w-full rounded-full bg-yt-surface2">
          <View
            className="h-full rounded-full bg-yt-textPrimary"
            style={{
              width: duration > 0 ? `${(position / duration) * 100}%` : "0%",
            }}
          />
        </View>
        <Pressable
          className="mt-1 h-8 w-full justify-center"
          onPressIn={(e) => {
            const x = e.nativeEvent.locationX;
            // Approximate seek
          }}
        >
          <View className="h-1 w-full" />
        </Pressable>
        <View className="flex-row justify-between">
          <Text className="text-xs text-yt-textSecondary">
            {formatDuration(position)}
          </Text>
          <Text className="text-xs text-yt-textSecondary">
            -{formatDuration(Math.max(0, duration - position))}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View className="mt-4 flex-row items-center justify-between w-full">
        <Pressable onPress={toggleShuffle} className="p-3">
          <Text className={`text-lg ${shuffle ? "text-yt-textPrimary" : "text-yt-textSecondary"}`}>
            🔀
          </Text>
        </Pressable>

        <Pressable onPress={prev} className="p-3">
          <Text className="text-2xl text-yt-textPrimary">⏮</Text>
        </Pressable>

        <Pressable
          onPress={togglePlay}
          className="h-16 w-16 items-center justify-center rounded-full bg-yt-textPrimary"
        >
          <Text className="text-3xl text-yt-bg">
            {isPlaying ? "⏸" : "▶"}
          </Text>
        </Pressable>

        <Pressable onPress={next} className="p-3">
          <Text className="text-2xl text-yt-textPrimary">⏭</Text>
        </Pressable>

        <Pressable onPress={cycleRepeat} className="p-3">
          <Text className={`text-lg ${repeat !== "off" ? "text-yt-textPrimary" : "text-yt-textSecondary"}`}>
            {repeat === "one" ? "🔂" : "🔁"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
