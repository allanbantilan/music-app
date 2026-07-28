import { FlatList, View, Text, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { useExplore } from "@/lib/api";
import type { Shelf } from "@ytmusic/shared-types";
import ShelfCarousel from "@/components/ShelfCarousel";
import MediaCard from "@/components/MediaCard";
import ChipRow from "@/components/ChipRow";
import { useRouter } from "expo-router";

export default function ExploreScreen() {
  const { data: explore, isLoading, error } = useExplore();
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-base">
        <Text className="text-secondary">Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-base px-6">
        <Text className="text-center text-secondary">
          Explore unavailable{"\n"}
          {String((error as any)?.message ?? error)}
        </Text>
      </View>
    );
  }

  return (
    <FlashList<Shelf>
      data={explore?.charts ?? []}
      keyExtractor={(item) => item.id}
      estimatedItemSize={260}
      ListHeaderComponent={
        <View>
          {/* Search entry — opens the full song/album/artist search */}
          <Pressable
            onPress={() => router.push("/search")}
            className="mx-4 mt-3 mb-1 flex-row items-center gap-3 rounded-full bg-surface-raised px-4 py-3"
          >
            <Ionicons name="search" size={20} color="#AAAAAA" />
            <Text className="text-sm text-secondary">
              Songs, albums, artists
            </Text>
          </Pressable>

          {explore?.moodsAndGenres && (
            <View className="py-4">
              <ChipRow
                chips={explore.moodsAndGenres}
                onChipPress={(chip) =>
                  router.push({ pathname: "/search", params: { q: chip.title } })
                }
              />
            </View>
          )}

          {explore?.newReleases && explore.newReleases.length > 0 && (
            <View className="mb-6">
              <Text className="px-4 mb-3 text-lg font-bold text-primary">
                New Releases
              </Text>
              <FlatList
                horizontal
                data={explore.newReleases}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="px-4 gap-3"
                renderItem={({ item }) => (
                  <MediaCard
                    item={item}
                    onPress={() =>
                      router.push({ pathname: "/album/[id]", params: { id: item.id } })
                    }
                  />
                )}
              />
            </View>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <ShelfCarousel
          shelf={item}
          onItemPress={(i) => {
            if ("id" in i) {
              if ("tracks" in i || "year" in i) {
                router.push({ pathname: "/album/[id]", params: { id: i.id } });
              } else if ("subscribers" in i || "songs" in i) {
                router.push({ pathname: "/artist/[id]", params: { id: i.id } });
              }
            }
          }}
        />
      )}
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    />
  );
}
