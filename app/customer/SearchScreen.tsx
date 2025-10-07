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
                    <Text style={{ fontSize: 14, fontFamily: 'Roboto', color: '#6B7280', marginTop: 12 }}>
                        Searching resorts...
                    </Text>
                </View>
            );
        }

        if (hasSearched && searchResults.length === 0) {
            return (
                <View className="flex-1 justify-center items-center py-20">
                    <View className="bg-gray-100 rounded-full p-6">
                        <Search color="#9CA3AF" size={40} />
                    </View>
                    <Text style={{ fontSize: 17, fontFamily: 'Roboto-Bold', color: '#111827', marginTop: 16 }}>
                        No results found
                    </Text>
                    <Text style={{ fontSize: 13, fontFamily: 'Roboto', color: '#6B7280', textAlign: 'center', marginTop: 8, paddingHorizontal: 32 }}>
                        Try searching with different keywords or check your spelling
                    </Text>
                </View>
            );
        }

        if (searchResults.length > 0) {
            return (
                <View className="mb-6">
                    <Text style={{ fontSize: 13, fontFamily: 'Roboto-Bold', color: '#111827', marginBottom: 12 }}>
                        {searchResults.length} {searchResults.length === 1 ? 'Result' : 'Results'}
                    </Text>
                    
                    <View className="gap-3">
                        {searchResults.map((resort) => (
                            <TouchableOpacity
                                key={resort._id}
                                className="bg-white rounded-2xl overflow-hidden border border-gray-100"
                                activeOpacity={0.9}
                                onPress={() => {
                                    router.push({
                                        pathname: '/customer/ResortDetailsScreen',
                                        params: { resortId: resort._id }
                                    });
                                }}
                            >
                                <View className="flex-row">
                                    {/* Resort Image */}
                                    <View className="w-28 h-28">
                                        {resort.image ? (
                                            <Image 
                                                source={{ uri: resort.image }} 
                                                className="w-full h-full"
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View className="w-full h-full bg-gray-200 items-center justify-center">
                                                <Text style={{ fontSize: 11, fontFamily: 'Roboto', color: '#9CA3AF' }}>
                                                    No Image
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Resort Info */}
                                    <View className="flex-1 p-3">
                                        {/* Resort Name */}
                                        <Text 
                                            style={{ fontSize: 15, fontFamily: 'Roboto-Bold', color: '#111827', marginBottom: 2 }}
                                            numberOfLines={1}
                                        >
                                            {resort.resort_name}
                                        </Text>
                                        
                                        {/* Location */}
                                        <View className="flex-row items-center mb-2">
                                            <MapPin color="#6B7280" size={12} />
                                            <Text 
                                                style={{ fontSize: 12, fontFamily: 'Roboto', color: '#6B7280', marginLeft: 4, flex: 1 }}
                                                numberOfLines={1}
                                            >
                                                {resort.location?.address?.split(',')[0] || 'Location'}
                                            </Text>
                                        </View>
                                        
                                        {/* Description */}
                                        {resort.description && (
                                            <Text 
                                                style={{ fontSize: 11, fontFamily: 'Roboto', color: '#9CA3AF', marginBottom: 6 }}
                                                numberOfLines={2}
                                            >
                                                {resort.description}
                                            </Text>
                                        )}
                                        
                                        {/* Price - Bottom aligned */}
                                        <View className="flex-row items-center justify-between mt-auto">
                                            <View className="flex-row items-center bg-gray-100 px-2 py-1 rounded-lg">
                                                <Star color="#F59E0B" size={11} fill="#F59E0B" />
                                                <Text style={{ fontSize: 11, fontFamily: 'Roboto-Medium', color: '#111827', marginLeft: 3 }}>
                                                    4.8
                                                </Text>
                                            </View>
                                            
                                            <View className="flex-row items-baseline">
                                                <Text style={{ fontSize: 15, fontFamily: 'Roboto-Bold', color: '#111827' }}>
                                                    ₱1,500
                                                </Text>
                                                <Text style={{ fontSize: 11, fontFamily: 'Roboto', color: '#6B7280', marginLeft: 2 }}>
                                                    /night
                                                </Text>
                                            </View>
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
        <SafeAreaView className="flex-1 py-5 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-5 pt-3 pb-3 shadow-sm">
                <View className="flex-row items-center justify-center relative">
                    {/* Back Button - Positioned absolutely to left */}
                    <TouchableOpacity
                        onPress={handleBackPress}
                        className="absolute left-0 w-9 h-9 items-center justify-center rounded-full"
                        activeOpacity={0.7}
                    >
                        <ChevronLeft color="#1F2937" size={20} />
                    </TouchableOpacity>

                    {/* Centered Title */}
                    <Text style={{ fontSize: 17, fontFamily: 'Roboto-Bold', color: '#111827' }}>
                        Search Resorts
                    </Text>
                </View>
            </View>

            {/* Search Input */}
            <View className="px-5 py-3 bg-white">
                <View className="flex-row items-center bg-gray-50 rounded-xl px-3.5 py-2.5 border border-gray-200">
                    <Search color="#6B7280" size={18} />
                    <TextInput
                        className="flex-1 ml-2.5 text-gray-900"
                        placeholder="Search by name or location..."
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={handleSearchChange}
                        onSubmitEditing={handleSearchSubmit}
                        returnKeyType="search"
                        autoFocus={true}
                        style={{ fontSize: 14, fontFamily: 'Roboto' }}
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity
                            onPress={handleClearSearch}
                            className="w-6 h-6 items-center justify-center ml-2 bg-gray-200 rounded-full"
                            activeOpacity={0.7}
                        >
                            <X color="#6B7280" size={14} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            
            <ScrollView className="flex-1 px-5 pt-3">
                {/* Search Results */}
                {renderSearchResults()}

                {/* Recent Searches Section - Show only when no search results */}
                {!hasSearched && (
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center">
                                <History color="#1F2937" size={16} />
                                <Text style={{ fontSize: 14, fontFamily: 'Roboto-Bold', color: '#111827', marginLeft: 8 }}>
                                    Recent Searches
                                </Text>
                            </View>
                            {recentSearches.length > 0 && (
                                <TouchableOpacity
                                    onPress={clearRecentSearches}
                                    activeOpacity={0.7}
                                >
                                    <Text style={{ fontSize: 12, fontFamily: 'Roboto-Medium', color: '#1F2937' }}>
                                        Clear All
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        
                        {recentSearches.length > 0 ? (
                            <View className="bg-white rounded-xl overflow-hidden border border-gray-100">
                                {recentSearches.map((search, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => handleRecentSearchPress(search)}
                                        className="px-4 py-3 border-b border-gray-50 active:bg-gray-50"
                                        activeOpacity={0.8}
                                        style={{ borderBottomWidth: index === recentSearches.length - 1 ? 0 : 1 }}
                                    >
                                        <Text style={{ fontSize: 14, fontFamily: 'Roboto', color: '#374151' }}>
                                            {search}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View className="py-12 items-center bg-white rounded-xl border border-gray-100">
                                <View className="bg-gray-100 rounded-full p-4">
                                    <History color="#D1D5DB" size={32} />
                                </View>
                                <Text style={{ fontSize: 14, fontFamily: 'Roboto-Medium', color: '#6B7280', marginTop: 12 }}>
                                    No recent searches
                                </Text>
                                <Text style={{ fontSize: 12, fontFamily: 'Roboto', color: '#9CA3AF', textAlign: 'center', marginTop: 4 }}>
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