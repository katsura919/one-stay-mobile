import { Tabs } from "expo-router";
import { BarChart3, Calendar, MessageCircle, Settings, TreePalm  } from "lucide-react-native";

export default function OwnerTabLayout() {
  return (
      <Tabs
        screenOptions={{
        tabBarActiveTintColor: "#EC4899", // Pink color for owner theme
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
        name="Dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <BarChart3 color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
       <Tabs.Screen
        name="ResortScreen"
        options={{
          title: "Resort",
          tabBarIcon: ({ color, size }) => (
            <TreePalm  color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="BookingsScreen"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="OwnerChatScreen"
        options={{
          title: "Messages",
          tabBarIcon: ({ color, size }) => (
            <MessageCircle color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="SettingsScreen"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
