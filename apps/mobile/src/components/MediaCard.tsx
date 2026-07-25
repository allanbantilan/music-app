import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import type { AlbumInfo, Playlist } from "@ytmusic/shared-types";
import { getThumbnailUrl } from "@/lib/utils";

interface MediaCardProps {
  item: AlbumInfo | Playlist;
  onPress?: () => void;
}

export default function MediaCard({ item, onPress }: MediaCardProps) {
  const isAlbum = "year" in item;
  const subtitle = isAlbum
    ? (item as AlbumInfo).artist?.name || `${(item as AlbumInfo).year ?? ""}`
    : (item as Playlist).artist?.name || `${(item as Playlist).trackCount} songs`;

  return (
    <Pressable onPress={onPress} className="w-[140px]">
      <Image
        source={{ uri: getThumbnailUrl(item.thumbnail, 300) }}
        className="h-[140px] w-[140px] rounded-lg"
        contentFit="cover"
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
