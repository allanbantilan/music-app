import { Pressable, type PressableProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/lib/tokens";

type IoniconName = keyof typeof Ionicons.glyphMap;
type SizePreset = "sm" | "md" | "lg";

const SIZES: Record<SizePreset, number> = { sm: 20, md: 24, lg: 28 };

interface IconButtonProps extends Omit<PressableProps, "children" | "style"> {
  name: IoniconName;
  size?: SizePreset | number;
  color?: string; // hex from COLORS; defaults to primary
  className?: string; // layout only (margins); visual feedback stays internal
}

/**
 * The only way to render a tappable icon (§9). Uniform hitSlop, press-scale
 * feedback (§4: scale 0.97 + opacity 0.85), and size presets so icon sizing
 * never drifts. Active/inactive is expressed by passing the filled vs
 * `-outline` Ionicon name from the call site.
 */
export default function IconButton({
  name,
  size = "md",
  color = COLORS.primary,
  ...props
}: IconButtonProps) {
  const px = typeof size === "number" ? size : SIZES[size];
  return (
    <Pressable
      hitSlop={12}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.97 : 1 }],
        opacity: pressed ? 0.85 : 1,
      })}
      {...props}
    >
      <Ionicons name={name} size={px} color={color} />
    </Pressable>
  );
}
