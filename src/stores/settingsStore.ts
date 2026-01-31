import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, SortField } from '@/types/settings';

interface SettingsState extends Settings {
  setDarkMode: (dark: boolean) => void;
  toggleSetting: (key: keyof Omit<Settings, 'sortType' | 'darkMode' | 'isLiveUpdate'>) => void;
  setSortType: (field: SortField | null, order: 'asc' | 'desc' | null) => void;
  setLiveUpdate: (live: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      showGSZ: false,
      showAmount: true,
      showGains: true,
      showCost: false,
      showCostRate: false,
      darkMode: false,  // 默认明亮主题
      sortType: { field: null, order: null },
      isLiveUpdate: true,

      setDarkMode: (dark) => set({ darkMode: dark }),

      toggleSetting: (key) => set(state => ({ [key]: !state[key] })),

      setSortType: (field, order) => set({ sortType: { field, order } }),

      setLiveUpdate: (live) => set({ isLiveUpdate: live }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
