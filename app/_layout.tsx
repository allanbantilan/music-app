// Polyfills MUST be first — they shim eval, TextDecoder, crypto, URL
// that youtubei.js needs to run on-device.
import "../src/lib/polyfills";
import "../global.css";

import { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { setupPlayer } from "@/lib/player";
import TrackPlayer, { Event } from "react-native-track-player";
import { usePlayerStore } from "@/stores/playerStore";
import ErrorBoundary from "@/components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    setupPlayer();
    // Keep store.currentTrack in sync when the player advances (next/prev/auto).
    const sub = TrackPlayer.addEventListener(
      Event.PlaybackActiveTrackChanged,
      (e) => {
        const id = e.track?.id;
        if (!id) return;
        const { queue, setCurrentTrack } = usePlayerStore.getState();
        const song = queue.find((t) => t.id === id);
        if (song) setCurrentTrack(song);
      }
    );
    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <ErrorBoundary>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#030303" },
                animation: "slide_from_right",
              }}
            />
          </ErrorBoundary>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
