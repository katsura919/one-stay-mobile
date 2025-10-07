import { Tabs } from "expo-router";
import { Heart, MessageCircle, House, User } from "lucide-react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#1F2937",
          borderTopWidth: 0,
          borderRadius: 25,
          marginHorizontal: 20,
          marginBottom: Math.max(insets.bottom + 10, 20),
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 15,
          height: 60,
          position: 'absolute',
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          display: 'none', // Hide labels for cleaner look like the image
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <House color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="FavoritesScreen"
        options={{
          title: "Wishlists",
          tabBarIcon: ({ color, size }) => (
            <Heart color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="CustomerChatScreen"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
