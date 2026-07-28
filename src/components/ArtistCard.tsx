import { Text, Pressable } from "react-native";
import { Image } from "react-native";
import type { ArtistInfo } from "@ytmusic/shared-types";
import { getThumbnailUrl } from "@/lib/utils";

interface ArtistCardProps {
  artist: ArtistInfo;
  onPress?: () => void;
}

export default function ArtistCard({ artist, onPress }: ArtistCardProps) {
  return (
    <Pressable onPress={onPress} className="items-center w-[100px]">
      <Image
        source={
          getThumbnailUrl(artist.thumbnail ?? [], 200)
            ? { uri: getThumbnailUrl(artist.thumbnail ?? [], 200) }
            : undefined
        }
        className="h-[80px] w-[80px] rounded-full bg-yt-surface"
        resizeMode="cover"
      />
      <Text
        className="mt-1.5 text-xs font-medium text-yt-textPrimary text-center"
        numberOfLines={2}
      >
        {artist.name}
      </Text>
    </Pressable>
  );
}
