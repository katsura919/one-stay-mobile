import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "../global.css";

export default function RootLayout() {
  useEffect(() => {
    NavigationBar.setBackgroundColorAsync("transparent");
    NavigationBar.setVisibilityAsync("hidden");
  }, []);
  return (
    <>
      <StatusBar style="dark" backgroundColor="transparent" translucent={true} />
      <Stack initialRouteName="(tabs)" screenOptions={{ headerShown: false }} />
    </>
  );
}
