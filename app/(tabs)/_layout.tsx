import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MiniPlayer from "@/components/MiniPlayer";

function TabIcon({ name, label, focused }: { name: string; label: string; focused: boolean }) {
  const icons: Record<string, string> = { home: "🏠", explore: "🔍", library: "📚" };
  return (
    <View className="items-center">
      <Text className={`text-2xl ${focused ? "text-yt-textPrimary" : "text-yt-textSecondary"}`}>
        {icons[name] ?? "●"}
      </Text>
      <Text className={`text-[10px] mt-0.5 ${focused ? "text-yt-textPrimary" : "text-yt-textSecondary"}`}>
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: "#030303", paddingTop: insets.top }}>
    <Tabs
      sceneContainerStyle={{ backgroundColor: "#030303" }}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#030303",
          borderTopColor: "#212121",
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="home" label="Home" focused={focused} /> }}
      />
      <Tabs.Screen
        name="explore"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="explore" label="Explore" focused={focused} /> }}
      />
      <Tabs.Screen
        name="library"
        options={{ tabBarIcon: ({ focused }) => <TabIcon name="library" label="Library" focused={focused} /> }}
      />
    </Tabs>
    <MiniPlayer />
    </View>
  );
}
