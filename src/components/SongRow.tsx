import { View, Text, Pressable } from "react-native";
import { Image } from "react-native";
import type { Song } from "@ytmusic/shared-types";
import { getThumbnailUrl, formatDuration } from "@/lib/utils";
import { COLORS } from "@/lib/tokens";
import IconButton from "@/components/IconButton";
import EqualizerBars from "@/components/anim/EqualizerBars";
import ExplicitBadge from "@/components/anim/ExplicitBadge";
import { useContextSheet } from "@/stores/contextSheet";
import { togglePlay } from "@/lib/playback";

interface SongRowProps {
  song: Song;
  index?: number;
  active?: boolean; // currently-playing row
  onPlay?: (song: Song) => void;
  showDuration?: boolean;
}

export default function SongRow({
  song,
  index,
  active = false,
  onPlay,
  showDuration = true,
}: SongRowProps) {
  const uri = getThumbnailUrl(song.thumbnail, 120);
  const openSheet = useContextSheet((s) => s.open);
  // Tapping the row that's already playing toggles pause/resume (§6).
  const onPress = () => (active ? togglePlay() : onPlay?.(song));
  return (
    <Pressable
      onPress={onPress}
      onLongPress={() => openSheet(song)}
      className="flex-row items-center px-4 py-2 active:bg-surface"
    >
      {index !== undefined && (
        <Text className="w-6 text-center text-[13px] text-muted">{index + 1}</Text>
      )}

      <Image
        source={uri ? { uri } : undefined}
        className="h-12 w-12 rounded-thumb bg-surface-raised"
        resizeMode="cover"
      />

      <View className="ml-3 flex-1 flex-row items-center">
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text
              className={`text-[15px] font-medium ${active ? "text-accent" : "text-primary"}`}
              numberOfLines={1}
            >
              {song.title}
            </Text>
            {song.isExplicit && <ExplicitBadge />}
          </View>
          <Text className="mt-0.5 text-[13px] text-secondary" numberOfLines={1}>
            {song.artist?.name ?? ""}
          </Text>
        </View>
        {active && (
          <View className="ml-2">
            <EqualizerBars />
          </View>
        )}
      </View>

      {showDuration && song.duration > 0 && (
        <Text className="ml-2 text-[13px] text-muted">
          {formatDuration(song.duration)}
        </Text>
      )}

      <IconButton
        name="ellipsis-vertical"
        size="sm"
        color={COLORS.secondary}
        onPress={() => openSheet(song)}
        className="ml-2"
      />
    </Pressable>
  );
}
