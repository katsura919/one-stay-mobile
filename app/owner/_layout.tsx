import { Stack } from "expo-router";
import { ResortProvider } from "@/contexts/ResortContext";

export default function OwnerLayout() {
  return (
    <ResortProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(owner-tabs)" />
        <Stack.Screen name="CreateRoom" />
      </Stack>
    </ResortProvider>
  );
}