import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "../global.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {

  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
  }, []);
  
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" translucent={true} />
        <Stack initialRouteName="index" screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
