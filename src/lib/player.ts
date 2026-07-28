import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  Track,
} from "react-native-track-player";
import type { Song } from "@ytmusic/shared-types";
import { streamUrl, authHeaders } from "./config";

export async function setupPlayer() {
  let isSetup = false;
  try {
    await TrackPlayer.getActiveTrack();
    isSetup = true;
  } catch {
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
    });
    isSetup = true;
  }

  if (isSetup) {
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.ContinuePlayback,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
      progressUpdateEventInterval: 1,
    });
  }

  return isSetup;
}

/**
 * Convert a Song into a TrackPlayer Track. Audio streams from the backend
 * proxy (yt-dlp), which resolves + range-serves the bytes. The URL is stable
 * (backend caches the resolved googlevideo URL), so no client-side expiry.
 */
export async function songToTrack(song: Song): Promise<Track> {
  return {
    id: song.id,
    url: streamUrl(song.id),
    headers: authHeaders(),
    title: song.title,
    artist: song.artist.name,
    artwork: song.thumbnail[0]?.url,
    duration: song.duration,
  };
}

/**
 * Load a list of songs into the player queue.
 * Resolves each song's stream URL on-device.
 */
export async function loadQueue(songs: Song[], startIndex = 0) {
  const tracks = await Promise.all(songs.map(songToTrack));
  await TrackPlayer.reset();
  await TrackPlayer.add(tracks);
  if (startIndex > 0) await TrackPlayer.skip(startIndex);
  await TrackPlayer.play();
}

export async function addTracks(tracks: Track[]) {
  await TrackPlayer.add(tracks);
}

export async function playTrackAtIndex(index: number) {
  await TrackPlayer.skip(index);
  await TrackPlayer.play();
}

export const PlaybackService = async function () {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.destroy());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) =>
    TrackPlayer.seekTo(event.position)
  );
};
