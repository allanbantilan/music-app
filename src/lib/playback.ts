import TrackPlayer, { RepeatMode as TPRepeat } from "react-native-track-player";
import type { Song } from "@ytmusic/shared-types";
import { usePlayerStore, type PlaybackContext, type RepeatMode } from "@/stores/playerStore";
import { songToTrack } from "./player";
import { shuffleWithPin, insertPlayNext, indexOfId } from "./playerHelpers";
import { storage } from "./storage";

const store = () => usePlayerStore.getState();

const PERSIST_KEY = "playbackState";

/** Save queue + index + position so a cold start can resume (§8). */
export async function persistState() {
  const s = store();
  if (!s.queue.length) {
    storage.setJson(PERSIST_KEY, null);
    return;
  }
  const position = await TrackPlayer.getPosition().catch(() => 0);
  storage.setJson(PERSIST_KEY, {
    queue: s.queue,
    currentIndex: s.currentIndex,
    context: s.playbackContext,
    position,
  });
}

/** Restore the last session paused, with the mini player visible (§8). */
export async function restoreState() {
  const saved = storage.getJson<{
    queue: Song[];
    currentIndex: number;
    context: PlaybackContext | null;
    position: number;
  }>(PERSIST_KEY);
  if (!saved?.queue?.length) return;
  const s = store();
  s.setQueue(saved.queue);
  s.setOriginalQueue(saved.queue);
  s.setCurrentIndex(saved.currentIndex);
  s.setCurrentTrack(saved.queue[saved.currentIndex] ?? saved.queue[0]);
  s.setPlaybackContext(saved.context);
  try {
    const built = await Promise.all(saved.queue.map(songToTrack));
    await TrackPlayer.reset();
    await TrackPlayer.add(built);
    if (saved.currentIndex > 0) await TrackPlayer.skip(saved.currentIndex);
    if (saved.position > 0) await TrackPlayer.seekTo(saved.position);
    // paused — do not call play()
  } catch {}
}

async function loadIntoPlayer(tracks: Song[], index: number) {
  // songToTrack is network-free now (backend URL), so mapping the whole
  // context is cheap — let TrackPlayer own the queue natively.
  const built = await Promise.all(tracks.map(songToTrack));
  await TrackPlayer.reset();
  await TrackPlayer.add(built);
  if (index > 0) await TrackPlayer.skip(index);
  await TrackPlayer.play();
}

/**
 * Replace the queue with an entire context and start at `index` (§6). Optimistic:
 * updates the store immediately, then loads TrackPlayer.
 */
export async function playFromContext(
  tracks: Song[],
  index: number,
  context: PlaybackContext
) {
  if (!tracks.length) return;
  const store_ = store();
  store_.setOriginalQueue(tracks);
  store_.setQueue(tracks);
  store_.setCurrentIndex(index);
  store_.setCurrentTrack(tracks[index] ?? tracks[0]);
  store_.setPlaybackContext(context);
  store_.setPlaying(true);
  try {
    await loadIntoPlayer(store().queue, index);
    persistState();
  } catch (e) {
    console.error("Playback error:", e);
    store_.setPlaying(false);
  }
}

export async function togglePlay() {
  const { isPlaying, setPlaying } = store();
  if (isPlaying) {
    await TrackPlayer.pause();
    setPlaying(false);
  } else {
    await TrackPlayer.play();
    setPlaying(true);
  }
}

export async function next() {
  try {
    await TrackPlayer.skipToNext();
  } catch {}
}

/** Prev: if >3s into the track, restart it; otherwise go to previous (§6). */
export async function prev() {
  const pos = await TrackPlayer.getPosition().catch(() => 0);
  if (pos > 3) {
    await TrackPlayer.seekTo(0);
    return;
  }
  try {
    await TrackPlayer.skipToPrevious();
  } catch {
    await TrackPlayer.seekTo(0);
  }
}

export async function seekTo(sec: number) {
  await TrackPlayer.seekTo(sec);
}

/** Shuffle: snapshot original, pin current at 0; disable restores order (§6). */
export async function toggleShuffle() {
  const s = store();
  const pos = await TrackPlayer.getPosition().catch(() => 0);
  if (!s.shuffle) {
    const shuffled = shuffleWithPin(s.queue, s.currentIndex);
    s.setOriginalQueue(s.queue);
    await rebuildQueue(shuffled, 0, pos);
    s.setQueue(shuffled);
    s.setCurrentIndex(0);
    usePlayerStore.setState({ shuffle: true });
  } else {
    const restored = s.originalQueue.length ? s.originalQueue : s.queue;
    const idx = indexOfId(restored, s.currentTrack?.id);
    await rebuildQueue(restored, idx, pos);
    s.setQueue(restored);
    s.setCurrentIndex(idx);
    usePlayerStore.setState({ shuffle: false });
  }
}

async function rebuildQueue(tracks: Song[], index: number, resumeAt: number) {
  const built = await Promise.all(tracks.map(songToTrack));
  await TrackPlayer.reset();
  await TrackPlayer.add(built);
  if (index > 0) await TrackPlayer.skip(index);
  await TrackPlayer.seekTo(resumeAt);
  if (store().isPlaying) await TrackPlayer.play();
}

const TP_REPEAT: Record<RepeatMode, TPRepeat> = {
  off: TPRepeat.Off,
  all: TPRepeat.Queue,
  one: TPRepeat.Track,
};

export async function cycleRepeat() {
  const { repeat } = store();
  const next_: RepeatMode = repeat === "off" ? "all" : repeat === "all" ? "one" : "off";
  await TrackPlayer.setRepeatMode(TP_REPEAT[next_]);
  usePlayerStore.setState({ repeat: next_ });
}

/** Insert right after the current track (§6). */
export async function playNext(song: Song) {
  const s = store();
  const t = await songToTrack(song);
  try {
    await TrackPlayer.add(t, s.currentIndex + 1);
  } catch {
    await TrackPlayer.add(t);
  }
  s.setQueue(insertPlayNext(s.queue, s.currentIndex, song));
}

export async function addToQueue(song: Song) {
  const s = store();
  const t = await songToTrack(song);
  await TrackPlayer.add(t);
  s.setQueue([...s.queue, song]);
}

export async function removeFromQueue(index: number) {
  const s = store();
  try {
    await TrackPlayer.remove(index);
  } catch {}
  const q = [...s.queue];
  q.splice(index, 1);
  s.setQueue(q);
}

/** Reorder the queue (drag) keeping the current track playing at its position. */
export async function reorderQueue(newQueue: Song[]) {
  const s = store();
  const pos = await TrackPlayer.getPosition().catch(() => 0);
  const idx = indexOfId(newQueue, s.currentTrack?.id);
  await rebuildQueue(newQueue, idx, pos);
  s.setQueue(newQueue);
  s.setCurrentIndex(idx);
}

/** Jump to a queued track by index without rebuilding the queue (§6). */
export async function jumpTo(index: number) {
  try {
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
  } catch {}
}

/** Swipe-down dismiss on the mini player: stop and clear the queue (§6). */
export async function stopAndClear() {
  const s = store();
  await TrackPlayer.reset();
  s.setQueue([]);
  s.setOriginalQueue([]);
  s.setCurrentTrack(null);
  s.setPlaying(false);
}
