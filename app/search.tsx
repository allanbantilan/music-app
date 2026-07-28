import { useState, useCallback } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSearch, useSearchSuggestions } from "@/lib/api";
import { storage } from "@/lib/storage";
import SongRow from "@/components/SongRow";
import MediaCard from "@/components/MediaCard";
import ArtistCard from "@/components/ArtistCard";
import ChipRow from "@/components/ChipRow";
import SectionHeader from "@/components/SectionHeader";
import IconButton from "@/components/IconButton";
import { COLORS } from "@/lib/tokens";
import { playFromContext } from "@/lib/playback";
import type { Song, SearchFilter } from "@ytmusic/shared-types";

const TYPE_CHIPS = [
  { id: "all", title: "All" },
  { id: "songs", title: "Songs" },
  { id: "videos", title: "Videos" },
  { id: "albums", title: "Albums" },
  { id: "artists", title: "Artists" },
  { id: "playlists", title: "Playlists" },
];

// Browse-all genre tiles with a fixed brand-ish palette (idle state, §3).
const GENRES = [
  { title: "Pop", color: "#8B5CF6" },
  { title: "Hip-Hop", color: "#EC4899" },
  { title: "Rock", color: "#EF4444" },
  { title: "Chill", color: "#0EA5E9" },
  { title: "Workout", color: "#F59E0B" },
  { title: "Focus", color: "#10B981" },
  { title: "Party", color: "#F43F5E" },
  { title: "OPM", color: "#6366F1" },
];

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? "");
  const [filter, setFilter] = useState<string>("all");

  const activeFilter = filter === "all" ? undefined : (filter as SearchFilter);
  const { data: results } = useSearch(query, activeFilter);
  const { data: suggestions } = useSearchSuggestions(query);

  const submit = useCallback((q: string) => {
    if (q.trim()) storage.addRecentSearch(q.trim());
  }, []);

  const playSong = (song: Song) => {
    const songs = results?.songs ?? [];
    const index = Math.max(0, songs.findIndex((s) => s.id === song.id));
    playFromContext(songs, index, { type: "search", id: query, title: `"${query}"` });
  };

  const hasResults = !!results && query.length > 0;

  return (
    <View className="flex-1 bg-base" style={{ paddingTop: insets.top }}>
      {/* Search bar */}
      <View className="flex-row items-center gap-2 px-4 pb-2 pt-2">
        <IconButton name="arrow-back" color={COLORS.primary} onPress={() => router.back()} />
        <View className="flex-1 flex-row items-center rounded-pill bg-surface-raised px-4">
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => submit(query)}
            placeholder="Songs, artists, albums..."
            placeholderTextColor={COLORS.muted}
            className="flex-1 py-2.5 text-[15px] text-primary"
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <IconButton name="close-circle" size="sm" color={COLORS.muted} onPress={() => setQuery("")} />
          ) : (
            <IconButton name="mic-outline" size="sm" color={COLORS.secondary} />
          )}
        </View>
      </View>

      {/* Result-type chips */}
      {hasResults && (
        <View className="pb-2">
          <ChipRow chips={TYPE_CHIPS} activeId={filter} onChipPress={(c) => setFilter(c.id)} />
        </View>
      )}

      {/* Idle: suggestions + browse-all genre grid */}
      {!hasResults && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
          {query.length > 0 && suggestions && suggestions.length > 0 && (
            <View className="px-4">
              {suggestions.map((s, i) => (
                <Pressable
                  key={`${s}-${i}`}
                  onPress={() => {
                    setQuery(s);
                    submit(s);
                  }}
                  className="flex-row items-center border-b border-white/10 py-3 active:opacity-70"
                >
                  <IconButton name="search-outline" size="sm" color={COLORS.muted} />
                  <Text className="ml-3 text-[15px] text-primary">{s}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {query.length === 0 && (
            <View className="mt-2">
              <SectionHeader title="Browse all" />
              <View className="flex-row flex-wrap gap-3 px-4">
                {GENRES.map((g) => (
                  <Pressable
                    key={g.title}
                    onPress={() => setQuery(g.title)}
                    className="h-24 w-[47%] overflow-hidden rounded-card p-3 active:opacity-90"
                    style={{ backgroundColor: g.color }}
                  >
                    <Text className="text-base font-bold text-white">{g.title}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* Results */}
      {hasResults && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
          {results!.songs.length > 0 && (!activeFilter || activeFilter === "songs") && (
            <View className="mb-6">
              <SectionHeader title="Songs" />
              {results!.songs.slice(0, 8).map((song, i) => (
                <SongRow key={`${song.id}-${i}`} song={song} onPlay={playSong} />
              ))}
            </View>
          )}

          {results!.artists.length > 0 && (!activeFilter || activeFilter === "artists") && (
            <View className="mb-6">
              <SectionHeader title="Artists" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4 gap-3">
                {results!.artists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    onPress={() => router.push({ pathname: "/artist/[id]", params: { id: artist.id } })}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {results!.albums.length > 0 && (!activeFilter || activeFilter === "albums") && (
            <View className="mb-6">
              <SectionHeader title="Albums" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4 gap-3">
                {results!.albums.map((album) => (
                  <MediaCard
                    key={album.id}
                    item={album}
                    onPress={() => router.push({ pathname: "/album/[id]", params: { id: album.id } })}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {results!.playlists.length > 0 && (!activeFilter || activeFilter === "playlists") && (
            <View className="mb-6">
              <SectionHeader title="Playlists" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="px-4 gap-3">
                {results!.playlists.map((pl) => (
                  <MediaCard
                    key={pl.id}
                    item={pl}
                    onPress={() => router.push({ pathname: "/playlist/[id]", params: { id: pl.id } })}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
