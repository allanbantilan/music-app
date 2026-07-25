import { View, Text, Pressable } from "react-native";
import type { Song } from "@ytmusic/shared-types";

interface ContextMenuSheetProps {
  song: Song;
  onAddToQueue?: () => void;
  onLike?: () => void;
  onAddToPlaylist?: () => void;
  onShare?: () => void;
}

export default function ContextMenuSheet({
  song,
  onAddToQueue,
  onLike,
  onAddToPlaylist,
  onShare,
}: ContextMenuSheetProps) {
  return (
    <View className="rounded-t-2xl bg-yt-surface p-4 pb-8">
      <View className="mb-4 items-center">
        <View className="h-1 w-10 rounded-full bg-yt-surface2" />
      </View>

      <Text className="mb-1 text-base font-semibold text-yt-textPrimary" numberOfLines={1}>
        {song.title}
      </Text>
      <Text className="mb-4 text-sm text-yt-textSecondary" numberOfLines={1}>
        {song.artist.name}
      </Text>

      {[
        { label: "Add to queue", onPress: onAddToQueue },
        { label: "Like", onPress: onLike },
        { label: "Add to playlist", onPress: onAddToPlaylist },
        { label: "Share", onPress: onShare },
      ].map((item) => (
        <Pressable
          key={item.label}
          onPress={item.onPress}
          className="rounded-lg bg-yt-surface2 px-4 py-3 mb-2"
        >
          <Text className="text-sm text-yt-textPrimary">{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
