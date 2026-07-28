import { ScrollView, View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAlbum } from "@/lib/api";
import { usePlayerStore } from "@/stores/playerStore";
import DetailHeader from "@/components/DetailHeader";
import SongRow from "@/components/SongRow";
import { playFromContext } from "@/lib/playback";

export default function AlbumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: album, isLoading } = useAlbum(id);
  const router = useRouter();
  const { currentTrack, isPlaying, playbackContext } = usePlayerStore();

  const play = (index: number) => {
    if (!album?.tracks.length) return;
    playFromContext(album.tracks, index, {
      type: "album",
      id: id!,
      title: album.title,
    });
  };

  if (isLoading || !album) {
    return (
      <View className="flex-1 items-center justify-center bg-base">
        <Text className="text-secondary">Loading album...</Text>
      </View>
    );
  }

  const contextPlaying = isPlaying && playbackContext?.id === id;

  return (
    <ScrollView
      className="flex-1 bg-base"
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      <DetailHeader
        thumbnail={album.thumbnail}
        title={album.title}
        meta={`${album.artist.name}${album.year ? ` · ${album.year}` : ""} · ${album.tracks.length} songs`}
        isPlaying={contextPlaying}
        onBack={() => router.back()}
        onPlay={() => play(0)}
        onMetaPress={() =>
          router.push({ pathname: "/artist/[id]", params: { id: album.artist.id } })
        }
      />

      <View className="mt-4">
        {album.tracks.map((t, i) => (
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
