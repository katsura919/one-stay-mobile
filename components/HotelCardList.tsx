import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import customerResortAPI, {
  EnhancedResort,
} from "@/services/customerResortService";

const HotelCardList = () => {
  const router = useRouter();
  const [resorts, setResorts] = useState<EnhancedResort[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResorts();
  }, []);

  const loadResorts = async () => {
    try {
      setLoading(true);
      const data = await customerResortAPI.getFeaturedResorts();
      setResorts(data);
    } catch (error) {
      console.error("Error loading resorts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResortPress = (resortId: string) => {
    router.push({
      pathname: "/customer/ResortDetailsScreen",
      params: { resortId },
    });
  };

  if (loading) {
    return (
      <View className="mt-2 px-5 py-10">
        <ActivityIndicator size="large" color="#1F2937" />
      </View>
    );
  }

  return (
    <View className="mt-1 px-5">
      <View className="flex-row items-center justify-between mb-3">
        <Text
          style={{ fontSize: 18, fontFamily: "Roboto-Bold", color: "#111827" }}
        >
          Featured Stays
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/customer/SeeAllResorts")}
        >
          <Text
            style={{
              fontSize: 13,
              fontFamily: "Roboto-Medium",
              color: "#1F2937",
            }}
          >
            See all
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-1"
      >
        {resorts.length > 0 ? (
          resorts.map((resort) => (
            <TouchableOpacity
              key={resort._id}
              className="mx-1.5 w-64"
              onPress={() => handleResortPress(resort._id)}
              activeOpacity={0.9}
            >
              <View className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <Image
                  source={
                    resort.image
                      ? { uri: resort.image }
                      : require("@/assets/images/react-logo.png")
                  }
                  className="w-full h-48 bg-gray-200"
                  resizeMode="cover"
                />
                <TouchableOpacity className="absolute top-2.5 right-2.5 bg-white/90 rounded-full p-1.5">
                  <Ionicons name="heart-outline" size={18} color="#1F2937" />
                </TouchableOpacity>
                {resort.rating >= 4.5 && resort.reviews >= 10 && (
                  <View className="absolute top-2.5 left-2.5 bg-white/95 px-2.5 py-1 rounded-lg shadow-sm">
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Roboto-Bold",
                        color: "#1F2937",
                      }}
                    >
                      ⭐ Guest favorite
                    </Text>
                  </View>
                )}
              </View>

              <View className="p-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Text
                    style={{
                      fontSize: 15,
                      fontFamily: "Roboto-Bold",
                      color: "#111827",
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {resort.resort_name}
                  </Text>
                  {resort.rating > 0 && (
                    <View className="flex-row items-center ml-2 bg-gray-100 px-2 py-0.5 rounded-lg">
                      <Ionicons name="star" size={12} color="#F59E0B" />
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Roboto-Medium",
                          color: "#111827",
                          marginLeft: 2,
                        }}
                      >
                        {resort.rating.toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Roboto",
                    color: "#6B7280",
                    marginBottom: 6,
                  }}
                  numberOfLines={1}
                >
                  {resort.location?.address?.split(",")[0] || "Location"}
                </Text>

                <View className="flex-row items-center justify-between">
                  {resort.price_per_night > 0 ? (
                    <View className="flex-row items-baseline">
                      <Text
                        style={{
                          fontSize: 16,
                          fontFamily: "Roboto-Bold",
                          color: "#111827",
                        }}
                      >
                        ₱{resort.price_per_night.toLocaleString()}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontFamily: "Roboto",
                          color: "#6B7280",
                          marginLeft: 3,
                        }}
                      >
                        /night
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={{
                        fontSize: 12,
                        fontFamily: "Roboto",
                        color: "#9CA3AF",
                      }}
                    >
                      Price TBA
                    </Text>
                  )}

                  {resort.available_rooms > 0 && (
                    <Text
                      style={{
                        fontSize: 11,
                        fontFamily: "Roboto-Medium",
                        color: "#10B981",
                      }}
                    >
                      {resort.available_rooms} available
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="w-full py-10 items-center">
            <Text className="text-gray-500 text-center">
              No resorts available at the moment
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HotelCardList;
