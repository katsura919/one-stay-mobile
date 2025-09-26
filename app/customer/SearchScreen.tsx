import * as React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image, TextInput } from 'react-native';
import { Search, X, MapPin, Clock, Star, ChevronLeft, History } from 'lucide-react-native';
import { resortAPI, Resort } from '@/services/resortService';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SearchScreen() {
    const [searchText, setSearchText] = React.useState('');
    const [searchResults, setSearchResults] = React.useState<Resort[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [recentSearches, setRecentSearches] = React.useState<string[]>([]);

    const RECENT_SEARCHES_KEY = 'recent_searches';
    const MAX_RECENT_SEARCHES = 5;

    // Load recent searches on component mount
    React.useEffect(() => {
        loadRecentSearches();
    }, []);

    const loadRecentSearches = async () => {
        try {
            const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
            if (stored) {
                const searches = JSON.parse(stored);
                setRecentSearches(searches);
            }
        } catch (error) {
            console.error('Error loading recent searches:', error);
        }
    };

    const saveRecentSearch = async (query: string) => {
        try {
            const trimmedQuery = query.trim();
            if (!trimmedQuery) return;

            // Get current recent searches
            const current = [...recentSearches];
            
            // Remove if already exists
            const filteredSearches = current.filter(search => 
                search.toLowerCase() !== trimmedQuery.toLowerCase()
            );
            
            // Add to beginning
            const updatedSearches = [trimmedQuery, ...filteredSearches].slice(0, MAX_RECENT_SEARCHES);
            
            // Save to state and storage
            setRecentSearches(updatedSearches);
            await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updatedSearches));
        } catch (error) {
            console.error('Error saving recent search:', error);
        }
    };

    const clearRecentSearches = async () => {
        try {
            await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
            setRecentSearches([]);
        } catch (error) {
            console.error('Error clearing recent searches:', error);
        }
    };

    const performSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setHasSearched(true);
        
        try {
            const results = await resortAPI.searchResorts(query.trim());
            setSearchResults(results);
            
            // Save to recent searches
            await saveRecentSearch(query.trim());
        } catch (error) {
            console.error('Search error:', error);
            Alert.alert('Error', 'Failed to search resorts. Please try again.');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (text: string) => {
        setSearchText(text);
        
        // Optional: Implement debounced search
        // For now, we'll search on submit only to avoid too many API calls
    };

    const handleSearchSubmit = () => {
        performSearch(searchText);
    };

    const handleRecentSearchPress = (searchTerm: string) => {
        setSearchText(searchTerm);
        performSearch(searchTerm);
    };

    const handleBackPress = () => {
        router.back();
    };

    const handleClearSearch = () => {
        setSearchText('');
        setSearchResults([]);
        setHasSearched(false);
    };

    const renderSearchResults = () => {
        if (loading) {
            return (
                <View className="flex-1 justify-center items-center py-20">
                    <ActivityIndicator size="large" color="#1F2937" />
                    <Text className="text-gray-600 mt-4 font-inter">Searching resorts...</Text>
                </View>
            );
        }

        if (hasSearched && searchResults.length === 0) {
            return (
                <View className="flex-1 justify-center items-center py-20">
                    <Search color="#9CA3AF" size={48} />
                    <Text className="text-lg font-semibold font-inter text-gray-900 mt-4">
                        No results found
                    </Text>
                    <Text className="text-gray-600 text-center mt-2 px-8 font-inter">
                        Try searching with different keywords or check your spelling
                    </Text>
                </View>
            );
        }

        if (searchResults.length > 0) {
            return (
                <View className="mb-6">
                    <Text className="text-lg font-semibold font-inter text-gray-900 mb-4">
                        Search Results ({searchResults.length})
                    </Text>
                    
                    <View className="space-y-4">
                        {searchResults.map((resort) => (
                            <TouchableOpacity
                                key={resort._id}
                                className="bg-white rounded-2xl shadow-sm overflow-hidden"
                                activeOpacity={0.7}
                                onPress={() => {
                                    // Navigate to resort details
                                    router.push({
                                        pathname: '/customer/ResortDetailsScreen',
                                        params: { resortId: resort._id }
                                    });
                                }}
                            >
                                {/* Resort Image */}
                                <View className="relative m-2">
                                    {resort.image ? (
                                        <Image 
                                            source={{ uri: resort.image }} 
                                            className="w-full h-48 rounded-lg"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View className="w-full h-48 bg-gray-200 items-center justify-center">
                                            <Text className="text-sm text-gray-500 font-inter">No Image</Text>
                                        </View>
                                    )}
                                    
                                </View>

                                {/* Resort Info */}
                                <View className="p-4">
                                    {/* First Row - Resort Name and Address */}
                                    <View className="flex-row items-start justify-between ">
                                        <Text className="text-lg font-semibold font-inter text-gray-900 flex-1 mr-4">
                                            {resort.resort_name}
                                        </Text>
                                        <View className="flex-row items-center">
                                            <MapPin color="#6B7280" size={14} />
                                            <Text className="text-sm text-gray-600 ml-1 font-inter" numberOfLines={1}>
                                                {resort.location.address}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    {/* Description */}
                                    {resort.description && (
                                        <Text className="text-sm text-gray-600 font-inter " numberOfLines={2}>
                                            {resort.description}
                                        </Text>
                                    )}
                                    
                                    {/* Bottom Row - Rating and Price */}
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center">
                                            <Star color="#FCD34D" size={14} fill="#FCD34D" />
                                            <Text className="text-sm text-gray-900 ml-1 font-inter font-medium">
                                                4.8
                                            </Text>
                                            <Text className="text-sm text-gray-500 ml-1 font-inter">
                                                (1800 reviews)
                                            </Text>
                                        </View>
                                        
                                        <View className="items-end">
                                            <Text className="text-lg font-bold font-inter text-gray-900">
                                                $90
                                            </Text>
                                            <Text className="text-sm text-gray-500 font-inter">
                                                /Night
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            );
        }

        return null;
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            {/* Header */}
            <View className="bg-white px-4 pt-10 pb-4 mb-3">
                <View className="flex-row items-center justify-center relative">
                    {/* Back Button - Positioned absolutely to left */}
                    <TouchableOpacity
                        onPress={handleBackPress}
                        className="absolute left-0 w-8 h-8 items-center justify-center"
                        activeOpacity={0.6}
                    >
                        <ChevronLeft color="#1F2937" size={24} />
                    </TouchableOpacity>

                    {/* Centered Title */}
                    <Text className="text-lg font-semibold font-inter text-gray-900">
                        Search Resorts
                    </Text>
                </View>
            </View>

            {/* Search Input */}
            <View className="px-4 pb-4">
                <View className="flex-row items-center bg-white rounded-2xl px-4 ">
                    <Search color="#9CA3AF" size={20} />
                    <TextInput
                        className="flex-1 ml-3 text-base text-gray-900 font-inter"
                        placeholder="Search"
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={handleSearchChange}
                        onSubmitEditing={handleSearchSubmit}
                        returnKeyType="search"
                        autoFocus={true}
                        style={{ fontSize: 16, fontFamily: 'Inter' }}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity
                            onPress={handleClearSearch}
                            className="w-5 h-5 items-center justify-center ml-2"
                            activeOpacity={0.6}
                        >
                            <X color="#9CA3AF" size={16} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            
            <ScrollView className="flex-1 px-4">
                {/* Search Results */}
                {renderSearchResults()}

                {/* Recent Searches Section - Show only when no search results */}
                {!hasSearched && (
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <History color="#374151" size={18} />
                                <Text className="text-sm font-semibold font-inter text-gray-900 ml-2">
                                    Recent Searches
                                </Text>
                            </View>
                            {recentSearches.length > 0 && (
                                <TouchableOpacity
                                    onPress={clearRecentSearches}
                                    activeOpacity={0.7}
                                >
                                    <Text className="text-sm text-gray-900 font-inter">Clear All</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        
                        {recentSearches.length > 0 ? (
                            <View className="space-y-1">
                                {recentSearches.map((search, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => handleRecentSearchPress(search)}
                                        className="py-3 border-b border-gray-100 active:bg-gray-50"
                                        activeOpacity={0.7}
                                    >
                                        <Text className="text-base text-gray-700 font-medium font-inter">
                                            {search}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View className="py-8 items-center">
                                <History color="#D1D5DB" size={48} />
                                <Text className="text-gray-500 mt-2 text-center font-inter">
                                    No recent searches
                                </Text>
                                <Text className="text-gray-400 text-sm text-center mt-1 font-inter">
                                    Your search history will appear here
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}