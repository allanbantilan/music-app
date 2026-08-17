import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { Image } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { usePlayerStore } from "@/stores/playerStore";
import { useLibraryStore } from "@/stores/libraryStore";
import { getThumbnailUrl } from "@/lib/utils";
import { COLORS } from "@/lib/tokens";
import Seekbar from "@/components/Seekbar";
import IconButton from "@/components/IconButton";
import Marquee from "@/components/anim/Marquee";
import BufferingRing from "@/components/anim/BufferingRing";
import { togglePlay, prev, next, toggleShuffle, cycleRepeat } from "@/lib/playback";

export default function PlayerSheet() {
  const { currentTrack, isPlaying, isBuffering, shuffle, repeat } = usePlayerStore();
  const likedIds = useLibraryStore((s) => s.likedSongIds);
  const toggleLike = useLibraryStore((s) => s.toggleLikeSong);
  const router = useRouter();

  if (!currentTrack) return null;

  const liked = likedIds.has(currentTrack.id);
  const artistId = currentTrack.artist?.id;
  const goArtist = () => {
    if (!artistId) return;
    router.back(); // collapse to mini player first (§6)
    setTimeout(() => router.push({ pathname: "/artist/[id]", params: { id: artistId } }), 60);
  };

  const art = getThumbnailUrl(currentTrack.thumbnail, 600);
  // Size artwork from the MEASURED player area (not the window) so it always
  // fits alongside title + seekbar + controls (~240px) — never overlaps the
  // header or the bottom Up-Next panel on any screen size.
  const { width } = Dimensions.get("window");
  const [areaH, setAreaH] = useState(0);
  const artSize = Math.max(
    120,
    Math.min(width * 0.72, 300, areaH ? areaH - 240 : width * 0.72)
  );

  return (
    <View className="flex-1">
      {/* Ambient: full-bleed artwork → expo-blur → dark gradient (YTM look) */}
      {art ? (
        <Image source={{ uri: art }} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : null}
      <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={["rgba(10,10,10,0.25)", "rgba(10,10,10,0.85)", "#0A0A0A"]}
        style={StyleSheet.absoluteFill}
      />

      <View
        className="flex-1 items-center justify-center px-6 py-4"
        onLayout={(e) => setAreaH(e.nativeEvent.layout.height)}
      >
        {/* Artwork — plain guarded Image (no reanimated: its entering snapshot
            was setting a native null source). Blank box if no thumbnail. */}
        {art ? (
          <Image
            source={{ uri: art }}
            className="rounded-card bg-surface"
            style={{ width: artSize, height: artSize }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="rounded-card bg-surface"
            style={{ width: artSize, height: artSize }}
          />
        )}

        {/* Title / Artist + like / menu */}
        <View className="mt-6 w-full flex-row items-center">
          <View className="flex-1 pr-3">
            <Marquee
              text={currentTrack.title}
              className="text-xl font-bold text-primary"
            />
            <Text
              onPress={goArtist}
              className="mt-1 text-[15px] text-secondary"
              numberOfLines={1}
            >
              {currentTrack.artist?.name ?? ""}
            </Text>
          </View>
          <IconButton
            name={liked ? "heart" : "heart-outline"}
            size="md"
            color={liked ? COLORS.accent : COLORS.primary}
            onPress={() => toggleLike(currentTrack.id)}
            className="px-2"
          />
          <IconButton name="ellipsis-vertical" size="md" color={COLORS.primary} className="pl-2" />
        </View>

        {/* Scrubber */}
        <View className="mt-5 w-full">
          <Seekbar />
        </View>

        {/* Transport */}
        <View className="mt-6 w-full flex-row items-center justify-between">
          <IconButton
            name="shuffle"
            size="md"
            color={shuffle ? COLORS.accent : COLORS.secondary}
            onPress={toggleShuffle}
          />
          <IconButton name="play-skip-back" size="lg" color={COLORS.primary} onPress={prev} />

          <Pressable
            onPress={togglePlay}
            className="h-16 w-16 items-center justify-center rounded-full bg-primary active:opacity-90"
          >
            {isBuffering && <BufferingRing size={64} color={COLORS.accent} />}
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={30}
              color={COLORS.base}
              style={{ marginLeft: isPlaying ? 0 : 3 }}
            />
          </Pressable>

          <IconButton name="play-skip-forward" size="lg" color={COLORS.primary} onPress={next} />

          {/* repeat: Ionicons repeat + "1" badge for repeat-one (§9) */}
          <Pressable onPress={cycleRepeat} hitSlop={12} className="active:opacity-80">
            <Ionicons
              name="repeat"
              size={24}
              color={repeat !== "off" ? COLORS.accent : COLORS.secondary}
            />
            {repeat === "one" && (
              <View className="absolute -right-1 -top-1 h-3.5 w-3.5 items-center justify-center rounded-full bg-accent">
                <Text className="text-[9px] font-bold text-black">1</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
