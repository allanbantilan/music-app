// MUST be the very first import — react-native-gesture-handler requires this at
// the top of the entry file or Android touch handling never initializes
// (taps/scroll/gestures silently dead app-wide). Broken when we added this
// custom entry; expo-router/entry normally pulls it in first.
import "react-native-gesture-handler";

import TrackPlayer from "react-native-track-player";
import { PlaybackService } from "./src/lib/player";

// Must register before the app mounts, or the Android foreground-service
// crashes the release APK on launch.
TrackPlayer.registerPlaybackService(() => PlaybackService);

// require (not import) so it runs AFTER registration above — static imports hoist.
require("expo-router/entry");
