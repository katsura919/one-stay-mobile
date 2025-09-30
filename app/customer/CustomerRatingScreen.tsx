import * as React from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { Text, Button, Card, TextInput, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { feedbackAPI } from '@/services/reservationService';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function CustomerRatingScreen() {
  const router = useRouter();
  const { reservationId, resortName, ownerName } = useLocalSearchParams<{
    reservationId: string;
    resortName: string;
    ownerName: string;
  }>();

  const [rating, setRating] = React.useState(0);
  const [comment, setComment] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  const handleStarPress = (starRating: number) => {
    setRating(starRating);
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating before submitting.');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Comment Required', 'Please provide a comment about your stay.');
      return;
    }

    try {
      setSubmitting(true);
      
      await feedbackAPI.createFeedback({
        reservation_id: reservationId!,
        rating,
        comment: comment.trim(),
        feedback_type: 'customer_to_owner'
      });

      Alert.alert(
        'Thank You!',
        'Your feedback has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.back(); // Go back to reservation details
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleStarPress(i)}
          className="mx-1"
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={40}
            color={i <= rating ? "#fbbf24" : "#d1d5db"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = () => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "Select Rating";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView>
        <View className="p-6">
          {/* Header */}
          <View className="flex-row items-center mb-6">
            <Button 
              mode="text" 
              onPress={() => router.back()}
              contentStyle={{ flexDirection: 'row-reverse' }}
            >
              <Ionicons name="arrow-back" size={24} color="#3b82f6" />
            </Button>
            <Text className="text-xl font-bold text-gray-800 ml-2">Rate Your Stay</Text>
          </View>

          {/* Resort Info */}
          <Card className="mb-6">
            <Card.Content className="p-6">
              <View className="items-center">
                <Avatar.Image 
                  size={80}
                  source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }}
                  className="mb-4"
                />
                <Text className="text-xl font-bold text-gray-800 text-center mb-2">
                  {resortName}
                </Text>
                <Text className="text-gray-600 text-center">
                  How was your experience at this resort?
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Rating Section */}
          <Card className="mb-6">
            <Card.Content className="p-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Overall Rating
              </Text>
              
              {/* Stars */}
              <View className="flex-row justify-center items-center mb-4">
                {renderStars()}
              </View>
              
              {/* Rating Text */}
              <Text className="text-center text-lg font-medium text-gray-700 mb-2">
                {getRatingText()}
              </Text>
              
              {rating > 0 && (
                <Text className="text-center text-sm text-gray-500">
                  {rating} out of 5 stars
                </Text>
              )}
            </Card.Content>
          </Card>

          {/* Comment Section */}
          <Card className="mb-6">
            <Card.Content className="p-6">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Share Your Experience
              </Text>
              
              <TextInput
                mode="outlined"
                placeholder="Tell us about your stay... (service, cleanliness, amenities, etc.)"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={6}
                maxLength={500}
                outlineColor="#e5e7eb"
                activeOutlineColor="#3b82f6"
                style={{ backgroundColor: 'white' }}
              />
              
              <Text className="text-right text-sm text-gray-500 mt-2">
                {comment.length}/500
              </Text>
            </Card.Content>
          </Card>

          {/* Guidelines */}
          <Card className="mb-6" style={{ backgroundColor: '#f0f9ff' }}>
            <Card.Content className="p-4">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <View className="ml-3 flex-1">
                  <Text className="text-blue-800 font-medium mb-1">
                    Rating Guidelines
                  </Text>
                  <Text className="text-blue-700 text-sm">
                    Please provide honest feedback about your stay. Your review helps other guests make informed decisions and helps the resort improve their services.
                  </Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmitFeedback}
            loading={submitting}
            disabled={submitting || rating === 0 || !comment.trim()}
            buttonColor="#3b82f6"
            contentStyle={{ paddingVertical: 12 }}
            labelStyle={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}
          >
            {submitting ? 'Submitting...' : 'Submit Rating'}
          </Button>

          {/* Additional Info */}
          <Text className="text-center text-sm text-gray-500 mt-4">
            Your feedback is valuable and will be shared with the resort owner to help improve their services.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}