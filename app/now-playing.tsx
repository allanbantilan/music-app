import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PlayerSheet from "@/components/PlayerSheet";
import { usePlayerStore } from "@/stores/playerStore";
import { formatDuration } from "@/lib/utils";
import type { Song } from "@ytmusic/shared-types";

type BottomTab = "UP NEXT" | "LYRICS" | "RELATED";

export default function NowPlayingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<BottomTab>("UP NEXT");
  const { queue, currentTrack } = usePlayerStore();

  const tabs: BottomTab[] = ["UP NEXT", "LYRICS", "RELATED"];

  return (
    <View className="flex-1 bg-yt-bg" style={{ paddingTop: insets.top }}>
      {/* Header row — in-flow so it never overlaps the artwork */}
      <View className="flex-row items-center justify-between px-3 py-2">
        <Pressable onPress={() => router.back()} hitSlop={12} className="p-1">
          <Ionicons name="chevron-down" size={28} color="#fff" />
        </Pressable>
        <Text className="text-xs font-semibold tracking-widest text-yt-textSecondary">
          PLAYING NOW
        </Text>
        {/* spacer balances the chevron so the label stays centered */}
        <View className="w-9" />
      </View>

      {/* Player content */}
      <View className="flex-1">
        <PlayerSheet />
      </View>

      {/* Bottom tabs */}
      <View
        className="border-t border-yt-surface2"
        style={{ paddingBottom: insets.bottom }}
      >
        {/* Tab bar */}
        <View className="flex-row border-b border-yt-surface2">
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="flex-1 items-center py-3"
            >
              <Text
                className={`text-xs font-semibold ${
                  activeTab === tab ? "text-yt-textPrimary" : "text-yt-textSecondary"
                }`}
              >
                {tab}
              </Text>
              {activeTab === tab && (
                <View className="mt-1 h-[2px] w-8 rounded-full bg-yt-textPrimary" />
              )}
            </Pressable>
          ))}
        </View>

        {/* Tab content */}
        <View className="h-[120px]">
          {activeTab === "UP NEXT" && (
            <FlatList
              data={queue}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <View
                  className={`flex-row items-center px-4 py-2 ${
                    item.id === currentTrack?.id ? "bg-yt-surface" : ""
                  }`}
                >
                  <Text className="w-6 text-center text-sm text-yt-textSecondary">
                    {index + 1}
                  </Text>
                  <View className="ml-3 flex-1">
                    <Text
                      className={`text-sm ${
                        item.id === currentTrack?.id
                          ? "font-semibold text-yt-accent"
                          : "text-yt-textPrimary"
                      }`}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text className="text-xs text-yt-textSecondary" numberOfLines={1}>
                      {item.artist.name}
                    </Text>
                  </View>
                  <Text className="text-xs text-yt-textSecondary">
                    {formatDuration(item.duration)}
                  </Text>
                </View>
              )}
            />
          )}

          {activeTab === "LYRICS" && (
            <View className="flex-1 items-center justify-center">
              <Text className="text-sm text-yt-textSecondary">
                Lyrics not available
              </Text>
            </View>
          )}

          {activeTab === "RELATED" && (
            <View className="flex-1 items-center justify-center">
              <Text className="text-sm text-yt-textSecondary">
                Related tracks will appear here
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
