import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  isAdmin: boolean;
  botPresent: boolean;
}

export function useGuilds() {
  return useQuery<Guild[]>({
    queryKey: ['guilds'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/guilds/my-guilds');
        console.log('Guilds API response:', response.data);
        
        if (!response.data.success) {
          console.error('API returned error:', response.data);
          throw new Error(response.data.error || 'Failed to fetch guilds');
        }
        
        return response.data.data || [];
      } catch (error) {
        console.error('Error fetching guilds:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export function useGuildDetails(guildId: string | null) {
  return useQuery({
    queryKey: ['guild-details', guildId],
    queryFn: async () => {
      if (!guildId) return null;
      const response = await axios.get(`/api/guilds/${guildId}/details`);
      return response.data.data;
    },
    enabled: !!guildId,
  });
}