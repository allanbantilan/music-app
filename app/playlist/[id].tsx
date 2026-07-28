import { ScrollView, View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePlaylist } from "@/lib/api";
import { usePlayerStore } from "@/stores/playerStore";
import DetailHeader from "@/components/DetailHeader";
import SongRow from "@/components/SongRow";
import { playFromContext } from "@/lib/playback";

export default function PlaylistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: playlist, isLoading } = usePlaylist(id);
  const router = useRouter();
  const { currentTrack, isPlaying, playbackContext } = usePlayerStore();

  const play = (index: number) => {
    if (!playlist?.tracks.length) return;
    playFromContext(playlist.tracks, index, {
      type: "playlist",
      id: id!,
      title: playlist.title,
    });
  };

  if (isLoading || !playlist) {
    return (
      <View className="flex-1 items-center justify-center bg-base">
        <Text className="text-secondary">Loading playlist...</Text>
      </View>
    );
  }

  const contextPlaying = isPlaying && playbackContext?.id === id;
  const meta =
    playlist.artist?.name ||
    `Playlist · ${playlist.trackCount ?? playlist.tracks.length} songs`;

  return (
    <ScrollView
      className="flex-1 bg-base"
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      <DetailHeader
        thumbnail={playlist.thumbnail}
        title={playlist.title}
        meta={meta}
        isPlaying={contextPlaying}
        onBack={() => router.back()}
        onPlay={() => play(0)}
        onMetaPress={
          playlist.artist
            ? () =>
                router.push({
                  pathname: "/artist/[id]",
                  params: { id: playlist.artist!.id },
                })
            : undefined
        }
      />

      <View className="mt-4">
        {playlist.tracks.map((t, i) => (
          <SongRow
            key={`${t.id}-${i}`}
            song={t}
            active={currentTrack?.id === t.id}
            onPlay={() => play(i)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
