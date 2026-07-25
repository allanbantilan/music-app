import { ScrollView, View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useAlbum } from "@/lib/api";
import { getThumbnailUrl } from "@/lib/utils";
import TrackList from "@/components/TrackList";
import { usePlayerStore } from "@/stores/playerStore";
import type { Song } from "@ytmusic/shared-types";
import TrackPlayer from "react-native-track-player";
import { songToTrack } from "@/lib/player";

export default function AlbumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: album, isLoading } = useAlbum(id);
  const router = useRouter();
  const { setQueue, setPlaying } = usePlayerStore();

  const handlePlayAll = async (shuffle = false) => {
    if (!album?.tracks.length) return;
    const tracks = shuffle
      ? [...album.tracks].sort(() => Math.random() - 0.5)
      : album.tracks;
    setQueue(tracks);
    try {
      const playerTracks = await Promise.all(tracks.map(songToTrack));
      await TrackPlayer.reset();
      await TrackPlayer.add(playerTracks);
      await TrackPlayer.play();
      setPlaying(true);
    } catch (e) {
      console.error("Playback error:", e);
    }
  };

  const handlePlayTrack = async (track: Song) => {
    setQueue(album?.tracks ?? []);
    try {
      const playerTracks = await Promise.all((album?.tracks ?? []).map(songToTrack));
      await TrackPlayer.reset();
      await TrackPlayer.add(playerTracks);
      const idx = (album?.tracks ?? []).findIndex((t) => t.id === track.id);
      if (idx >= 0) await TrackPlayer.skip(idx);
      await TrackPlayer.play();
      setPlaying(true);
    } catch (e) {
      console.error("Playback error:", e);
    }
  };

  if (isLoading || !album) {
    return (
      <View className="flex-1 items-center justify-center bg-yt-bg">
        <Text className="text-yt-textSecondary">Loading album...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-yt-bg">
      {/* Back button */}
      <Pressable
        onPress={() => router.back()}
        className="absolute top-12 left-4 z-10 p-2"
      >
        <Text className="text-xl text-yt-textPrimary">←</Text>
      </Pressable>

      {/* Cover */}
      <View className="items-center pt-16 pb-4">
        <Image
          source={{ uri: getThumbnailUrl(album.thumbnail, 500) }}
          className="h-[250px] w-[250px] rounded-xl"
          contentFit="cover"
        />
      </View>

      {/* Info */}
      <View className="items-center px-4">
        <Text className="text-xl font-bold text-yt-textPrimary" numberOfLines={1}>
          {album.title}
        </Text>
        <Text
          className="mt-1 text-sm text-yt-textSecondary"
          onPress={() =>
            router.push({
              pathname: "/artist/[id]",
              params: { id: album.artist.id },
            })
          }
        >
          {album.artist.name}
          {album.year ? ` · ${album.year}` : ""}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row justify-center gap-4 px-4 py-4">
        <Pressable
          onPress={() => handlePlayAll(false)}
          className="rounded-full bg-yt-textPrimary px-8 py-2"
        >
          <Text className="text-sm font-bold text-yt-bg">Play</Text>
        </Pressable>
        <Pressable
          onPress={() => handlePlayAll(true)}
          className="rounded-full border border-yt-textSecondary px-8 py-2"
        >
          <Text className="text-sm font-bold text-yt-textPrimary">Shuffle</Text>
        </Pressable>
      </View>

      {/* Track list */}
      <View className="mb-8">
        <Text className="px-4 mb-2 text-sm text-yt-textSecondary">
          {album.tracks.length} songs
        </Text>
        <TrackList tracks={album.tracks} onPlay={handlePlayTrack} />
      </View>
    </ScrollView>
  );
}
