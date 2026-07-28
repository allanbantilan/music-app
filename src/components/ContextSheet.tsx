import { useEffect, useRef, useCallback } from "react";
import { View, Text, Pressable, Vibration } from "react-native";
import { Image } from "react-native";
import { useRouter } from "expo-router";
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { useContextSheet } from "@/stores/contextSheet";
import { getThumbnailUrl } from "@/lib/utils";
import { COLORS } from "@/lib/tokens";
import { playNext, addToQueue } from "@/lib/playback";

type IconName = keyof typeof Ionicons.glyphMap;

/** Long-press track menu (§3). Mounted once at the app root. */
export default function ContextSheet() {
  const ref = useRef<BottomSheetModal>(null);
  const router = useRouter();
  const { song, close } = useContextSheet();

  useEffect(() => {
    if (song) {
      Vibration.vibrate(10);
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [song]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.5} />
    ),
    []
  );

  const row = (icon: IconName, label: string, onPress: () => void) => (
    <Pressable
      onPress={() => {
        onPress();
        close();
      }}
      className="flex-row items-center px-5 py-3.5 active:bg-surface-raised"
    >
      <Ionicons name={icon} size={22} color={COLORS.primary} />
      <Text className="ml-4 text-[15px] text-primary">{label}</Text>
    </Pressable>
  );

  const art = song ? getThumbnailUrl(song.thumbnail, 120) : "";

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      onDismiss={close}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: COLORS.muted }}
      backgroundStyle={{ backgroundColor: COLORS.surfaceOverlay }}
    >
      {song && (
        <View className="pb-6">
          <View className="flex-row items-center border-b border-white/10 px-5 pb-4">
            <Image
              source={art ? { uri: art } : undefined}
              className="h-12 w-12 rounded-thumb bg-surface"
              resizeMode="cover"
            />
            <View className="ml-3 flex-1">
              <Text className="text-[15px] font-medium text-primary" numberOfLines={1}>
                {song.title}
              </Text>
              <Text className="text-[13px] text-secondary" numberOfLines={1}>
                {song.artist?.name ?? ""}
              </Text>
            </View>
          </View>

          {row("arrow-redo-outline", "Play next", () => playNext(song))}
          {row("list-outline", "Add to queue", () => addToQueue(song))}
          {row("person-outline", "Go to artist", () => {
            if (song.artist?.id)
              router.push({ pathname: "/artist/[id]", params: { id: song.artist.id } });
          })}
          {row("download-outline", "Download", () => {})}
          {row("share-social-outline", "Share", () => {})}
        </View>
      )}
    </BottomSheetModal>
  );
}
