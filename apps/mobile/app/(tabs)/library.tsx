import { View, Text, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { useLibraryStore } from "@/stores/libraryStore";
import { Image } from "expo-image";

const QUICK_ACTIONS = [
  { id: "liked", label: "Liked Songs", icon: "❤️", count: 0 },
  { id: "albums", label: "Albums", icon: "💿", count: 0 },
  { id: "playlists", label: "Playlists", icon: "📋", count: 0 },
  { id: "artists", label: "Artists", icon: "🎤", count: 0 },
];

export default function LibraryScreen() {
  const router = useRouter();
  const { likedSongIds, savedAlbumIds, savedPlaylistIds } = useLibraryStore();

  const actions = QUICK_ACTIONS.map((a) => {
    switch (a.id) {
      case "liked":
        return { ...a, count: likedSongIds.size };
      case "albums":
        return { ...a, count: savedAlbumIds.size };
      case "playlists":
        return { ...a, count: savedPlaylistIds.size };
      default:
        return a;
    }
  });

  return (
    <View className="flex-1 bg-yt-bg pt-2">
      <Text className="px-4 mb-4 text-2xl font-bold text-yt-textPrimary">
        Library
      </Text>

      <FlatList
        data={actions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            className="flex-row items-center bg-yt-surface rounded-xl mx-4 mb-3 px-4 py-3"
          >
            <Text className="text-2xl mr-3">{item.icon}</Text>
            <View className="flex-1">
              <Text className="text-base font-medium text-yt-textPrimary">
                {item.label}
              </Text>
              <Text className="text-xs text-yt-textSecondary">
                {item.count} items
              </Text>
            </View>
            <Text className="text-yt-textSecondary">›</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
