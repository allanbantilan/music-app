import { View, Text } from "react-native";

/** Explicit-content "E" badge (§9 custom component). */
export default function ExplicitBadge() {
  return (
    <View className="h-4 w-4 items-center justify-center rounded-[3px] bg-surface-raised">
      <Text className="text-[10px] font-bold text-secondary">E</Text>
    </View>
  );
}
