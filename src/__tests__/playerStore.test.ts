import { usePlayerStore } from "../stores/playerStore";
import type { Song } from "@ytmusic/shared-types";

const mockSong = (id: string, title: string): Song => ({
  id,
  title,
  artist: { id: "a1", name: "Artist" },
  duration: 180,
  thumbnail: [{ url: "http://example.com/thumb.jpg", width: 300, height: 300 }],
  isExplicit: false,
});

beforeEach(() => {
  usePlayerStore.setState({
    currentTrack: null,
    queue: [],
    history: [],
    isPlaying: false,
    shuffle: false,
    repeat: "off",
    position: 0,
    duration: 0,
  });
});

describe("playerStore", () => {
  it("sets current track", () => {
    const song = mockSong("1", "Song 1");
    usePlayerStore.getState().setCurrentTrack(song);
    expect(usePlayerStore.getState().currentTrack).toEqual(song);
  });

  it("sets queue and current track", () => {
    const songs = [mockSong("1", "S1"), mockSong("2", "S2")];
    usePlayerStore.getState().setQueue(songs, 1);
    expect(usePlayerStore.getState().queue).toHaveLength(2);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("2");
  });

  it("adds to queue", () => {
    const s1 = mockSong("1", "S1");
    const s2 = mockSong("2", "S2");
    usePlayerStore.getState().setQueue([s1]);
    usePlayerStore.getState().addToQueue(s2);
    expect(usePlayerStore.getState().queue).toHaveLength(2);
  });

  it("removes from queue by index", () => {
    const songs = [mockSong("1", "S1"), mockSong("2", "S2"), mockSong("3", "S3")];
    usePlayerStore.getState().setQueue(songs);
    usePlayerStore.getState().removeFromQueue(1);
    expect(usePlayerStore.getState().queue).toHaveLength(2);
    expect(usePlayerStore.getState().queue[1].id).toBe("3");
  });

  it("reorders queue", () => {
    const songs = [mockSong("1", "S1"), mockSong("2", "S2"), mockSong("3", "S3")];
    usePlayerStore.getState().setQueue(songs);
    usePlayerStore.getState().reorderQueue(0, 2);
    const q = usePlayerStore.getState().queue;
    expect(q[0].id).toBe("2");
    expect(q[2].id).toBe("1");
  });

  it("toggles shuffle", () => {
    const songs = [
      mockSong("1", "S1"),
      mockSong("2", "S2"),
      mockSong("3", "S3"),
      mockSong("4", "S4"),
      mockSong("5", "S5"),
    ];
    usePlayerStore.getState().setQueue(songs, 0);
    usePlayerStore.getState().toggleShuffle();
    expect(usePlayerStore.getState().shuffle).toBe(true);
    expect(usePlayerStore.getState().queue[0].id).toBe("1");
    usePlayerStore.getState().toggleShuffle();
    expect(usePlayerStore.getState().shuffle).toBe(false);
  });

  it("cycles repeat mode", () => {
    expect(usePlayerStore.getState().repeat).toBe("off");
    usePlayerStore.getState().cycleRepeat();
    expect(usePlayerStore.getState().repeat).toBe("all");
    usePlayerStore.getState().cycleRepeat();
    expect(usePlayerStore.getState().repeat).toBe("one");
    usePlayerStore.getState().cycleRepeat();
    expect(usePlayerStore.getState().repeat).toBe("off");
  });

  it("playTrack updates currentTrack and history", () => {
    const s1 = mockSong("1", "S1");
    const s2 = mockSong("2", "S2");
    usePlayerStore.getState().setCurrentTrack(s1);
    usePlayerStore.getState().playTrack(s2);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("2");
    expect(usePlayerStore.getState().history).toContain("1");
  });

  it("clears queue", () => {
    const songs = [mockSong("1", "S1"), mockSong("2", "S2")];
    usePlayerStore.getState().setQueue(songs);
    usePlayerStore.getState().clearQueue();
    expect(usePlayerStore.getState().queue).toHaveLength(0);
    expect(usePlayerStore.getState().currentTrack).toBeNull();
  });

  it("handles shuffle with empty queue", () => {
    usePlayerStore.getState().toggleShuffle();
    expect(usePlayerStore.getState().shuffle).toBe(true);
    usePlayerStore.getState().toggleShuffle();
    expect(usePlayerStore.getState().shuffle).toBe(false);
  });

  it("handles setQueue with invalid index", () => {
    const songs = [mockSong("1", "S1"), mockSong("2", "S2")];
    usePlayerStore.getState().setQueue(songs, 99);
    expect(usePlayerStore.getState().currentTrack).toBeNull();
  });

  it("handles removeFromQueue out of bounds", () => {
    const songs = [mockSong("1", "S1")];
    usePlayerStore.getState().setQueue(songs);
    usePlayerStore.getState().removeFromQueue(5);
    expect(usePlayerStore.getState().queue).toHaveLength(1);
  });

  it("handles reorderQueue with same index", () => {
    const songs = [mockSong("1", "S1"), mockSong("2", "S2")];
    usePlayerStore.getState().setQueue(songs);
    usePlayerStore.getState().reorderQueue(0, 0);
    expect(usePlayerStore.getState().queue[0].id).toBe("1");
  });

  it("tracks play history correctly", () => {
    const s1 = mockSong("1", "S1");
    const s2 = mockSong("2", "S2");
    const s3 = mockSong("3", "S3");
    usePlayerStore.getState().playTrack(s1);
    usePlayerStore.getState().playTrack(s2);
    usePlayerStore.getState().playTrack(s3);
    expect(usePlayerStore.getState().history).toEqual(["1", "2"]);
    expect(usePlayerStore.getState().currentTrack?.id).toBe("3");
  });

  it("position and duration update correctly", () => {
    usePlayerStore.getState().setDuration(240);
    usePlayerStore.getState().setPosition(120);
    expect(usePlayerStore.getState().duration).toBe(240);
    expect(usePlayerStore.getState().position).toBe(120);
  });
});
