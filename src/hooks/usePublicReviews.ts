import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  profile?: {
    name: string;
    avatar_url: string | null;
  };
}

export const usePublicReviews = (limit?: number) => {
  return useQuery({
    queryKey: ['public-reviews', limit],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select('id, rating, comment, created_at, user_id')
        .not('comment', 'is', null)
        .gte('rating', 4)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data: reviews, error } = await query;

      if (error) throw error;
      if (!reviews || reviews.length === 0) return [];

      const userIds = [...new Set(reviews.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return reviews.map(review => ({
        ...review,
        profile: profileMap.get(review.user_id) || undefined,
      })) as PublicReview[];
    },
  });
};

export const useAllPublicReviews = () => {
  return useQuery({
    queryKey: ['all-public-reviews'],
    queryFn: async () => {
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, created_at, user_id')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!reviews || reviews.length === 0) return [];

      const userIds = [...new Set(reviews.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      return reviews.map(review => ({
        ...review,
        profile: profileMap.get(review.user_id) || undefined,
      })) as PublicReview[];
    },
  });
};
