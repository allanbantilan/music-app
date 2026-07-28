import { Text, Pressable } from "react-native";
import { Image } from "react-native";
import type { ArtistInfo } from "@ytmusic/shared-types";
import { getThumbnailUrl } from "@/lib/utils";

interface ArtistCardProps {
  artist: ArtistInfo;
  onPress?: () => void;
}

export default function ArtistCard({ artist, onPress }: ArtistCardProps) {
  const uri = getThumbnailUrl(artist.thumbnail ?? [], 200);
  return (
    <Pressable onPress={onPress} className="w-[100px] items-center active:opacity-80">
      <Image
        source={uri ? { uri } : undefined}
        className="h-[92px] w-[92px] rounded-full bg-surface-raised"
        resizeMode="cover"
      />
      <Text
        className="mt-2 text-center text-[13px] font-medium text-primary"
        numberOfLines={2}
      >
        {artist.name}
      </Text>
    </Pressable>
  );
}
