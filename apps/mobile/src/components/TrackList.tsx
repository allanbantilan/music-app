import { View, Text } from "react-native";
import type { Song } from "@ytmusic/shared-types";
import SongRow from "./SongRow";
import { formatDuration } from "@/lib/utils";

interface TrackListProps {
  tracks: Song[];
  onPlay?: (track: Song, index: number) => void;
}

export default function TrackList({ tracks, onPlay }: TrackListProps) {
  return (
    <View>
      {tracks.map((track, i) => (
        <SongRow
          key={`${track.id}-${i}`}
          song={track}
          index={i}
          onPlay={() => onPlay?.(track, i)}
          showDuration
        />
      ))}
    </View>
  );
}
