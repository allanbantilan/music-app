import { View, Text, Pressable } from "react-native";
import { Image } from "react-native";
import type { AlbumInfo, Playlist } from "@ytmusic/shared-types";
import { getThumbnailUrl } from "@/lib/utils";

interface MediaCardProps {
  item: AlbumInfo | Playlist;
  onPress?: () => void;
}

export default function MediaCard({ item, onPress }: MediaCardProps) {
  const isAlbum = "year" in item;
  const raw = (item as any).subtitle as string | undefined;
  const subtitle =
    raw ||
    (isAlbum
      ? (item as AlbumInfo).artist?.name || `${(item as AlbumInfo).year ?? ""}`
      : (item as Playlist).artist?.name ||
        ((item as Playlist).trackCount
          ? `${(item as Playlist).trackCount} songs`
          : "Playlist"));

  return (
    <Pressable onPress={onPress} className="w-[140px]">
      <Image
        source={
          getThumbnailUrl(item.thumbnail, 300)
            ? { uri: getThumbnailUrl(item.thumbnail, 300) }
            : undefined
        }
        className="h-[140px] w-[140px] rounded-lg bg-yt-surface"
        resizeMode="cover"
      />
      <Text
        className="mt-1.5 text-sm font-medium text-yt-textPrimary"
        numberOfLines={1}
      >
        {item.title}
      </Text>
      <Text className="text-xs text-yt-textSecondary" numberOfLines={1}>
        {subtitle}
      </Text>
    </Pressable>
  );
}
