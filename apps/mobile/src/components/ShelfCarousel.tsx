import { View, Text, ScrollView } from "react-native";
import type { Shelf } from "@ytmusic/shared-types";
import MediaCard from "./MediaCard";
import ArtistCard from "./ArtistCard";
import SongRow from "./SongRow";

interface ShelfCarouselProps {
  shelf: Shelf;
  onItemPress?: (item: any) => void;
}

export default function ShelfCarousel({ shelf, onItemPress }: ShelfCarouselProps) {
  if (!shelf.items || shelf.items.length === 0) return null;

  return (
    <View className="mb-6">
      <Text className="px-4 mb-3 text-lg font-bold text-yt-textPrimary">
        {shelf.title}
      </Text>

      {shelf.type === "compact_song" ? (
        <View>
          {(shelf.items as any[]).slice(0, 5).map((item, i) => (
            <SongRow
              key={`${shelf.id}-${i}`}
              song={item}
              onPlay={() => onItemPress?.(item)}
            />
          ))}
        </View>
      ) : shelf.type === "card_artist" ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 gap-3"
        >
          {(shelf.items as any[]).map((item, i) => (
            <ArtistCard
              key={`${shelf.id}-${i}`}
              artist={item}
              onPress={() => onItemPress?.(item)}
            />
          ))}
        </ScrollView>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 gap-3"
        >
          {(shelf.items as any[]).map((item, i) => (
            <MediaCard
              key={`${shelf.id}-${i}`}
              item={item}
              onPress={() => onItemPress?.(item)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
