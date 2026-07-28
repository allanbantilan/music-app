import { FlatList, View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useHomeFeed } from "@/lib/api";
import { usePlayerStore } from "@/stores/playerStore";
import ChipRow from "@/components/ChipRow";
import ShelfCarousel from "@/components/ShelfCarousel";
import type { MoodChip, Song } from "@ytmusic/shared-types";
import TrackPlayer from "react-native-track-player";
import { songToTrack } from "@/lib/player";

export default function HomeScreen() {
  const router = useRouter();
  const { data: feed, isLoading, error } = useHomeFeed();
  const { setQueue, setCurrentTrack, setPlaying } = usePlayerStore();

  const handlePlaySong = async (song: Song) => {
    setCurrentTrack(song);
    setPlaying(true);
    try {
      const track = await songToTrack(song);
      await TrackPlayer.reset();
      await TrackPlayer.add(track);
      await TrackPlayer.play();
    } catch (e) {
      console.error("Playback error:", e);
    }
  };

  const handleChipPress = (chip: MoodChip) => {
    router.push({ pathname: "/search", params: { q: chip.title } });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-yt-bg">
        <Text className="text-yt-textSecondary">Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-yt-bg px-6">
        <Text className="text-center text-yt-textSecondary">
          {String((error as any)?.message ?? error)}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={feed?.shelves ?? []}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        feed?.moods ? (
          <View className="pt-2 pb-4">
            <ChipRow chips={feed.moods} onChipPress={handleChipPress} />
          </View>
        ) : undefined
      }
      renderItem={({ item }) => (
        <ShelfCarousel
          shelf={item}
          onItemPress={(i) => {
            if (item.type === "compact_song") handlePlaySong(i as Song);
            else if (item.type === "card_album")
              router.push({ pathname: "/album/[id]", params: { id: i.id } });
            else if (item.type === "card_artist")
              router.push({ pathname: "/artist/[id]", params: { id: i.id } });
            else router.push({ pathname: "/playlist/[id]", params: { id: i.id } });
          }}
        />
      )}
      contentContainerClassName="pb-4"
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <View className="mt-24 items-center px-6">
          <Text className="text-yt-textSecondary">
            No shelves (feed returned {feed?.shelves?.length ?? 0})
          </Text>
        </View>
      }
    />
  );
}
