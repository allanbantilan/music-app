import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { usePlayerStore } from "@/stores/playerStore";
import { getThumbnailUrl } from "@/lib/utils";
import TrackPlayer from "react-native-track-player";

export default function MiniPlayer() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentTrack, isPlaying, setPlaying, position, duration } =
    usePlayerStore();

  if (!currentTrack) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  const togglePlay = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
      setPlaying(false);
    } else {
      await TrackPlayer.play();
      setPlaying(true);
    }
  };

  const skipNext = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch {}
  };

  return (
    <Pressable
      onPress={() => router.push("/now-playing")}
      className="bg-yt-surface"
      style={{ paddingBottom: insets.bottom }}
    >
      {/* Progress bar */}
      <View className="h-[2px] w-full bg-yt-surface2">
        <View
          className="h-full bg-yt-textPrimary"
          style={{ width: `${progress}%` }}
        />
      </View>

      <View className="flex-row items-center px-3 py-2">
        {/* Thumbnail */}
        <Image
          source={{ uri: getThumbnailUrl(currentTrack.thumbnail, 120) }}
          className="h-11 w-11 rounded-md"
          contentFit="cover"
        />

        {/* Title + Artist */}
        <View className="ml-3 flex-1">
          <Text
            className="text-sm font-semibold text-yt-textPrimary"
            numberOfLines={1}
          >
            {currentTrack.title}
          </Text>
          <Text
            className="text-xs text-yt-textSecondary"
            numberOfLines={1}
          >
            {currentTrack.artist.name}
          </Text>
        </View>

        {/* Controls */}
        <Pressable onPress={togglePlay} className="ml-2 p-2">
          <Text className="text-2xl text-yt-textPrimary">
            {isPlaying ? "⏸" : "▶"}
          </Text>
        </Pressable>

        <Pressable onPress={skipNext} className="p-2">
          <Text className="text-xl text-yt-textPrimary">⏭</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
