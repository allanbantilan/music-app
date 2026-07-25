import { ScrollView, View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useArtist } from "@/lib/api";
import { getThumbnailUrl, formatDuration } from "@/lib/utils";
import SongRow from "@/components/SongRow";
import MediaCard from "@/components/MediaCard";
import TrackPlayer from "react-native-track-player";
import { usePlayerStore } from "@/stores/playerStore";
import type { Song } from "@ytmusic/shared-types";
import { songToTrack } from "@/lib/player";

export default function ArtistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: artist, isLoading } = useArtist(id);
  const router = useRouter();
  const { setCurrentTrack, setPlaying } = usePlayerStore();

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

  if (isLoading || !artist) {
    return (
      <View className="flex-1 items-center justify-center bg-yt-bg">
        <Text className="text-yt-textSecondary">Loading artist...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-yt-bg">
      {/* Header image */}
      <View className="relative h-[300px]">
        <Image
          source={{ uri: getThumbnailUrl(artist.headerImage, 800) }}
          className="h-full w-full"
          contentFit="cover"
        />
        <View className="absolute bottom-0 left-0 right-0 h-[150px] bg-gradient-to-t from-yt-bg to-transparent" />
        <Text className="absolute bottom-4 left-4 text-3xl font-bold text-white">
          {artist.name}
        </Text>
      </View>

      {/* Action buttons */}
      <View className="flex-row items-center px-4 py-3 gap-3">
        <Pressable className="rounded-full bg-yt-textPrimary px-6 py-2">
          <Text className="text-sm font-bold text-yt-bg">Shuffle</Text>
        </Pressable>
        <Pressable className="rounded-full border border-yt-textSecondary px-6 py-2">
          <Text className="text-sm font-bold text-yt-textPrimary">Radio</Text>
        </Pressable>
      </View>

      {/* Top Songs */}
      {artist.songs.length > 0 && (
        <View className="mb-6">
          <Text className="px-4 mb-2 text-lg font-bold text-yt-textPrimary">
            Top Songs
          </Text>
          {artist.songs.slice(0, 5).map((song, i) => (
            <SongRow
              key={`${song.id}-${i}`}
              song={song}
              index={i}
              onPlay={handlePlaySong}
            />
          ))}
        </View>
      )}

      {/* Albums */}
      {artist.albums.length > 0 && (
        <View className="mb-6">
          <Text className="px-4 mb-3 text-lg font-bold text-yt-textPrimary">
            Albums
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-4 gap-3"
          >
            {artist.albums.map((album) => (
              <MediaCard
                key={album.id}
                item={album}
                onPress={() =>
                  router.push({ pathname: "/album/[id]", params: { id: album.id } })
                }
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Singles */}
      {artist.singles.length > 0 && (
        <View className="mb-6">
          <Text className="px-4 mb-3 text-lg font-bold text-yt-textPrimary">
            Singles
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-4 gap-3"
          >
            {artist.singles.map((single) => (
              <MediaCard
                key={single.id}
                item={single}
                onPress={() =>
                  router.push({ pathname: "/album/[id]", params: { id: single.id } })
                }
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Related Artists */}
      {artist.relatedArtists.length > 0 && (
        <View className="mb-8">
          <Text className="px-4 mb-3 text-lg font-bold text-yt-textPrimary">
            Related Artists
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-4 gap-3"
          >
            {artist.relatedArtists.map((related) => (
              <View key={related.id} className="items-center w-[100px]">
                <Image
                  source={{ uri: getThumbnailUrl(related.thumbnail ?? [], 200) }}
                  className="h-[80px] w-[80px] rounded-full"
                  contentFit="cover"
                />
                <Text
                  className="mt-1.5 text-xs font-medium text-yt-textPrimary text-center"
                  numberOfLines={2}
                >
                  {related.name}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}
