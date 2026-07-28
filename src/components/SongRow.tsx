import { View, Text, Pressable } from "react-native";
import { Image } from "react-native";
import type { Song } from "@ytmusic/shared-types";
import { getThumbnailUrl, formatDuration } from "@/lib/utils";

interface SongRowProps {
  song: Song;
  index?: number;
  onPlay?: (song: Song) => void;
  showDuration?: boolean;
}

export default function SongRow({
  song,
  index,
  onPlay,
  showDuration = true,
}: SongRowProps) {
  return (
    <Pressable
      onPress={() => onPlay?.(song)}
      className="flex-row items-center px-4 py-2"
    >
      {index !== undefined && (
        <Text className="w-6 text-center text-sm text-yt-textSecondary">
          {index + 1}
        </Text>
      )}

      <Image
        source={
          getThumbnailUrl(song.thumbnail, 120)
            ? { uri: getThumbnailUrl(song.thumbnail, 120) }
            : undefined
        }
        className="h-11 w-11 rounded-md bg-yt-surface"
        resizeMode="cover"
      />

      <View className="ml-3 flex-1">
        <Text
          className="text-sm font-medium text-yt-textPrimary"
          numberOfLines={1}
        >
          {song.title}
          {song.isExplicit && (
            <Text className="ml-1 rounded bg-yt-surface2 px-1 text-[10px] text-yt-textSecondary">
              E
            </Text>
          )}
        </Text>
        <Text
          className="text-xs text-yt-textSecondary"
          numberOfLines={1}
        >
          {song.artist?.name ?? ""}
        </Text>
      </View>

      {showDuration && song.duration > 0 && (
        <Text className="ml-2 text-xs text-yt-textSecondary">
          {formatDuration(song.duration)}
        </Text>
      )}

      <Pressable className="ml-2 p-2">
        <Text className="text-yt-textSecondary">⋯</Text>
      </Pressable>
    </Pressable>
  );
}
