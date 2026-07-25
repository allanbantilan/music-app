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
      <View className="flex-1 items-center justify-center bg-yt-bg">
        <Text className="text-yt-textSecondary">Failed to load home feed</Text>
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
            if ("duration" in i && "thumbnail" in i) {
              handlePlaySong(i as Song);
            }
          }}
        />
      )}
      contentContainerClassName="pb-4"
      showsVerticalScrollIndicator={false}
    />
  );
}
