import { ScrollView, View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { usePlaylist } from "@/lib/api";
import { getThumbnailUrl } from "@/lib/utils";
import TrackList from "@/components/TrackList";
import { usePlayerStore } from "@/stores/playerStore";
import type { Song } from "@ytmusic/shared-types";
import TrackPlayer from "react-native-track-player";
import { songToTrack } from "@/lib/player";

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: playlist, isLoading } = usePlaylist(id);
  const router = useRouter();
  const { setQueue, setPlaying } = usePlayerStore();

  const handlePlayAll = async (shuffle = false) => {
    if (!playlist?.tracks.length) return;
    const tracks = shuffle
      ? [...playlist.tracks].sort(() => Math.random() - 0.5)
      : playlist.tracks;
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
    setQueue(playlist?.tracks ?? []);
    try {
      const playerTracks = await Promise.all((playlist?.tracks ?? []).map(songToTrack));
      await TrackPlayer.reset();
      await TrackPlayer.add(playerTracks);
      const idx = (playlist?.tracks ?? []).findIndex((t) => t.id === track.id);
      if (idx >= 0) await TrackPlayer.skip(idx);
      await TrackPlayer.play();
      setPlaying(true);
    } catch (e) {
      console.error("Playback error:", e);
    }
  };

  if (isLoading || !playlist) {
    return (
      <View className="flex-1 items-center justify-center bg-yt-bg">
        <Text className="text-yt-textSecondary">Loading playlist...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-yt-bg">
      <Pressable
        onPress={() => router.back()}
        className="absolute top-12 left-4 z-10 p-2"
      >
        <Text className="text-xl text-yt-textPrimary">←</Text>
      </Pressable>

      {/* Cover */}
      <View className="items-center pt-16 pb-4">
        <Image
          source={{ uri: getThumbnailUrl(playlist.thumbnail, 500) }}
          className="h-[250px] w-[250px] rounded-xl"
          contentFit="cover"
        />
      </View>

      {/* Info */}
      <View className="items-center px-4">
        <Text className="text-xl font-bold text-yt-textPrimary" numberOfLines={1}>
          {playlist.title}
        </Text>
        {playlist.artist && (
          <Text
            className="mt-1 text-sm text-yt-textSecondary"
            onPress={() =>
              router.push({
                pathname: "/artist/[id]",
                params: { id: playlist.artist!.id },
              })
            }
          >
            {playlist.artist.name}
          </Text>
        )}
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
          {playlist.trackCount} songs
        </Text>
        <TrackList tracks={playlist.tracks} onPlay={handlePlayTrack} />
      </View>
    </ScrollView>
  );
}
