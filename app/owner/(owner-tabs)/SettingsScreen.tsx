import React, { useState } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { Card, List, Switch, Button, Avatar, Divider } from 'react-native-paper';
import { User, Bell, Shield, HelpCircle, LogOut, Edit, MapPin } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState({
    bookings: true,
    messages: true,
    reviews: true,
    marketing: false
  });

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
          }
        }
      ]
    );
  };

  const ProfileSection = () => (
    <Card className="mb-6">
      <Card.Content className="py-6">
        <View className="flex-row items-center">
          <Avatar.Image 
            size={80} 
            source={{ uri: user?.avatar || 'https://randomuser.me/api/portraits/men/45.jpg' }}
          />
          <View className="flex-1 ml-4">
            <Text className="text-xl font-bold text-gray-900 mb-1">
              {user?.name || 'Property Owner'}
            </Text>
            <View className="flex-row items-center mb-2">
              <MapPin size={16} color="#6B7280" />
              <Text className="ml-1 text-sm text-gray-600">{user?.email}</Text>
            </View>
            <Text className="text-sm text-pink-600 font-medium">
              {user?.role === 'owner' ? 'Property Owner' : 'Customer'}
            </Text>
          </View>
        </View>
        <Button 
          mode="outlined" 
          icon={({ size }) => <Edit size={size} />}
          className="mt-4"
          onPress={() => {/* Navigate to edit profile */}}
        >
          Edit Profile
        </Button>
      </Card.Content>
    </Card>
  );

  const NotificationSettings = () => (
    <Card className="mb-6">
      <Card.Content>
        <Text className="text-lg font-semibold text-gray-900 mb-4">Notifications</Text>
        <View>
          <View className="flex-row justify-between items-center py-3">
            <View className="flex-row items-center">
              <Bell size={20} color="#6B7280" />
              <Text className="ml-3 text-gray-900">Booking Updates</Text>
            </View>
            <Switch 
              value={notifications.bookings}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, bookings: value }))}
            />
          </View>
          <Divider />
          <View className="flex-row justify-between items-center py-3">
            <View className="flex-row items-center">
              <Bell size={20} color="#6B7280" />
              <Text className="ml-3 text-gray-900">New Messages</Text>
            </View>
            <Switch 
              value={notifications.messages}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, messages: value }))}
            />
          </View>
          <Divider />
          <View className="flex-row justify-between items-center py-3">
            <View className="flex-row items-center">
              <Bell size={20} color="#6B7280" />
              <Text className="ml-3 text-gray-900">Review Notifications</Text>
            </View>
            <Switch 
              value={notifications.reviews}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, reviews: value }))}
            />
          </View>
          <Divider />
          <View className="flex-row justify-between items-center py-3">
            <View className="flex-row items-center">
              <Bell size={20} color="#6B7280" />
              <Text className="ml-3 text-gray-900">Marketing Emails</Text>
            </View>
            <Switch 
              value={notifications.marketing}
              onValueChange={(value) => setNotifications(prev => ({ ...prev, marketing: value }))}
            />
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 pt-12 pb-4">
          <Text className="text-2xl font-bold text-gray-900">Settings</Text>
        </View>

        <View className="px-6">
          <ProfileSection />
          <NotificationSettings />

          {/* Other Settings */}
          <Card className="mb-6">
            <Card.Content>
              <Text className="text-lg font-semibold text-gray-900 mb-4">Account</Text>
              <List.Item
                title="Privacy & Security"
                left={(props) => <Shield {...props} />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {/* Navigate to privacy settings */}}
              />
              <Divider />
              <List.Item
                title="Help & Support"
                left={(props) => <HelpCircle {...props} />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {/* Navigate to help */}}
              />
              <Divider />
              <List.Item
                title="About OneStay"
                left={(props) => <List.Icon {...props} icon="information" />}
                right={(props) => <List.Icon {...props} icon="chevron-right" />}
                onPress={() => {/* Navigate to about */}}
              />
            </Card.Content>
          </Card>

          {/* Logout */}
          <Card className="mb-24">
            <Card.Content>
              <Button
                mode="contained"
                icon={({ size }) => <LogOut size={size} color="white" />}
                buttonColor="#EF4444"
                onPress={handleLogout}
                className="py-2"
              >
                Logout
              </Button>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
