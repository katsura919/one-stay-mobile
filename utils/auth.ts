import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export const logout = async () => {
  try {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    router.replace('/');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

export const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};
