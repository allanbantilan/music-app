import Constants from "expo-constants";

// Backend stream proxy (yt-dlp). Set in app.json > expo.extra.
const extra = (Constants.expoConfig?.extra ?? {}) as {
  BACKEND_URL?: string;
  TOKEN?: string;
};

export const BACKEND_URL = extra.BACKEND_URL ?? "";
export const BACKEND_TOKEN = extra.TOKEN ?? "";

export function streamUrl(videoId: string): string {
  return `${BACKEND_URL}/stream/${videoId}`;
}

export function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${BACKEND_TOKEN}` };
}
