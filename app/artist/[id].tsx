import { ScrollView, View, Text, Pressable } from "react-native";
import { Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useArtist } from "@/lib/api";
import { getThumbnailUrl } from "@/lib/utils";
import { COLORS } from "@/lib/tokens";
import SongRow from "@/components/SongRow";
import MediaCard from "@/components/MediaCard";
import ArtistCard from "@/components/ArtistCard";
import SectionHeader from "@/components/SectionHeader";
import IconButton from "@/components/IconButton";
import { usePlayerStore } from "@/stores/playerStore";
import { playFromContext } from "@/lib/playback";
import { shuffleWithPin } from "@/lib/playerHelpers";

export default function ArtistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: artist, isLoading } = useArtist(id);
  const router = useRouter();
  const { currentTrack } = usePlayerStore();

  if (isLoading || !artist) {
    return (
      <View className="flex-1 items-center justify-center bg-base">
        <Text className="text-secondary">Loading artist...</Text>
      </View>
    );
  }

  const ctx = { type: "artist" as const, id: id!, title: artist.name };
  const playSongs = (index: number) => playFromContext(artist.songs, index, ctx);
  const shuffleAll = () => {
    if (!artist.songs.length) return;
    playFromContext(shuffleWithPin(artist.songs, 0), 0, ctx);
  };

  return (
    <ScrollView
      className="flex-1 bg-base"
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header image with bottom fade */}
      <View className="relative h-[300px]">
        <Image
          source={
            getThumbnailUrl(artist.headerImage, 800)
              ? { uri: getThumbnailUrl(artist.headerImage, 800) }
              : undefined
          }
          className="h-full w-full bg-surface"
          resizeMode="cover"
        />
        <LinearGradient
          colors={["transparent", COLORS.base]}
          style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 160 }}
        />
        <IconButton
          name="arrow-back"
          color={COLORS.primary}
          onPress={() => router.back()}
          className="absolute left-2 top-12"
        />
        <Text className="absolute bottom-4 left-4 text-3xl font-bold text-primary">
          {artist.name}
        </Text>
      </View>

      {/* Actions */}
      <View className="flex-row items-center gap-3 px-4 py-3">
        <Pressable
          onPress={shuffleAll}
          className="flex-row items-center gap-2 rounded-pill bg-accent px-6 py-2.5 active:opacity-90"
        >
          <Text className="text-sm font-bold text-black">Shuffle</Text>
        </Pressable>
        <Pressable className="rounded-pill border border-secondary px-6 py-2.5 active:opacity-80">
          <Text className="text-sm font-bold text-primary">Radio</Text>
        </Pressable>
      </View>

      {artist.songs.length > 0 && (
        <View className="mb-8">
          <SectionHeader title="Top songs" />
          {artist.songs.slice(0, 5).map((song, i) => (
            <SongRow
              key={`${song.id}-${i}`}
              song={song}
              index={i}
              active={currentTrack?.id === song.id}
              onPlay={() => playSongs(i)}
            />
          ))}
        </View>
      )}

      {artist.albums.length > 0 && (
        <View className="mb-8">
          <SectionHeader title="Albums" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4 gap-3">
            {artist.albums.map((album) => (
              <MediaCard
                key={album.id}
                item={album}
                onPress={() => router.push({ pathname: "/album/[id]", params: { id: album.id } })}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {artist.singles.length > 0 && (
        <View className="mb-8">
          <SectionHeader title="Singles" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4 gap-3">
            {artist.singles.map((single) => (
              <MediaCard
                key={single.id}
                item={single}
                onPress={() => router.push({ pathname: "/album/[id]", params: { id: single.id } })}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {artist.relatedArtists.length > 0 && (
        <View className="mb-8">
          <SectionHeader title="Fans might also like" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4 gap-3">
            {artist.relatedArtists.map((related) => (
              <ArtistCard
                key={related.id}
                artist={related}
                onPress={() => router.push({ pathname: "/artist/[id]", params: { id: related.id } })}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}
