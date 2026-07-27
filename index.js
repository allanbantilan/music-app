import TrackPlayer from "react-native-track-player";
import { PlaybackService } from "./src/lib/player";

// Must register before the app mounts, or the Android foreground-service
// crashes the release APK on launch.
TrackPlayer.registerPlaybackService(() => PlaybackService);

// require (not import) so it runs AFTER registration above — static imports hoist.
require("expo-router/entry");
