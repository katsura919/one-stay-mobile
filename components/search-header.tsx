import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { ChevronLeft, Search, X } from 'lucide-react-native';
import { router } from 'expo-router';

interface SearchHeaderProps {
  placeholder?: string;
  onSearchChange?: (text: string) => void;
  onSearchSubmit?: (text: string) => void;
  autoFocus?: boolean;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({
  placeholder = "Search resorts, locations...",
  onSearchChange,
  onSearchSubmit,
  autoFocus = true
}) => {
  const [searchText, setSearchText] = useState('');

  const handleBackPress = () => {
    router.back();
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    onSearchChange?.(text);
  };

  const handleClearSearch = () => {
    setSearchText('');
    onSearchChange?.('');
  };

  const handleSearchSubmit = () => {
    onSearchSubmit?.(searchText);
  };

  return (
    <View className="bg-white pt-12 pr-5 pl-2">
      <View className="flex-row items-center">
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBackPress}
          className="w-9 h-9 items-center justify-center rounded-full mr-3"
          activeOpacity={0.6}
        >
          <ChevronLeft color="#1F2937" size={25} />
        </TouchableOpacity>

        {/* Search Input Container */}
        <View className="flex-1 flex-row items-center bg-gray-50 rounded-xl px-3 py-1 border border-gray-200/80">
          
          <TextInput
            className="flex-1 ml-2.5 text-sm text-gray-900 font-medium"
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={handleSearchChange}
            onSubmitEditing={handleSearchSubmit}
            autoFocus={autoFocus}
            returnKeyType="search"
            clearButtonMode="never"
            style={{ 
              fontSize: 15,
              lineHeight: 20,
              letterSpacing: 0.2
            }}
          />
          
          {/* Clear Button */}
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              className="w-5 h-5 items-center justify-center rounded-full bg-gray-400/20 ml-2"
              activeOpacity={0.6}
            >
              <X color="#6B7280" size={12} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default SearchHeader;
