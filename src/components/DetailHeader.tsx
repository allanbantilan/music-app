import { View, Text, Pressable } from "react-native";
import { Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getThumbnailUrl } from "@/lib/utils";
import { useDominantColor } from "@/lib/useDominantColor";
import { COLORS } from "@/lib/tokens";
import IconButton from "@/components/IconButton";
import type { Thumbnail } from "@ytmusic/shared-types";

interface DetailHeaderProps {
  thumbnail: Thumbnail[];
  title: string;
  meta: string;
  isPlaying: boolean;
  onBack: () => void;
  onPlay: () => void;
  onMetaPress?: () => void;
}

/**
 * Spotify-style gradient detail header: dominant-color → base vertical gradient,
 * centered artwork, title/meta, action row, and an accent play FAB docked at
 * the bottom-right of the header.
 */
export default function DetailHeader({
  thumbnail,
  title,
  meta,
  isPlaying,
  onBack,
  onPlay,
  onMetaPress,
}: DetailHeaderProps) {
  const insets = useSafeAreaInsets();
  const art = getThumbnailUrl(thumbnail, 500);
  const dominant = useDominantColor(art);

  return (
    <View>
      <LinearGradient
        colors={[dominant, COLORS.base]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: 420 }}
      />
      <View style={{ paddingTop: insets.top + 4 }}>
        <IconButton name="arrow-back" color={COLORS.primary} onPress={onBack} className="ml-2" />
      </View>

      <View className="items-center px-4 pt-2 pb-4">
        <Image
          source={art ? { uri: art } : undefined}
          className="aspect-square w-[60%] rounded-card bg-surface"
          resizeMode="cover"
        />
      </View>

      <View className="flex-row items-end justify-between px-4">
        <View className="flex-1 pr-4">
          <Text className="text-2xl font-bold text-primary" numberOfLines={2}>
            {title}
          </Text>
          <Pressable onPress={onMetaPress} disabled={!onMetaPress}>
            <Text className="mt-1 text-[13px] text-secondary" numberOfLines={1}>
              {meta}
            </Text>
          </Pressable>
          <View className="mt-3 flex-row items-center gap-5">
            <IconButton name="heart-outline" color={COLORS.secondary} />
            <IconButton name="download-outline" color={COLORS.secondary} />
            <IconButton name="share-social-outline" color={COLORS.secondary} />
            <IconButton name="ellipsis-vertical" color={COLORS.secondary} />
          </View>
        </View>

        <Pressable
          onPress={onPlay}
          className="h-14 w-14 items-center justify-center rounded-full bg-accent active:opacity-90"
        >
          <IonPlay isPlaying={isPlaying} />
        </Pressable>
      </View>
    </View>
  );
}

// Inline so the FAB glyph stays black regardless of icon-button theming.
import { Ionicons } from "@expo/vector-icons";
function IonPlay({ isPlaying }: { isPlaying: boolean }) {
  return (
    <Ionicons
      name={isPlaying ? "pause" : "play"}
      size={28}
      color={COLORS.base}
      style={{ marginLeft: isPlaying ? 0 : 2 }}
    />
  );
}
