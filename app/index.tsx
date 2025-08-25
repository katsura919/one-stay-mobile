import { View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityIndicator } from 'react-native-paper';
import Login from "./Login";

export default function Index() {
  const { isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show login screen if not authenticated
  return <Login />;
}
