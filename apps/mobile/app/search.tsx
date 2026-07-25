import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSearch, useSearchSuggestions } from "@/lib/api";
import { storage } from "@/lib/storage";
import SongRow from "@/components/SongRow";
import MediaCard from "@/components/MediaCard";
import ArtistCard from "@/components/ArtistCard";
import { usePlayerStore } from "@/stores/playerStore";
import type { Song, SearchFilter } from "@ytmusic/shared-types";
import TrackPlayer from "react-native-track-player";
import { songToTrack } from "@/lib/player";

const FILTERS: SearchFilter[] = ["songs", "videos", "albums", "artists", "playlists"];

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? "");
  const [activeFilter, setActiveFilter] = useState<SearchFilter | undefined>();
  const { setCurrentTrack, setPlaying } = usePlayerStore();

  const { data: results } = useSearch(query, activeFilter);
  const { data: suggestions } = useSearchSuggestions(query);
  const recentSearches = storage.getRecentSearches();

  const handleSearch = useCallback(
    (q: string) => {
      if (q.trim()) {
        setQuery(q);
        storage.addRecentSearch(q.trim());
      }
    },
    []
  );

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

  const showSuggestions = query.length > 0 && suggestions && suggestions.length > 0;
  const showResults = results && query.length > 0;

  return (
    <View className="flex-1 bg-yt-bg">
      {/* Search bar */}
      <View className="flex-row items-center px-4 pt-12 pb-2 gap-2">
        <Pressable onPress={() => router.back()} className="p-2">
          <Text className="text-xl text-yt-textPrimary">←</Text>
        </Pressable>
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => handleSearch(query)}
          placeholder="Search songs, artists, albums..."
          placeholderTextColor="#AAAAAA"
          className="flex-1 rounded-full bg-yt-surface px-4 py-2.5 text-sm text-yt-textPrimary"
          autoFocus
          returnKeyType="search"
        />
      </View>

      {/* Filter chips */}
      {showResults && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="px-4 gap-2 pb-2"
        >
          <Pressable
            onPress={() => setActiveFilter(undefined)}
            className={`rounded-full px-4 py-1.5 ${
              !activeFilter ? "bg-yt-textPrimary" : "bg-yt-surface"
            }`}
          >
            <Text
              className={`text-sm ${
                !activeFilter ? "font-bold text-yt-bg" : "text-yt-textPrimary"
              }`}
            >
              All
            </Text>
          </Pressable>
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setActiveFilter(f)}
              className={`rounded-full px-4 py-1.5 ${
                activeFilter === f ? "bg-yt-textPrimary" : "bg-yt-surface"
              }`}
            >
              <Text
                className={`text-sm capitalize ${
                  activeFilter === f ? "font-bold text-yt-bg" : "text-yt-textPrimary"
                }`}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Suggestions */}
      {showSuggestions && (
        <ScrollView className="px-4">
          {suggestions!.map((s, i) => (
            <Pressable
              key={`${s}-${i}`}
              onPress={() => {
                setQuery(s);
                handleSearch(s);
              }}
              className="flex-row items-center py-3 border-b border-yt-surface2"
            >
              <Text className="mr-3 text-yt-textSecondary">🔍</Text>
              <Text className="text-sm text-yt-textPrimary">{s}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Recent searches (when no query) */}
      {!query && recentSearches.length > 0 && (
        <View className="px-4 pt-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-bold text-yt-textPrimary">
              Recent searches
            </Text>
            <Pressable onPress={() => storage.clearRecentSearches()}>
              <Text className="text-sm text-yt-textSecondary">Clear</Text>
            </Pressable>
          </View>
          {recentSearches.map((s, i) => (
            <Pressable
              key={`${s}-${i}`}
              onPress={() => {
                setQuery(s);
                handleSearch(s);
              }}
              className="flex-row items-center py-3 border-b border-yt-surface2"
            >
              <Text className="mr-3 text-yt-textSecondary">🕐</Text>
              <Text className="text-sm text-yt-textPrimary">{s}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Search results */}
      {showResults && (
        <ScrollView className="flex-1 pt-2">
          {/* Top result */}
          {results!.topResult && (
            <View className="px-4 mb-4">
              <Text className="text-base font-bold text-yt-textPrimary mb-2">
                Top Result
              </Text>
              <Pressable className="flex-row items-center bg-yt-surface rounded-xl p-3">
                <MediaCard item={{
                  id: results!.topResult.id,
                  title: results!.topResult.title,
                  thumbnail: results!.topResult.thumbnail,
                } as any} />
                <View className="ml-3 flex-1">
                  <Text className="text-base font-semibold text-yt-textPrimary" numberOfLines={1}>
                    {results!.topResult.title}
                  </Text>
                  <Text className="text-xs text-yt-textSecondary" numberOfLines={1}>
                    {results!.topResult.subtitle}
                  </Text>
                </View>
              </Pressable>
            </View>
          )}

          {/* Songs */}
          {results!.songs.length > 0 && (!activeFilter || activeFilter === "songs") && (
            <View className="mb-4">
              <Text className="px-4 mb-2 text-base font-bold text-yt-textPrimary">
                Songs
              </Text>
              {results!.songs.slice(0, 5).map((song, i) => (
                <SongRow
                  key={`${song.id}-${i}`}
                  song={song}
                  onPlay={handlePlaySong}
                />
              ))}
            </View>
          )}

          {/* Artists */}
          {results!.artists.length > 0 && (!activeFilter || activeFilter === "artists") && (
            <View className="mb-4">
              <Text className="px-4 mb-2 text-base font-bold text-yt-textPrimary">
                Artists
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="px-4 gap-3"
              >
                {results!.artists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    onPress={() =>
                      router.push({
                        pathname: "/artist/[id]",
                        params: { id: artist.id },
                      })
                    }
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Albums */}
          {results!.albums.length > 0 && (!activeFilter || activeFilter === "albums") && (
            <View className="mb-4">
              <Text className="px-4 mb-2 text-base font-bold text-yt-textPrimary">
                Albums
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="px-4 gap-3"
              >
                {results!.albums.map((album) => (
                  <MediaCard
                    key={album.id}
                    item={album}
                    onPress={() =>
                      router.push({
                        pathname: "/album/[id]",
                        params: { id: album.id },
                      })
                    }
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Playlists */}
          {results!.playlists.length > 0 && (!activeFilter || activeFilter === "playlists") && (
            <View className="mb-4">
              <Text className="px-4 mb-2 text-base font-bold text-yt-textPrimary">
                Playlists
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="px-4 gap-3"
              >
                {results!.playlists.map((pl) => (
                  <MediaCard
                    key={pl.id}
                    item={pl}
                    onPress={() =>
                      router.push({
                        pathname: "/playlist/[id]",
                        params: { id: pl.id },
                      })
                    }
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
