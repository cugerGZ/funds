import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FundItem, FundData } from '@/types/fund';

interface FundState {
  // 持久化数据
  fundList: FundItem[];           // 基金列表（代码+份额+成本）
  indexList: string[];            // 指数列表

  // 运行时数据
  fundData: FundData[];           // 基金实时数据
  isLoading: boolean;

  // Actions
  addFund: (code: string) => void;
  addFunds: (codes: string[]) => void;
  removeFund: (code: string) => void;
  updateFund: (code: string, updates: { num?: number; cost?: number }) => void;
  updateFundNum: (code: string, num: number) => void;
  updateFundCost: (code: string, cost: number | undefined) => void;
  reorderFunds: (fromIndex: number, toIndex: number) => void;
  setFundData: (data: FundData[]) => void;
  setLoading: (loading: boolean) => void;
  setFundList: (list: FundItem[]) => void;

  // 指数操作
  addIndex: (code: string) => void;
  removeIndex: (code: string) => void;
  reorderIndex: (fromIndex: number, toIndex: number) => void;
  setIndexList: (list: string[]) => void;

  // 导入导出
  importFunds: (funds: FundItem[]) => void;
  exportFunds: () => FundItem[];
}

export const useFundStore = create<FundState>()(
  persist(
    (set, get) => ({
      fundList: [],
      indexList: ['1.000001', '1.000300', '0.399001', '0.399006'],
      fundData: [],
      isLoading: false,

      addFund: (code) => {
        const { fundList } = get();
        if (!fundList.find(f => f.code === code)) {
          set({ fundList: [...fundList, { code, num: 0 }] });
        }
      },

      addFunds: (codes) => {
        const { fundList } = get();
        const newFunds = codes
          .filter(code => !fundList.find(f => f.code === code))
          .map(code => ({ code, num: 0 }));
        set({ fundList: [...fundList, ...newFunds] });
      },

      removeFund: (code) => {
        set(state => ({
          fundList: state.fundList.filter(f => f.code !== code),
          fundData: state.fundData.filter(f => f.fundcode !== code),
        }));
      },

      updateFund: (code, updates) => {
        set(state => ({
          fundList: state.fundList.map(f =>
            f.code === code ? { ...f, ...updates } : f
          ),
        }));
      },

      updateFundNum: (code, num) => {
        set(state => ({
          fundList: state.fundList.map(f =>
            f.code === code ? { ...f, num } : f
          ),
        }));
      },

      updateFundCost: (code, cost) => {
        set(state => ({
          fundList: state.fundList.map(f =>
            f.code === code ? { ...f, cost } : f
          ),
        }));
      },

      reorderFunds: (fromIndex, toIndex) => {
        set(state => {
          const newList = [...state.fundList];
          const [removed] = newList.splice(fromIndex, 1);
          newList.splice(toIndex, 0, removed);
          return { fundList: newList };
        });
      },

      setFundData: (data) => set({ fundData: data }),
      setLoading: (loading) => set({ isLoading: loading }),
      setFundList: (list) => set({ fundList: list }),

      addIndex: (code) => {
        const { indexList } = get();
        if (!indexList.includes(code) && indexList.length < 6) {
          set({ indexList: [...indexList, code] });
        }
      },

      removeIndex: (code) => {
        set(state => ({
          indexList: state.indexList.filter(c => c !== code),
        }));
      },

      reorderIndex: (fromIndex, toIndex) => {
        set(state => {
          const newList = [...state.indexList];
          const [removed] = newList.splice(fromIndex, 1);
          newList.splice(toIndex, 0, removed);
          return { indexList: newList };
        });
      },

      setIndexList: (list) => set({ indexList: list }),

      importFunds: (funds) => set({ fundList: funds }),
      exportFunds: () => get().fundList,
    }),
    {
      name: 'fund-storage',
      partialize: (state) => ({
        fundList: state.fundList,
        indexList: state.indexList,
      }),
    }
  )
);
