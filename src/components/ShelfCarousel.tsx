import { View, ScrollView } from "react-native";
import type { Shelf } from "@ytmusic/shared-types";
import MediaCard from "./MediaCard";
import ArtistCard from "./ArtistCard";
import SongRow from "./SongRow";
import SectionHeader from "./SectionHeader";

interface ShelfCarouselProps {
  shelf: Shelf;
  onItemPress?: (item: any) => void;
}

export default function ShelfCarousel({ shelf, onItemPress }: ShelfCarouselProps) {
  if (!shelf.items || shelf.items.length === 0) return null;

  return (
    <View className="mb-8">
      <SectionHeader title={shelf.title} />

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
