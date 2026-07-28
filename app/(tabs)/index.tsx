import { ScrollView, View, Text, Pressable } from "react-native";
import { Image } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useHomeFeed } from "@/lib/api";
import ChipRow from "@/components/ChipRow";
import ShelfCarousel from "@/components/ShelfCarousel";
import IconButton from "@/components/IconButton";
import Skeleton from "@/components/anim/Skeleton";
import { getThumbnailUrl } from "@/lib/utils";
import { COLORS } from "@/lib/tokens";
import type { MoodChip, Song, Shelf } from "@ytmusic/shared-types";
import { playFromContext } from "@/lib/playback";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const FILTERS: MoodChip[] = [
  { id: "all", title: "All" } as any,
  { id: "music", title: "Music" } as any,
  { id: "podcasts", title: "Podcasts" } as any,
];

export default function HomeScreen() {
  const router = useRouter();
  const { data: feed, isLoading, error } = useHomeFeed();
  const [activeChip, setActiveChip] = useState("all");

  const playSong = (song: Song, context: Song[]) => {
    const index = Math.max(0, context.findIndex((t) => t.id === song.id));
    playFromContext(context, index, { type: "home", id: "home", title: "Home" });
  };

  const openCard = (shelf: Shelf, item: any) => {
    if (shelf.type === "card_album")
      router.push({ pathname: "/album/[id]", params: { id: item.id } });
    else if (shelf.type === "card_artist")
      router.push({ pathname: "/artist/[id]", params: { id: item.id } });
    else router.push({ pathname: "/playlist/[id]", params: { id: item.id } });
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-base px-4 pt-4">
        <Skeleton className="h-8 w-40 rounded-md" />
        <View className="mt-4 flex-row gap-2">
          <Skeleton className="h-8 w-16 rounded-pill" />
          <Skeleton className="h-8 w-20 rounded-pill" />
          <Skeleton className="h-8 w-16 rounded-pill" />
        </View>
        <View className="mt-6 flex-row flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-[48%] rounded-card" />
          ))}
        </View>
        <Skeleton className="mt-8 h-6 w-32 rounded-md" />
        <View className="mt-3 flex-row gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[148px] w-[148px] rounded-thumb" />
          ))}
        </View>
      </View>
    );
  }
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-base px-6">
        <Text className="text-center text-secondary">
          {String((error as any)?.message ?? error)}
        </Text>
      </View>
    );
  }

  const shelves = feed?.shelves ?? [];
  const chips = feed?.moods?.length ? feed.moods : FILTERS;
  // Quick-pick grid uses the first song shelf; the rest become carousels.
  const quick = shelves.find((s) => s.type === "compact_song");
  const quickItems = (quick?.items ?? []).slice(0, 8) as Song[];
  const carousels = shelves.filter((s) => s !== quick);
  const hero = carousels.find((s) => s.type === "card_playlist")?.items?.[0] as any;

  return (
    <ScrollView
      className="flex-1 bg-base"
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-2 pt-2">
        <Text className="text-2xl font-bold text-primary">{greeting()}</Text>
        <View className="flex-row items-center gap-4">
          <IconButton name="notifications-outline" color={COLORS.primary} />
          <IconButton name="time-outline" color={COLORS.primary} />
          <IconButton
            name="settings-outline"
            color={COLORS.primary}
            onPress={() => router.push("/search")}
          />
        </View>
      </View>

      {/* Filter chips */}
      <View className="pb-4 pt-1">
        <ChipRow
          chips={chips as any}
          activeId={activeChip}
          onChipPress={(c) => {
            setActiveChip(c.id);
            if (c.id !== "all") router.push({ pathname: "/search", params: { q: c.title } });
          }}
        />
      </View>

      {/* Quick-pick grid (2-col compact tiles) */}
      {quickItems.length > 0 && (
        <View className="mb-8 flex-row flex-wrap gap-2 px-4">
          {quickItems.map((song, i) => {
            const uri = getThumbnailUrl(song.thumbnail, 120);
            return (
              <Pressable
                key={`${song.id}-${i}`}
                onPress={() => playSong(song, quickItems)}
                className="w-[48%] flex-row items-center overflow-hidden rounded-card bg-surface-raised active:opacity-80"
              >
                <Image
                  source={uri ? { uri } : undefined}
                  className="h-14 w-14 bg-surface"
                  resizeMode="cover"
                />
                <Text
                  className="mx-2 flex-1 text-[13px] font-medium text-primary"
                  numberOfLines={2}
                >
                  {song.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Carousels, with a hero banner injected mid-feed */}
      {carousels.map((shelf, i) => (
        <View key={shelf.id}>
          {i === 2 && hero && (
            <Pressable
              onPress={() => router.push({ pathname: "/playlist/[id]", params: { id: hero.id } })}
              className="mx-4 mb-8 aspect-video overflow-hidden rounded-card bg-surface-raised active:opacity-90"
            >
              <Image
                source={
                  getThumbnailUrl(hero.thumbnail, 600)
                    ? { uri: getThumbnailUrl(hero.thumbnail, 600) }
                    : undefined
                }
                className="absolute h-full w-full"
                resizeMode="cover"
              />
              <LinearGradient
                colors={["transparent", "rgba(10,10,10,0.92)"]}
                style={{ position: "absolute", left: 0, right: 0, bottom: 0, top: "35%" }}
              />
              <View className="absolute bottom-0 p-4">
                <Text className="text-xs font-semibold uppercase tracking-wide text-secondary">
                  Featured playlist
                </Text>
                <Text className="mt-1 text-xl font-bold text-primary" numberOfLines={2}>
                  {hero.title}
                </Text>
              </View>
            </Pressable>
          )}
          <ShelfCarousel
            shelf={shelf}
            onItemPress={(item) =>
              shelf.type === "compact_song"
                ? playSong(item as Song, shelf.items as Song[])
                : openCard(shelf, item)
            }
          />
        </View>
      ))}
    </ScrollView>
  );
}
