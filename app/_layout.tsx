// Polyfills MUST be first — they shim eval, TextDecoder, crypto, URL
// that youtubei.js needs to run on-device.
import "../src/lib/polyfills";
import "../global.css";

import { useEffect } from "react";
import { AppState } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { setupPlayer } from "@/lib/player";
import TrackPlayer, { Event, State } from "react-native-track-player";
import { usePlayerStore } from "@/stores/playerStore";
import { persistState, restoreState } from "@/lib/playback";
import ErrorBoundary from "@/components/ErrorBoundary";
import ContextSheet from "@/components/ContextSheet";

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
    let errorAttempts = 0;
    (async () => {
      await setupPlayer();
      await restoreState(); // cold-start: resume last queue paused (§8)
    })();

    // Keep store in sync when the player advances (next/prev/auto).
    const trackSub = TrackPlayer.addEventListener(
      Event.PlaybackActiveTrackChanged,
      (e) => {
        errorAttempts = 0;
        const id = e.track?.id;
        if (!id) return;
        const { queue, setCurrentTrack, setCurrentIndex } = usePlayerStore.getState();
        const idx = queue.findIndex((t) => t.id === id);
        if (idx >= 0) {
          setCurrentTrack(queue[idx]);
          setCurrentIndex(idx);
        }
        persistState();
      }
    );
    const stateSub = TrackPlayer.addEventListener(Event.PlaybackState, (e) => {
      const { setBuffering, setPlaying } = usePlayerStore.getState();
      setBuffering(e.state === State.Buffering || e.state === State.Loading);
      if (e.state === State.Playing) setPlaying(true);
      else if (e.state === State.Paused || e.state === State.Stopped) setPlaying(false);
    });
    // Error: retry twice with backoff, then skip to next (§8).
    const errSub = TrackPlayer.addEventListener(Event.PlaybackError, async (e) => {
      console.log("[playback-error]", e?.code, e?.message);
      if (errorAttempts < 2) {
        errorAttempts++;
        setTimeout(async () => {
          try {
            await TrackPlayer.seekTo(0);
            await TrackPlayer.play();
          } catch {}
        }, 400 * errorAttempts);
      } else {
        errorAttempts = 0;
        try {
          await TrackPlayer.skipToNext();
        } catch {
          await TrackPlayer.pause();
        }
      }
    });
    // Persist position when backgrounded (§8 cold-start resume).
    const appSub = AppState.addEventListener("change", (st) => {
      if (st === "background" || st === "inactive") persistState();
    });
    return () => {
      trackSub.remove();
      stateSub.remove();
      errSub.remove();
      appSub.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <BottomSheetModalProvider>
            <StatusBar style="light" />
            <ErrorBoundary>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: "#0A0A0A" },
                  animation: "slide_from_right",
                }}
              />
            </ErrorBoundary>
            <ContextSheet />
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
