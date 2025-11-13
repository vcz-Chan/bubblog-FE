'use client';

import { create } from 'zustand';
import { getUserProfile } from '@/apis/userApi';

interface ProfileState {
  nickname: string | null;
  profileImageUrl: string | null;
  error: string | null;
  isLoading: boolean;
  fetchProfile: (userId: string) => Promise<void>;
  setProfile: (profile: { nickname: string | null; profileImageUrl: string | null }) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  nickname: null,
  profileImageUrl: null,
  error: null,
  isLoading: false,

  fetchProfile: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await getUserProfile(userId);
      if (profile) {
        set({ 
          nickname: profile.nickname,
          profileImageUrl: profile.profileImageUrl,
          isLoading: false 
        });
      }
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  setProfile: (profile) => {
    set(profile);
  },

  clearProfile: () => {
    set({ nickname: null, profileImageUrl: null, error: null });
  },
}));
