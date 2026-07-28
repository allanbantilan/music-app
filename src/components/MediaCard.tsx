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
  const uri = getThumbnailUrl(item.thumbnail, 300);

  return (
    <Pressable onPress={onPress} className="w-[148px] active:opacity-80">
      <Image
        source={uri ? { uri } : undefined}
        className="h-[148px] w-[148px] rounded-thumb bg-surface-raised"
        resizeMode="cover"
      />
      <Text className="mt-2 text-[15px] font-medium text-primary" numberOfLines={1}>
        {item.title}
      </Text>
      <Text className="mt-0.5 text-[13px] text-secondary" numberOfLines={1}>
        {subtitle}
      </Text>
    </Pressable>
  );
}
