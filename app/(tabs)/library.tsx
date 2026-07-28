import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useLibraryStore } from "@/stores/libraryStore";
import ChipRow from "@/components/ChipRow";
import IconButton from "@/components/IconButton";
import { COLORS } from "@/lib/tokens";

const CHIPS = [
  { id: "playlists", title: "Playlists" },
  { id: "albums", title: "Albums" },
  { id: "artists", title: "Artists" },
  { id: "downloaded", title: "Downloaded" },
];

type IconName = keyof typeof Ionicons.glyphMap;

export default function LibraryScreen() {
  const { likedSongIds, savedAlbumIds, savedPlaylistIds } = useLibraryStore();
  const [chip, setChip] = useState("playlists");
  const [grid, setGrid] = useState(false);

  const rows: { id: string; label: string; icon: IconName; count: number }[] = [
    { id: "playlists", label: "Playlists", icon: "list", count: savedPlaylistIds.size },
    { id: "albums", label: "Albums", icon: "albums", count: savedAlbumIds.size },
    { id: "artists", label: "Artists", icon: "person", count: 0 },
  ];

  return (
    <ScrollView
      className="flex-1 bg-base"
      contentContainerStyle={{ paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
    >
      <Text className="px-4 pb-3 pt-2 text-2xl font-bold text-primary">
        Your Library
      </Text>

      <View className="pb-3">
        <ChipRow chips={CHIPS} activeId={chip} onChipPress={(c) => setChip(c.id)} />
      </View>

      {/* Sort + view toggle */}
      <View className="mb-2 flex-row items-center justify-between px-4">
        <Pressable className="flex-row items-center active:opacity-70">
          <Ionicons name="caret-down" size={14} color={COLORS.secondary} />
          <Text className="ml-1 text-[13px] text-secondary">Recents</Text>
        </Pressable>
        <IconButton
          name={grid ? "list-outline" : "grid-outline"}
          size="sm"
          color={COLORS.secondary}
          onPress={() => setGrid((v) => !v)}
        />
      </View>

      {/* Pinned Liked Songs gradient tile */}
      <Pressable className="mx-4 mb-2 overflow-hidden rounded-card active:opacity-90">
        <LinearGradient
          colors={["#4F46E5", COLORS.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flexDirection: "row", alignItems: "center", padding: 12 }}
        >
          <View className="h-14 w-14 items-center justify-center rounded-thumb bg-white/20">
            <Ionicons name="heart" size={26} color={COLORS.primary} />
          </View>
          <View className="ml-3">
            <Text className="text-[15px] font-bold text-primary">Liked Songs</Text>
            <Text className="text-[13px] text-white/80">{likedSongIds.size} songs</Text>
          </View>
        </LinearGradient>
      </Pressable>

      {/* Library rows */}
      {rows.map((r) => (
        <Pressable
          key={r.id}
          className="flex-row items-center px-4 py-3 active:bg-surface"
        >
          <View className="h-14 w-14 items-center justify-center rounded-thumb bg-surface-raised">
            <Ionicons name={r.icon} size={24} color={COLORS.secondary} />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-[15px] font-medium text-primary">{r.label}</Text>
            <Text className="text-[13px] text-secondary">{r.count} saved</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.muted} />
        </Pressable>
      ))}
    </ScrollView>
  );
}
