import { Tabs } from "expo-router";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MiniPlayer from "@/components/MiniPlayer";
import { COLORS } from "@/lib/tokens";

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({
  name,
  label,
  focused,
}: {
  name: IconName;
  label: string;
  focused: boolean;
}) {
  const color = focused ? COLORS.primary : COLORS.muted;
  return (
    <View className="items-center" style={{ width: 64 }}>
      <Ionicons name={name} size={24} color={color} />
      <Text
        className={`mt-0.5 text-[10px] ${focused ? "text-primary" : "text-muted"}`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.base, paddingTop: insets.top }}>
      <Tabs
        sceneContainerStyle={{ backgroundColor: COLORS.base }}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopColor: "rgba(255,255,255,0.1)",
            borderTopWidth: 1,
            height: 56 + insets.bottom,
            paddingBottom: insets.bottom,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name={focused ? "home" : "home-outline"}
                label="Home"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name={focused ? "search" : "search-outline"}
                label="Explore"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon
                name={focused ? "library" : "library-outline"}
                label="Library"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>
      <MiniPlayer />
    </View>
  );
}
