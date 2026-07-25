import { FlatList, View, Text } from "react-native";
import { useExplore } from "@/lib/api";
import ShelfCarousel from "@/components/ShelfCarousel";
import MediaCard from "@/components/MediaCard";
import ChipRow from "@/components/ChipRow";
import { useRouter } from "expo-router";

export default function ExploreScreen() {
  const { data: explore, isLoading } = useExplore();
  const router = useRouter();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-yt-bg">
        <Text className="text-yt-textSecondary">Loading...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={explore?.charts ?? []}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View>
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
              <Text className="px-4 mb-3 text-lg font-bold text-yt-textPrimary">
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
      contentContainerClassName="pb-4"
      showsVerticalScrollIndicator={false}
    />
  );
}
