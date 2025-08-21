import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-gradient-to-b from-yellow-100 to-orange-200">
      <Text className="text-3xl font-bold text-orange-600 mb-4">
        🏖️ Welcome to OneStay!
      </Text>
      <Text className="text-lg text-teal-700 text-center px-10">
        Your summer resort room reservation app is ready with NativeWind!
      </Text>
      <View className="mt-8 bg-white p-4 rounded-lg shadow-lg">
        <Text className="text-blue-500 font-semibold">
          ✅ NativeWind is working correctly!
        </Text>
      </View>
    </View>
  );
}
