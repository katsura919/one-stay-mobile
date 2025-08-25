import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { router } from 'expo-router';
import { authenticatedApiRequest } from '@/utils/api';
import { getUserIdFromToken } from '@/utils/auth';
import { useAuth } from './AuthContext';

// Resort interface based on the existing service
export interface Resort {
  _id: string;
  owner_id: string;
  resort_name: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  description?: string;
  image?: string;
  createdAt: string;
  deleted: boolean;
}

interface ResortContextType {
  resorts: Resort[];
  loading: boolean;
  error: string | null;
  refreshResorts: () => Promise<void>;
  fetchResortsByOwner: () => Promise<void>;
  hasResorts: boolean;
}

const ResortContext = createContext<ResortContextType | null>(null);

export const useResort = () => {
  const context = useContext(ResortContext);
  if (!context) {
    throw new Error('useResort must be used within a ResortProvider');
  }
  return context;
};

interface ResortProviderProps {
  children: ReactNode;
}

export const ResortProvider: React.FC<ResortProviderProps> = ({ children }) => {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedResorts, setHasCheckedResorts] = useState(false);
  const { user, token } = useAuth();

  // Computed property to check if user has resorts
  const hasResorts = resorts.length > 0;

  // Function to fetch resorts by owner ID
  const fetchResortsByOwner = async () => {
    if (!token || !user?.id) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userId = await getUserIdFromToken();
      if (!userId) {
        throw new Error('Unable to get user ID from token');
      }

      const data = await authenticatedApiRequest(`/resort/owner/${userId}`);
      const resortsData = Array.isArray(data) ? data : [data];
      // Filter out any null or invalid resort data
      const validResorts = resortsData.filter(resort => resort && resort._id);
      setResorts(validResorts);
      setHasCheckedResorts(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch resorts';
      // If error is about no resorts found, set empty array instead of error
      if (errorMessage.toLowerCase().includes('no resorts found') || 
          errorMessage.toLowerCase().includes('not found')) {
        setResorts([]);
        setError(null);
      } else {
        setError(errorMessage);
      }
      setHasCheckedResorts(true);
      console.error('Error fetching resorts by owner:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh function (alias for fetchResortsByOwner)
  const refreshResorts = async () => {
    await fetchResortsByOwner();
  };

  // Fetch resorts when user is authenticated and is an owner
  useEffect(() => {
    if (user && user.role === 'owner' && token) {
      fetchResortsByOwner();
    }
  }, [user, token]);

  // Auto-redirect to CreateResort if no resorts exist (only within owner-tabs context)
  useEffect(() => {
    if (hasCheckedResorts && user && user.role === 'owner' && !loading && !hasResorts && !error) {
      router.replace('/CreateResort');
    }
  }, [hasCheckedResorts, user, loading, hasResorts, error]);

  const value: ResortContextType = {
    resorts,
    loading,
    error,
    refreshResorts,
    fetchResortsByOwner,
    hasResorts,
  };

  return (
    <ResortContext.Provider value={value}>
      {children}
    </ResortContext.Provider>
  );
};
