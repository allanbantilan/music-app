import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface HeaderGradientProps {
  children: React.ReactNode;
  height?: number;
}

export default function HeaderGradient({ children, height = 300 }: HeaderGradientProps) {
  return (
    <View className="relative">
      {children}
      <LinearGradient
        colors={["transparent", "#030303"]}
        style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: height / 2 }}
      />
    </View>
  );
}
