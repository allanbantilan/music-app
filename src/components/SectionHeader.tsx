import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/lib/tokens";

interface SectionHeaderProps {
  title: string;
  onMore?: () => void;
}

/** Carousel/section title with an optional "More" disclosure (§4). */
export default function SectionHeader({ title, onMore }: SectionHeaderProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between px-4">
      <Text className="text-xl font-bold text-primary" numberOfLines={1}>
        {title}
      </Text>
      {onMore && (
        <Pressable
          onPress={onMore}
          hitSlop={12}
          className="flex-row items-center active:opacity-80"
        >
          <Text className="mr-0.5 text-[13px] text-secondary">More</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.secondary} />
        </Pressable>
      )}
    </View>
  );
}
