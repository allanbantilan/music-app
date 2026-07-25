import { ScrollView, Pressable, Text } from "react-native";

interface Chip {
  id: string;
  title: string;
  color?: string;
}

interface ChipRowProps {
  chips: Chip[];
  onChipPress?: (chip: Chip) => void;
}

export default function ChipRow({ chips, onChipPress }: ChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-4 gap-2"
    >
      {chips.map((chip) => (
        <Pressable
          key={chip.id}
          onPress={() => onChipPress?.(chip)}
          className="rounded-full bg-yt-surface px-4 py-2"
          style={chip.color ? { backgroundColor: chip.color } : undefined}
        >
          <Text className="text-sm font-medium text-yt-textPrimary">
            {chip.title}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
