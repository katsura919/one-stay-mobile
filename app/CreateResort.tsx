import * as React from 'react';
import { Image, ScrollView, View, Alert, Modal, TouchableOpacity, Text } from 'react-native';
import { Button, TextInput, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { resortAPI } from '../services/resortService';
import { getToken } from '../utils/auth';
import WebMapLocationPicker from '../components/WebMapLocationPicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Location {
  latitude: number;
  longitude: number;
}

interface ResortFormData {
  resort_name: string;
  address: string;
  selectedLocation: Location | null;
  description: string;
  selectedImage: string | null;
}

export default function CreateResortScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [showMapPicker, setShowMapPicker] = React.useState(false);
  
  // Form data state
  const [formData, setFormData] = React.useState<ResortFormData>({
    resort_name: '',
    address: '',
    selectedLocation: null,
    description: '',
    selectedImage: null,
  });

  const totalSteps = 3;
  const progress = currentStep / totalSteps;

  const handleLocationSelect = (location: Location) => {
    setFormData(prev => ({ ...prev, selectedLocation: location }));
    setShowMapPicker(false);
  };

  const updateFormData = (field: keyof ResortFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    Alert.alert(
      'Select Image',
      'Choose how you want to select an image',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [3, 2],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateFormData('selectedImage', result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [3, 2],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateFormData('selectedImage', result.assets[0].uri);
    }
  };

  const removeImage = () => {
    updateFormData('selectedImage', null);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.resort_name.trim() !== '' && formData.address.trim() !== '';
      case 2:
        return formData.selectedLocation !== null;
      case 3:
        return true; // Image is optional
      default:
        return false;
    }
  };

  const getStepTitle = (step: number): string => {
    switch (step) {
      case 1:
        return 'Resort Details';
      case 2:
        return 'Location';
      case 3:
        return 'Resort Image';
      default:
        return '';
    }
  };

  const getStepDescription = (step: number): string => {
    switch (step) {
      case 1:
        return 'Enter your resort name and address';
      case 2:
        return 'Pin your exact location on the map';
      case 3:
        return 'Add an attractive image of your resort';
      default:
        return '';
    }
  };

  const handleCreateResort = async () => {
    if (!formData.resort_name.trim() || !formData.address.trim() || !formData.selectedLocation) {
      Alert.alert('Error', 'Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      
      if (!token) {
        Alert.alert('Error', 'Authentication required.');
        return;
      }

      const resortData = {
        resort_name: formData.resort_name.trim(),
        location: {
          address: formData.address.trim(),
          latitude: formData.selectedLocation.latitude,
          longitude: formData.selectedLocation.longitude
        },
        description: formData.description.trim() || undefined,
        imageUri: formData.selectedImage || undefined
      };

      // Debug logging
      console.log('Creating resort with data:', resortData);
      console.log('Location object:', resortData.location);

      await resortAPI.createResortWithImage(resortData, token);

      Alert.alert(
        'Success', 
        'Resort created successfully!',
        [
          {
            text: 'Continue to Dashboard',
            onPress: () => router.replace('/owner/(owner-tabs)/Dashboard')
          }
        ]
      );
    } catch (error) {
      console.error('Resort creation error:', error);
      Alert.alert('Error', 'Failed to create resort. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={{ width: '100%' }}>
      <Text style={{ 
        fontSize: 16,
        color: '#64748B',
        marginBottom: 32,
        lineHeight: 24,
      }}>
        Tell us about your resort to help guests find and book with confidence.
      </Text>

      <View style={{ gap: 20 }}>
        <View>
          <Text style={{ 
            fontSize: 14,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 8,
          }}>
            Resort Name *
          </Text>
          <TextInput
            value={formData.resort_name}
            onChangeText={(value) => updateFormData('resort_name', value)}
            mode="outlined"
            placeholder="Enter your resort name"
            style={{ backgroundColor: '#FFFFFF' }}
            outlineStyle={{ borderColor: '#E2E8F0', borderWidth: 1 }}
            contentStyle={{ fontSize: 16 }}
          />
        </View>
        
        <View>
          <Text style={{ 
            fontSize: 14,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 8,
          }}>
            Address *
          </Text>
          <TextInput
            value={formData.address}
            onChangeText={(value) => updateFormData('address', value)}
            mode="outlined"
            placeholder="Full address of your resort"
            style={{ backgroundColor: '#FFFFFF' }}
            outlineStyle={{ borderColor: '#E2E8F0', borderWidth: 1 }}
            contentStyle={{ fontSize: 16 }}
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View>
          <Text style={{ 
            fontSize: 14,
            fontWeight: '600',
            color: '#374151',
            marginBottom: 8,
          }}>
            Description
          </Text>
          <TextInput
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            mode="outlined"
            placeholder="Describe what makes your resort special..."
            style={{ backgroundColor: '#FFFFFF' }}
            outlineStyle={{ borderColor: '#E2E8F0', borderWidth: 1 }}
            contentStyle={{ fontSize: 16 }}
            multiline
            numberOfLines={4}
          />
          <Text style={{ 
            fontSize: 12,
            color: '#64748B',
            marginTop: 4,
          }}>
            Optional - Help guests understand what makes your resort unique
          </Text>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={{ width: '100%' }}>
      <Text style={{ 
        fontSize: 24,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 8,
      }}>
        Location
      </Text>
      <Text style={{ 
        fontSize: 16,
        color: '#64748B',
        marginBottom: 32,
        lineHeight: 24,
      }}>
        Pin your exact location to help guests find you easily.
      </Text>

      <TouchableOpacity
        onPress={() => setShowMapPicker(true)}
        style={{
          borderWidth: 1,
          borderColor: formData.selectedLocation ? '#1F2937' : '#E2E8F0',
          borderRadius: 12,
          padding: 20,
          backgroundColor: formData.selectedLocation ? '#F8FAFC' : '#FFFFFF',
          marginBottom: 24,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: formData.selectedLocation ? '#1F2937' : '#F1F5F9',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}>
            <Text style={{ fontSize: 18 }}>
              {formData.selectedLocation ? '📍' : '🗺️'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ 
              fontSize: 16,
              fontWeight: '600',
              color: formData.selectedLocation ? '#1F2937' : '#64748B',
              marginBottom: 2,
            }}>
              {formData.selectedLocation ? 'Location Selected' : 'Select Location'}
            </Text>
            <Text style={{ 
              fontSize: 14,
              color: '#64748B',
            }}>
              {formData.selectedLocation ? 'Tap to change location' : 'Tap to open map picker'}
            </Text>
          </View>
          <Text style={{ fontSize: 18, color: '#64748B' }}>›</Text>
        </View>
      </TouchableOpacity>
      
      {formData.selectedLocation && (
        <View style={{
          backgroundColor: '#F8FAFC',
          borderRadius: 12,
          padding: 20,
          borderWidth: 1,
          borderColor: '#E2E8F0',
        }}>
          <Text style={{ 
            fontSize: 16,
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: 12,
          }}>
            Selected Location Details
          </Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ fontSize: 14, color: '#64748B', width: 80 }}>Address:</Text>
              <Text style={{ fontSize: 14, color: '#374151', flex: 1 }}>{formData.address}</Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ fontSize: 14, color: '#64748B', width: 80 }}>Latitude:</Text>
              <Text style={{ fontSize: 14, color: '#374151', flex: 1 }}>
                {formData.selectedLocation.latitude.toFixed(6)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row' }}>
              <Text style={{ fontSize: 14, color: '#64748B', width: 80 }}>Longitude:</Text>
              <Text style={{ fontSize: 14, color: '#374151', flex: 1 }}>
                {formData.selectedLocation.longitude.toFixed(6)}
              </Text>
            </View>
          </View>
        </View>
      )}
      
      {!formData.selectedLocation && (
        <View style={{
          backgroundColor: '#FEF3C7',
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: '#FCD34D',
        }}>
          <Text style={{ 
            fontSize: 14,
            color: '#92400E',
            textAlign: 'center',
            lineHeight: 20,
          }}>
            ⚠️ Accurate location helps guests find you and improves your visibility in search results.
          </Text>
        </View>
      )}
    </View>
  );

  const renderStep3 = () => (
    <View style={{ width: '100%' }}>
      <Text style={{ 
        fontSize: 24,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 8,
      }}>
        Resort Image
      </Text>
      <Text style={{ 
        fontSize: 16,
        color: '#64748B',
        marginBottom: 32,
        lineHeight: 24,
      }}>
        Add a beautiful image to showcase your resort and attract more guests.
      </Text>
      
      {formData.selectedImage ? (
        <View style={{
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: '#F8FAFC',
          borderWidth: 1,
          borderColor: '#E2E8F0',
          marginBottom: 24,
        }}>
          <TouchableOpacity onPress={pickImage}>
            <Image 
              source={{ uri: formData.selectedImage }} 
              style={{ 
                width: '100%', 
                height: 240,
              }}
              resizeMode="cover"
            />
            <View style={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: 20,
              padding: 8,
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 12 }}>📷</Text>
            </View>
          </TouchableOpacity>
          
          <View style={{
            padding: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 16,
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: 2,
              }}>
                Resort Image Added
              </Text>
              <Text style={{ 
                fontSize: 14,
                color: '#64748B',
              }}>
                Tap image to change or use buttons below
              </Text>
            </View>
            <TouchableOpacity
              onPress={removeImage}
              style={{
                backgroundColor: '#FEE2E2',
                borderRadius: 8,
                padding: 8,
                marginLeft: 12,
              }}
            >
              <Text style={{ color: '#DC2626', fontSize: 12 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={pickImage}
          style={{
            borderWidth: 2,
            borderColor: '#E2E8F0',
            borderStyle: 'dashed',
            borderRadius: 16,
            padding: 40,
            alignItems: 'center',
            backgroundColor: '#FAFBFC',
            marginBottom: 24,
          }}
        >
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: '#F1F5F9',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 28 }}>📷</Text>
          </View>
          <Text style={{ 
            fontSize: 18,
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: 4,
          }}>
            Add Resort Image
          </Text>
          <Text style={{ 
            fontSize: 14,
            color: '#64748B',
            textAlign: 'center',
            lineHeight: 20,
          }}>
            Choose from camera or gallery{'\n'}High-quality images attract more guests
          </Text>
        </TouchableOpacity>
      )}

      <View style={{
        backgroundColor: '#EEF2FF',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#C7D2FE',
      }}>
        <Text style={{ 
          fontSize: 14,
          color: '#3730A3',
          textAlign: 'center',
          lineHeight: 20,
        }}>
          💡 <Text style={{ fontWeight: '600' }}>Pro Tip:</Text> High-quality images can increase booking rates by up to 40%. Make sure your image is well-lit and showcases your resort's best features.
        </Text>
      </View>
    </View>
  );

  return (
    <>
      <View style={{ 
        flex: 1, 
        backgroundColor: '#FFFFFF',
        paddingTop: insets.top,
      }}>
        {/* Fixed Header */}
        <View style={{ 
          paddingHorizontal: 24,
          paddingTop: 20,
          backgroundColor: '#1F2937',
          borderBottomWidth: 2,
          borderBottomColor: '#F1F5F9',
        }}>
          <Text style={{ 
            fontSize: 28,
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: 4,
          }}>
            Create Resort
          </Text>
          <Text style={{ 
            fontSize: 16,
            color: '#64748B',
            marginBottom: 20,
          }}>
            {getStepDescription(currentStep)}
          </Text>
        </View>

        {/* Content */}
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ 
            paddingHorizontal: 24,
            paddingTop: 15,
            paddingBottom: 120, // Space for fixed footer
          }}
          showsVerticalScrollIndicator={false}
        >
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>

        {/* Fixed Footer */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          paddingHorizontal: 24,
          paddingVertical: 16,
          paddingBottom: Math.max(16, insets.bottom),
        }}>
          {/* Step Indicators */}
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'center', 
            marginBottom: 20,
            gap: 8,
          }}>
            {Array.from({ length: totalSteps }, (_, index) => (
              <View
                key={index}
                style={{
                  width: 24,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: index + 1 <= currentStep ? '#1F2937' : '#E2E8F0',
                }}
              />
            ))}
          </View>

          {/* Navigation Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            {currentStep > 1 && (
              <Button
                mode="outlined"
                onPress={prevStep}
                style={{ 
                  flex: 1,
                  borderColor: '#E2E8F0',
                  borderWidth: 1,
                }}
                labelStyle={{ color: '#64748B', fontSize: 16, fontWeight: '500' }}
                contentStyle={{ height: 48 }}
              >
                Back
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                mode="contained"
                onPress={nextStep}
                disabled={!validateStep(currentStep)}
                style={{ 
                  flex: currentStep === 1 ? 1 : 2,
                }}
                buttonColor="#1F2937"
                labelStyle={{ fontSize: 16, fontWeight: '600' }}
                contentStyle={{ height: 48 }}
              >
                Continue
              </Button>
            ) : (
              <Button
                mode="contained"
                onPress={handleCreateResort}
                loading={loading}
                disabled={!validateStep(currentStep)}
                style={{ flex: 2 }}
                buttonColor="#1F2937"
                labelStyle={{ fontSize: 16, fontWeight: '600' }}
                contentStyle={{ height: 48 }}
              >
                Create Resort
              </Button>
            )}
          </View>
        </View>
      </View>

      {/* Map Picker Modal */}
      <Modal
        visible={showMapPicker}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <WebMapLocationPicker
          onLocationSelect={handleLocationSelect}
          onCancel={() => setShowMapPicker(false)}
          initialLocation={formData.selectedLocation || undefined}
        />
      </Modal>
    </>
  );
}
