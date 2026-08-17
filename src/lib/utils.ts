export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatTimeAgo(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getThumbnailUrl(
  thumbnails: { url: string; width: number; height: number }[],
  preferredSize: number = 300
): string {
  // Only real http(s) urls are usable. Drops garbage from older persisted
  // queues (e.g. "MusicThumbnail" / "[object Object]" left by a past parser bug)
  // so it never reaches <Image source>.
  const valid = thumbnails.filter((t) => /^https?:\/\//.test(t?.url ?? ""));
  if (!valid.length) return "";
  const sorted = valid.sort(
    (a, b) =>
      Math.abs(a.width - preferredSize) - Math.abs(b.width - preferredSize)
  );
  return sorted[0].url;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 1) + "…";
}
