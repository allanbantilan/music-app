import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { usePlayerStore } from "@/stores/playerStore";
import { getThumbnailUrl } from "@/lib/utils";
import Seekbar from "@/components/Seekbar";
import TrackPlayer from "react-native-track-player";

export default function PlayerSheet() {
  const {
    currentTrack,
    isPlaying,
    setPlaying,
    shuffle,
    repeat,
    toggleShuffle,
    cycleRepeat,
  } = usePlayerStore();
  const [liked, setLiked] = useState(false);

  if (!currentTrack) return null;

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

  const togglePlay = async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
      setPlaying(false);
    } else {
      await TrackPlayer.play();
      setPlaying(true);
    }
  };

  const prev = async () => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch {}
  };

  const next = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch {}
  };

  return (
    <View className="flex-1">
      {/* Blurred artwork backdrop + dark gradient — YTM ambient look */}
      {art ? (
        <Image
          source={{ uri: art }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          blurRadius={40}
        />
      ) : null}
      <LinearGradient
        colors={["rgba(3,3,3,0.35)", "rgba(3,3,3,0.85)", "#030303"]}
        style={StyleSheet.absoluteFill}
      />

      <View
        className="flex-1 items-center justify-center px-6 py-4"
        onLayout={(e) => setAreaH(e.nativeEvent.layout.height)}
      >
        {/* Artwork — blank dark box if the track has no thumbnail */}
        <Image
          source={art ? { uri: art } : undefined}
          className="rounded-xl bg-yt-surface"
          style={{ width: artSize, height: artSize }}
          resizeMode="cover"
        />

        {/* Title / Artist + like / menu */}
        <View className="mt-6 w-full flex-row items-center">
          <View className="flex-1 pr-3">
            <Text
              className="text-2xl font-bold text-yt-textPrimary"
              numberOfLines={1}
            >
              {currentTrack.title}
            </Text>
            <Text
              className="mt-1 text-base text-yt-textSecondary"
              numberOfLines={1}
            >
              {currentTrack.artist?.name ?? ""}
            </Text>
          </View>
          <Pressable onPress={() => setLiked((v) => !v)} hitSlop={10} className="px-2">
            <Ionicons
              name={liked ? "thumbs-up" : "thumbs-up-outline"}
              size={24}
              color="#fff"
            />
          </Pressable>
          <Pressable hitSlop={10} className="pl-2">
            <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
          </Pressable>
        </View>

        {/* Scrubber */}
        <View className="mt-5 w-full">
          <Seekbar />
        </View>

        {/* Controls */}
        <View className="mt-6 w-full flex-row items-center justify-between">
          <Pressable onPress={toggleShuffle} hitSlop={12}>
            <Ionicons name="shuffle" size={24} color={shuffle ? "#fff" : "#AAAAAA"} />
          </Pressable>

          <Pressable onPress={prev} hitSlop={12}>
            <Ionicons name="play-skip-back" size={36} color="#fff" />
          </Pressable>

          <Pressable
            onPress={togglePlay}
            className="h-[68px] w-[68px] items-center justify-center rounded-full bg-white"
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={34}
              color="#030303"
              style={{ marginLeft: isPlaying ? 0 : 3 }}
            />
          </Pressable>

          <Pressable onPress={next} hitSlop={12}>
            <Ionicons name="play-skip-forward" size={36} color="#fff" />
          </Pressable>

          <Pressable onPress={cycleRepeat} hitSlop={12}>
            <MaterialCommunityIcons
              name={repeat === "one" ? "repeat-once" : "repeat"}
              size={24}
              color={repeat !== "off" ? "#fff" : "#AAAAAA"}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
