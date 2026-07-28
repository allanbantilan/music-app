import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import DraggableFlatList, { type RenderItemParams } from "react-native-draggable-flatlist";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import PlayerSheet from "@/components/PlayerSheet";
import IconButton from "@/components/IconButton";
import { usePlayerStore } from "@/stores/playerStore";
import { COLORS } from "@/lib/tokens";
import { jumpTo, removeFromQueue, reorderQueue } from "@/lib/playback";
import type { Song } from "@ytmusic/shared-types";

type BottomTab = "UP NEXT" | "LYRICS" | "RELATED";

export default function NowPlayingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<BottomTab>("UP NEXT");
  const { queue, currentTrack, playbackContext } = usePlayerStore();
  const dragY = useSharedValue(0);

  // Drag down anywhere on the header to collapse back to the mini player (§7).
  const collapse = Gesture.Pan()
    .activeOffsetY(12)
    .onUpdate((e) => {
      dragY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 800) {
        dragY.value = withTiming(600, {}, () => runOnJS(router.back)());
      } else {
        dragY.value = withSpring(0);
      }
    });
  const dragStyle = useAnimatedStyle(() => ({ transform: [{ translateY: dragY.value }] }));

  const tabs: BottomTab[] = ["UP NEXT", "LYRICS", "RELATED"];

  const renderQueueItem = ({ item, drag, getIndex }: RenderItemParams<Song>) => {
    const idx = getIndex() ?? 0;
    const active = item.id === currentTrack?.id;
    return (
      <View
        className={`flex-row items-center px-4 py-2 ${active ? "bg-surface" : ""}`}
      >
        <Pressable onPress={() => jumpTo(idx)} className="flex-1 flex-row items-center">
          <View className="ml-1 flex-1">
            <Text
              className={`text-sm ${active ? "font-semibold text-accent" : "text-primary"}`}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text className="text-xs text-secondary" numberOfLines={1}>
              {item.artist?.name ?? ""}
            </Text>
          </View>
        </Pressable>
        <IconButton
          name="trash-outline"
          size="sm"
          color={COLORS.muted}
          onPress={() => removeFromQueue(idx)}
          className="px-2"
        />
        <Pressable onLongPress={drag} delayLongPress={120} hitSlop={10} className="pl-1">
          <Ionicons name="reorder-three-outline" size={22} color={COLORS.muted} />
        </Pressable>
      </View>
    );
  };

  return (
    <Animated.View className="flex-1 bg-base" style={[{ paddingTop: insets.top }, dragStyle]}>
      <Stack.Screen options={{ animation: "slide_from_bottom" }} />
      {/* Header row — drag down here to collapse to the mini player (§7) */}
      <GestureDetector gesture={collapse}>
        <View className="flex-row items-center justify-between px-3 py-2">
          <Pressable onPress={() => router.back()} hitSlop={12} className="p-1">
            <Ionicons name="chevron-down" size={28} color="#fff" />
          </Pressable>
          <View className="flex-1 items-center">
            <Text className="text-[10px] tracking-widest text-muted">PLAYING FROM</Text>
            <Text className="text-xs font-semibold text-secondary" numberOfLines={1}>
              {playbackContext?.title?.toUpperCase() ?? "QUEUE"}
            </Text>
          </View>
          {/* spacer balances the chevron so the label stays centered */}
          <View className="w-9" />
        </View>
      </GestureDetector>

      {/* Player content */}
      <View className="flex-1">
        <PlayerSheet />
      </View>

      {/* Bottom tabs */}
      <View
        className="border-t border-white/10"
        style={{ paddingBottom: insets.bottom }}
      >
        {/* Tab bar */}
        <View className="flex-row border-b border-white/10">
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className="flex-1 items-center py-3"
            >
              <Text
                className={`text-xs font-semibold ${
                  activeTab === tab ? "text-primary" : "text-secondary"
                }`}
              >
                {tab}
              </Text>
              {activeTab === tab && (
                <View className="mt-1 h-[2px] w-8 rounded-full bg-primary" />
              )}
            </Pressable>
          ))}
        </View>

        {/* Tab content */}
        <View className="h-[150px]">
          {activeTab === "UP NEXT" && (
            <DraggableFlatList
              data={queue}
              keyExtractor={(item, i) => `${item.id}-${i}`}
              renderItem={renderQueueItem}
              onDragEnd={({ data }) => reorderQueue(data)}
            />
          )}

          {activeTab === "LYRICS" && (
            <View className="flex-1 items-center justify-center">
              <Text className="text-sm text-secondary">
                Lyrics not available
              </Text>
            </View>
          )}

          {activeTab === "RELATED" && (
            <View className="flex-1 items-center justify-center">
              <Text className="text-sm text-secondary">
                Related tracks will appear here
              </Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
