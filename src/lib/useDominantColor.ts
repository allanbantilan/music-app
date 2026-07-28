import { useEffect, useState } from "react";
import { getColors } from "react-native-image-colors";
import { COLORS } from "@/lib/tokens";

/**
 * Extract a dominant color from artwork for gradient headers (§3 detail spec).
 * Falls back to surface so the header never flashes an empty color.
 */
export function useDominantColor(uri: string | undefined): string {
  const [color, setColor] = useState<string>(COLORS.surface);
  useEffect(() => {
    let alive = true;
    if (!uri) return;
    getColors(uri, { fallback: COLORS.surface, cache: true, key: uri })
      .then((res) => {
        if (!alive) return;
        const c =
          res.platform === "android"
            ? res.dominant
            : res.platform === "ios"
            ? res.background
            : COLORS.surface;
        if (c) setColor(c);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [uri]);
  return color;
}
