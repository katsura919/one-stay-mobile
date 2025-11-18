import React, { useState } from "react";
import { ScrollView, View, Text, Alert, TouchableOpacity } from "react-native";
import {
  User,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Lock,
  FileText,
  ChevronRight,
  Settings as SettingsIcon,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: User,
          label: "Edit Profile",
          onPress: () => router.push("/owner/UpdateProfileScreen"),
        },
        {
          icon: Lock,
          label: "Change Password",
          onPress: () => router.push("/owner/ChangePassword"),
        },
      ],
    },

    {
      title: "Support",
      items: [
        {
          icon: HelpCircle,
          label: "Help Center",
          onPress: () => Alert.alert("Help Center", "Help center coming soon!"),
        },
        {
          icon: Shield,
          label: "Privacy & Security",
          onPress: () =>
            Alert.alert("Privacy & Security", "Privacy settings coming soon!"),
        },
        {
          icon: FileText,
          label: "Terms & Policies",
          onPress: () => router.push("/TermsAndPolicy"),
        },
      ],
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-4">
          {/* User Info */}
          <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <Text
              style={{
                fontSize: 16,
                fontFamily: "Roboto-Bold",
                color: "#111827",
                marginBottom: 2,
              }}
            >
              {user?.name || "Property Owner"}
            </Text>
            <Text
              style={{ fontSize: 13, fontFamily: "Roboto", color: "#6B7280" }}
            >
              {user?.email}
            </Text>
            <View className="mt-2 bg-blue-50 rounded-lg px-2.5 py-1.5 self-start">
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: "Roboto-Medium",
                  color: "#1F2937",
                }}
              >
                Property Owner
              </Text>
            </View>
          </View>

          {/* Settings Sections */}
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} className="mb-4">
              <Text
                style={{
                  fontSize: 12,
                  fontFamily: "Roboto-Bold",
                  color: "#9CA3AF",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                {section.title}
              </Text>
              <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    onPress={item.onPress}
                    className={`flex-row items-center px-4 py-3 ${
                      itemIndex !== section.items.length - 1
                        ? "border-b border-gray-100"
                        : ""
                    }`}
                    activeOpacity={0.7}
                  >
                    <View className="w-9 h-9 bg-gray-50 rounded-lg items-center justify-center mr-3">
                      <item.icon color="#6B7280" size={18} />
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Roboto",
                        color: "#374151",
                        flex: 1,
                      }}
                    >
                      {item.label}
                    </Text>
                    <ChevronRight color="#9CA3AF" size={18} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-white rounded-xl border border-red-200 overflow-hidden mb-6"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center px-4 py-3">
              <View className="w-9 h-9 bg-red-50 rounded-lg items-center justify-center mr-3">
                <LogOut color="#EF4444" size={18} />
              </View>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Roboto-Medium",
                  color: "#EF4444",
                  flex: 1,
                }}
              >
                Logout
              </Text>
              <ChevronRight color="#EF4444" size={18} />
            </View>
          </TouchableOpacity>

          {/* App Version */}
          <View className="items-center py-4">
            <Text
              style={{ fontSize: 11, fontFamily: "Roboto", color: "#9CA3AF" }}
            >
              One Stay v1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
