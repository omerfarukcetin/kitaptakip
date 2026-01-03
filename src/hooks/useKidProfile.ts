import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Profile } from '../lib/database.types';

export const useKidProfile = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id)
                .single();

            if (error) throw error;
            return data as Profile;
        },
        enabled: !!user,
    });

    const updateKidStats = useMutation({
        mutationFn: async ({ xpToAdd, goldToAdd }: { xpToAdd: number; goldToAdd: number }) => {
            if (!profile || !user) return;

            const newXp = (profile.xp || 0) + xpToAdd;
            const newGold = (profile.gold || 0) + goldToAdd;
            const newLevel = Math.floor(newXp / 1000) + 1;

            const { error } = await supabase
                .from('profiles')
                .update({
                    xp: newXp,
                    gold: newGold,
                    kid_level: newLevel
                } as any)
                .eq('id', user.id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
        },
    });

    const addReward = useMutation({
        mutationFn: async ({ title, price, icon }: { title: string; price: number; icon: string }) => {
            if (!user) return;
            const { error } = await supabase
                .from('kid_rewards')
                .insert({
                    user_id: user.id,
                    title,
                    price,
                    icon,
                    is_claimed: false
                } as any);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kid_rewards'] });
        }
    });

    const claimReward = useMutation({
        mutationFn: async (rewardId: string) => {
            if (!user || !profile) return;

            // First check if user has enough gold
            const { data: reward, error: fetchError } = await supabase
                .from('kid_rewards')
                .select('*')
                .eq('id', rewardId)
                .single();

            if (fetchError || !reward) throw new Error('Ödül bulunamadı');
            if (profile.gold < (reward as any).price) throw new Error('Yeterli altının yok! 🪙');

            // Deduct gold and mark as claimed
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ gold: profile.gold - (reward as any).price } as any)
                .eq('id', user.id);

            if (updateError) throw updateError;

            const { error: claimError } = await supabase
                .from('kid_rewards')
                .update({ is_claimed: true } as any)
                .eq('id', rewardId);

            if (claimError) throw claimError;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['kid_rewards'] });
        }
    });

    return {
        profile,
        isLoading,
        updateKidStats,
        addReward,
        claimReward
    };
};
