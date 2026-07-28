import { ScrollView, Pressable, Text } from "react-native";

interface Chip {
  id: string;
  title: string;
  color?: string;
}

interface ChipRowProps {
  chips: Chip[];
  activeId?: string;
  onChipPress?: (chip: Chip) => void;
}

/**
 * YT Music pill filter row. Active = white fill / black text; inactive =
 * raised surface / primary text.
 */
export default function ChipRow({ chips, activeId, onChipPress }: ChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-4 gap-2"
    >
      {chips.map((chip) => {
        const active = chip.id === activeId;
        return (
          <Pressable
            key={chip.id}
            onPress={() => onChipPress?.(chip)}
            className={`rounded-pill px-4 py-2 active:opacity-80 ${
              active ? "bg-chip-active" : "bg-surface-raised"
            }`}
            style={chip.color && !active ? { backgroundColor: chip.color } : undefined}
          >
            <Text
              className={`text-sm ${
                active ? "font-semibold text-black" : "font-medium text-primary"
              }`}
            >
              {chip.title}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
