import { View, Text, Pressable } from "react-native";
import { Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { usePlayerStore } from "@/stores/playerStore";
import { getThumbnailUrl } from "@/lib/utils";
import TrackPlayer, { useProgress } from "react-native-track-player";

export default function MiniPlayer() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentTrack, isPlaying, setPlaying } = usePlayerStore();
  const { position, duration } = useProgress(500);

  if (!currentTrack) return null;

  const progress = duration > 0 ? Math.min(100, (position / duration) * 100) : 0;

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
    // absolute overlay above the tab bar — must NOT be a flex sibling of the
    // Tabs navigator or it collapses the navigator layout and kills touch.
    <View
      style={{
        position: "absolute",
        left: 8,
        right: 8,
        bottom: 56 + insets.bottom + 6,
      }}
    >
      <Pressable
        onPress={() => router.push("/now-playing")}
        className="overflow-hidden rounded-lg bg-yt-surface"
      >
        <View className="flex-row items-center px-2 py-2">
          <Image
            source={
              getThumbnailUrl(currentTrack.thumbnail, 120)
                ? { uri: getThumbnailUrl(currentTrack.thumbnail, 120) }
                : undefined
            }
            className="h-12 w-12 rounded bg-yt-surface"
            resizeMode="cover"
          />
          <View className="ml-3 flex-1">
            <Text
              className="text-sm font-semibold text-yt-textPrimary"
              numberOfLines={1}
            >
              {currentTrack.title}
            </Text>
            <Text className="text-xs text-yt-textSecondary" numberOfLines={1}>
              {currentTrack.artist?.name ?? ""}
            </Text>
          </View>
          <Pressable onPress={togglePlay} hitSlop={10} className="px-2">
            <Ionicons name={isPlaying ? "pause" : "play"} size={26} color="#fff" />
          </Pressable>
          <Pressable onPress={skipNext} hitSlop={10} className="pl-1 pr-2">
            <Ionicons name="play-skip-forward" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* progress line */}
        <View className="h-[2px] w-full bg-yt-surface2">
          <View
            className="h-full bg-yt-accent"
            style={{ width: `${progress}%` }}
          />
        </View>
      </Pressable>
    </View>
  );
}
