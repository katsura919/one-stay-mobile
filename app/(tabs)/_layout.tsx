import { Tabs } from "expo-router";
import { Heart, MessageCircle, Search, User } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#FF5A5F", // Airbnb's signature coral color
        tabBarInactiveTintColor: "#717171",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#EBEBEB",
          paddingTop: 5,
          paddingBottom: 5,
          height: 70,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <Search color={color} size={size} />
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
        name="ChatScreen"
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
