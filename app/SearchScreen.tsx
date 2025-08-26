import * as React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Search } from 'lucide-react-native';
import SearchHeader from '@/components/search-header';

export default function SearchScreen() {
    // Sample recent searches data
    const recentSearches = [
        'Bali Beach Resort',
        'Mountain View Hotel',
        'Tokyo City Center',
        'Paris Luxury Suite',
        'Miami Beach Hotel'
    ];

    const handleSearchChange = (text: string) => {
        console.log('Search text changed:', text);
        // Implement your search logic here
    };

    const handleSearchSubmit = (text: string) => {
        console.log('Search submitted:', text);
        // Implement your search submit logic here
    };

    const handleRecentSearchPress = (searchTerm: string) => {
        console.log('Recent search pressed:', searchTerm);
        // Handle recent search selection
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <SearchHeader 
                placeholder="Search for events, venues, or artists"
                onSearchChange={handleSearchChange}
                onSearchSubmit={handleSearchSubmit}
            />
            
            <ScrollView className="flex-1 px-5 pt-6">
                {/* Recent Searches Section */}
                <View className="mb-6">
                    <View className="flex-row items-center mb-4">
                        <Search color="#374151" size={18} />
                        <Text className="text-lg font-semibold text-gray-900 ml-2">
                            Recent Searches
                        </Text>
                    </View>
                    
                    <View className="space-y-1">
                        {recentSearches.map((search, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleRecentSearchPress(search)}
                                className="py-3 border-b border-gray-100 active:bg-gray-50"
                                activeOpacity={0.7}
                            >
                                <Text className="text-base text-gray-700 font-medium">
                                    {search}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}