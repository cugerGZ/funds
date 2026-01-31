# funds-master 迁移至 funds 技术方案

> 项目名称：**基金派**
> 文档版本：1.0
> 创建日期：2026年2月1日

## 一、迁移概述

### 1.1 项目背景

将 **funds-master**（Chrome 浏览器扩展）的全部功能迁移到 **基金派**（Astro + React Web 应用）。

**项目名称确认**：基金派
**部署平台**：Vercel
**PWA 支持**：不需要
**数据迁移**：不需要（新项目，无老用户数据迁移需求）

### 1.2 技术栈对比

| 项目 | funds-master（源） | funds（目标） |
|------|-------------------|---------------|
| 框架 | Vue 2 + Webpack | Astro 5 + React 19 |
| UI 组件 | Element UI | shadcn/ui |
| 图表 | ECharts 4 | ECharts 5 |
| 样式 | SCSS | Tailwind CSS |
| 状态管理 | Vue data + chrome.storage | Zustand + localStorage |
| HTTP 请求 | Axios | Axios |
| 图标 | Element Icons | Lucide React |
| 类型系统 | 无 | TypeScript |

### 1.3 迁移范围

**高优先级功能（第一阶段 MVP）**：
- ✅ 基金管理功能（添加/删除/排序）
- ✅ 实时数据展示（估值/涨跌幅）
- ✅ 收益计算功能（日收益/持有收益）
- ✅ 指数栏展示
- ✅ 图表展示功能（估值走势/历史净值）
- ✅ 详情查看功能（基金详情/持仓明细）
- ✅ 行情中心功能（大盘/行业/北向南向）
- ✅ 设置功能（显示设置/主题切换）
- ✅ **移动端响应式适配**
- ✅ **明暗主题切换**

**低优先级功能（第二阶段）**：
- 🔜 数据导入导出（Excel/JSON）
- 🔜 拖拽排序优化
- 🔜 更多图表类型

**不迁移功能**：
- ❌ 浏览器角标提醒（Web 不支持）
- ❌ chrome.storage 同步（改用 localStorage）
- ❌ PWA 功能（明确不需要）
- ❌ 数据迁移功能（新项目）

### 1.4 核心特性

- 📱 **移动端优先**：完全响应式设计，适配手机、平板、桌面端
- 🌓 **主题切换**：支持明亮/暗黑两种主题模式
- ⚡ **性能优化**：快速加载，流畅交互
- 💾 **本地存储**：数据保存在浏览器本地，无需注册

---

## 二、目标项目结构

```
funds/
├── public/
│   ├── favicon.ico
│   └── holiday.json              # 节假日数据
├── src/
│   ├── components/
│   │   ├── ui/                   # shadcn/ui 组件
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   ├── fund/                 # 基金相关组件
│   │   │   ├── FundList.tsx      # 基金列表
│   │   │   ├── FundItem.tsx      # 基金列表项
│   │   │   ├── FundSearch.tsx    # 基金搜索
│   │   │   ├── FundDetail.tsx    # 基金详情弹窗
│   │   │   ├── FundInfo.tsx      # 基金概况
│   │   │   ├── PositionDetail.tsx # 持仓明细
│   │   │   └── ManagerDetail.tsx  # 基金经理
│   │   ├── index/                # 指数相关组件
│   │   │   ├── IndexBar.tsx      # 指数栏
│   │   │   ├── IndexItem.tsx     # 指数项
│   │   │   └── IndexDetail.tsx   # 指数详情
│   │   ├── chart/                # 图表组件
│   │   │   ├── EstimateChart.tsx  # 估值走势图
│   │   │   ├── HistoryChart.tsx   # 历史净值图
│   │   │   ├── ProfitChart.tsx    # 收益走势图
│   │   │   └── ChartTheme.ts      # 图表主题
│   │   ├── market/               # 行情中心组件
│   │   │   ├── Market.tsx        # 行情中心入口
│   │   │   ├── MarketFlow.tsx    # 大盘资金
│   │   │   ├── IndustryFlow.tsx  # 行业板块
│   │   │   ├── NorthFlow.tsx     # 北向资金
│   │   │   └── SouthFlow.tsx     # 南向资金
│   │   ├── settings/             # 设置相关组件
│   │   │   ├── Settings.tsx      # 设置页面
│   │   │   ├── DisplaySettings.tsx # 显示设置
│   │   │   └── ImportExport.tsx  # 导入导出
│   │   └── layout/               # 布局组件
│   │       ├── Header.tsx        # 顶部导航
│   │       ├── Footer.tsx        # 底部
│   │       └── ThemeToggle.tsx   # 主题切换
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── useFundData.ts        # 基金数据
│   │   ├── useIndexData.ts       # 指数数据
│   │   ├── useMarketStatus.ts    # 市场状态
│   │   └── useLocalStorage.ts    # 本地存储
│   ├── stores/                   # Zustand 状态管理
│   │   ├── fundStore.ts          # 基金状态
│   │   ├── settingsStore.ts      # 设置状态
│   │   └── marketStore.ts        # 行情状态
│   ├── services/                 # API 服务
│   │   ├── api.ts                # Axios 配置
│   │   ├── fundApi.ts            # 基金 API
│   │   ├── indexApi.ts           # 指数 API
│   │   ├── marketApi.ts          # 行情 API
│   │   └── searchApi.ts          # 搜索 API
│   ├── utils/                    # 工具函数
│   │   ├── calculate.ts          # 收益计算
│   │   ├── format.ts             # 格式化
│   │   ├── holiday.ts            # 节假日判断
│   │   └── time.ts               # 时间处理
│   ├── types/                    # TypeScript 类型
│   │   ├── fund.ts               # 基金类型
│   │   ├── index.ts              # 指数类型
│   │   └── settings.ts           # 设置类型
│   ├── styles/                   # 全局样式
│   │   └── globals.css           # Tailwind 全局样式
│   ├── layouts/
│   │   └── Layout.astro          # Astro 布局
│   └── pages/
│       ├── index.astro           # 首页
│       ├── market.astro          # 行情中心页
│       └── settings.astro        # 设置页
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── components.json               # shadcn/ui 配置
└── package.json
```

---

## 三、依赖安装

### 3.1 基础依赖

```bash
# React 支持
pnpm add @astrojs/react react react-dom

# Tailwind CSS
pnpm add -D tailwindcss @astrojs/tailwind autoprefixer

# TypeScript
pnpm add -D typescript @types/react @types/react-dom
```

### 3.2 UI 和样式依赖

```bash
# shadcn/ui 基础依赖
pnpm add class-variance-authority clsx tailwind-merge
pnpm add @radix-ui/react-dialog @radix-ui/react-select
pnpm add @radix-ui/react-switch @radix-ui/react-slider
pnpm add @radix-ui/react-tabs @radix-ui/react-popover
pnpm add @radix-ui/react-dropdown-menu

# 图标
pnpm add lucide-react
```

### 3.3 功能依赖

```bash
# 状态管理
pnpm add zustand

# HTTP 请求
pnpm add axios

# 图表
pnpm add echarts echarts-for-react

# 导出功能
pnpm add xlsx file-saver
pnpm add -D @types/file-saver

# 拖拽排序
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 3.4 完整 package.json

```json
{
  "name": "funds",
  "type": "module",
  "version": "1.0.0",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "@astrojs/react": "^4.2.0",
    "@astrojs/tailwind": "^6.0.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@radix-ui/react-dialog": "^1.1.4",
    "@radix-ui/react-dropdown-menu": "^2.1.4",
    "@radix-ui/react-popover": "^1.1.4",
    "@radix-ui/react-select": "^2.1.4",
    "@radix-ui/react-slider": "^1.2.2",
    "@radix-ui/react-switch": "^1.1.2",
    "@radix-ui/react-tabs": "^1.1.2",
    "astro": "^5.17.1",
    "axios": "^1.7.9",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "echarts": "^5.5.1",
    "echarts-for-react": "^3.0.2",
    "file-saver": "^2.0.5",
    "lucide-react": "^0.469.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^2.6.0",
    "xlsx": "^0.18.5",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@types/file-saver": "^2.0.7",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.20",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.7.2"
  }
}
```

---

## 四、配置文件

### 4.1 astro.config.mjs

```javascript
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  output: 'static',
});
```

### 4.2 tailwind.config.mjs

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'], // 支持 class 模式的暗黑主题切换
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // 响应式断点
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        // 自定义涨跌颜色
        up: {
          DEFAULT: '#ef4444',
          light: '#fecaca',
        },
        down: {
          DEFAULT: '#22c55e',
          light: '#bbf7d0',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### 4.3 tsconfig.json

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/services/*": ["./src/services/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

---

## 五、类型定义

### 5.1 基金类型 (src/types/fund.ts)

```typescript
// 基金列表项（存储）
export interface FundItem {
  code: string;       // 基金代码
  num: number;        // 持有份额
  cost?: number;      // 成本价
}

// 基金数据（API 返回 + 计算）
export interface FundData {
  fundcode: string;   // 基金代码
  name: string;       // 基金名称
  jzrq: string;       // 净值日期
  dwjz: number | null; // 单位净值
  gsz: number | null;  // 估算净值
  gszzl: number;      // 估算涨跌幅
  gztime: string;     // 估值时间
  hasReplace: boolean; // 是否已更新实际净值
  num: number;        // 持有份额
  cost?: number;      // 成本价
  amount: number;     // 持有金额
  gains: number;      // 当日收益
  costGains: number;  // 持有收益
  costGainsRate: number; // 持有收益率
}

// API 返回原始数据
export interface FundApiResponse {
  FCODE: string;
  SHORTNAME: string;
  PDATE: string;
  NAV: string;
  GSZ: string;
  GSZZL: string;
  GZTIME: string;
  NAVCHGRT: string;
}

// 基金详情信息
export interface FundInfo {
  FCODE: string;
  SHORTNAME: string;
  FTYPE: string;      // 基金类型
  JJGS: string;       // 基金公司
  JJJL: string;       // 基金经理
  DWJZ: string;       // 单位净值
  LJJZ: string;       // 累计净值
  FSRQ: string;       // 净值日期
  ENDNAV: string;     // 基金规模
  SGZT: string;       // 申购状态
  SHZT: string;       // 赎回状态
  SYL_Y: string;      // 近1月收益率
  SYL_3Y: string;     // 近3月收益率
  SYL_6Y: string;     // 近6月收益率
  SYL_1N: string;     // 近1年收益率
  RANKM: string;      // 近1月排名
  RANKQ: string;      // 近3月排名
  RANKHY: string;     // 近6月排名
  RANKY: string;      // 近1年排名
}

// 持仓股票
export interface StockPosition {
  GPDM: string;       // 股票代码
  GPJC: string;       // 股票简称
  JZBL: string;       // 持仓占比
  PCTNVCHG: string;   // 较上期变化
  PCTNVCHGTYPE: string; // 变化类型
  NEWTEXCH: string;   // 交易所
}

// 搜索结果
export interface SearchResult {
  CODE: string;
  NAME: string;
}
```

### 5.2 指数类型 (src/types/index.ts)

```typescript
// 指数数据
export interface IndexData {
  f2: number;         // 最新价
  f3: number;         // 涨跌幅
  f4: number;         // 涨跌额
  f12: string;        // 代码
  f13: number;        // 市场(1=沪,0=深)
  f14: string;        // 名称
}

// 指数配置
export interface IndexConfig {
  value: string;      // 如 "1.000001"
  label: string;      // 如 "上证指数"
}

// 预定义指数列表
export const INDEX_OPTIONS: IndexConfig[] = [
  { value: '1.000001', label: '上证指数' },
  { value: '1.000300', label: '沪深300' },
  { value: '0.399001', label: '深证成指' },
  { value: '1.000688', label: '科创50' },
  { value: '0.399006', label: '创业板指' },
  { value: '0.399005', label: '中小板指' },
  { value: '100.HSI', label: '恒生指数' },
  { value: '100.DJIA', label: '道琼斯' },
  { value: '100.NDX', label: '纳斯达克' },
  { value: '100.SPX', label: '标普500' },
];
```

### 5.3 设置类型 (src/types/settings.ts)

```typescript
export interface Settings {
  // 显示设置
  showGSZ: boolean;        // 显示估算净值
  showAmount: boolean;     // 显示持有金额
  showGains: boolean;      // 显示估值收益
  showCost: boolean;       // 显示持有收益
  showCostRate: boolean;   // 显示持有收益率

  // 主题设置
  darkMode: boolean;       // 暗色模式

  // 排序设置
  sortType: {
    field: SortField | null;
    order: 'asc' | 'desc' | null;
  };

  // 实时更新
  isLiveUpdate: boolean;
}

export type SortField = 'gszzl' | 'gains' | 'amount' | 'costGains' | 'costGainsRate';
```

---

## 六、状态管理 (Zustand)

### 6.1 基金状态 (src/stores/fundStore.ts)

```typescript
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
  updateFundNum: (code: string, num: number) => void;
  updateFundCost: (code: string, cost: number) => void;
  reorderFunds: (fromIndex: number, toIndex: number) => void;
  setFundData: (data: FundData[]) => void;
  setLoading: (loading: boolean) => void;

  // 指数操作
  addIndex: (code: string) => void;
  removeIndex: (code: string) => void;
  reorderIndex: (fromIndex: number, toIndex: number) => void;

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

      addIndex: (code) => {
        const { indexList } = get();
        if (!indexList.includes(code) && indexList.length < 4) {
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
```

### 6.2 设置状态 (src/stores/settingsStore.ts)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings, SortField } from '@/types/settings';

interface SettingsState extends Settings {
  setDarkMode: (dark: boolean) => void;
  toggleSetting: (key: keyof Omit<Settings, 'sortType'>) => void;
  setSortType: (field: SortField | null, order: 'asc' | 'desc' | null) => void;
  setLiveUpdate: (live: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      showGSZ: false,
      showAmount: false,
      showGains: true,
      showCost: false,
      showCostRate: false,
      darkMode: false,
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
```

---
## 七、API 服务层

### 7.1 Axios 配置 (src/services/api.ts)

```typescript
import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 添加时间戳防止缓存
    config.params = {
      ...config.params,
      _: Date.now(),
    };
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
```

### 7.2 基金 API (src/services/fundApi.ts)

```typescript
import api from './api';
import type { FundApiResponse, FundInfo, StockPosition, SearchResult } from '@/types/fund';

const BASE_URL = 'https://fundmobapi.eastmoney.com';

// 生成设备 ID
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};

// 获取基金实时数据
export const fetchFundData = async (codes: string[]): Promise<FundApiResponse[]> => {
  if (codes.length === 0) return [];

  const url = `${BASE_URL}/FundMNewApi/FundMNFInfo`;
  const response = await api.get(url, {
    params: {
      pageIndex: 1,
      pageSize: 200,
      plat: 'Android',
      appType: 'ttjj',
      product: 'EFund',
      Version: 1,
      deviceid: getDeviceId(),
      Fcodes: codes.join(','),
    },
  });
  return response.Datas || [];
};

// 获取基金详情
export const fetchFundInfo = async (code: string): Promise<FundInfo> => {
  const url = `${BASE_URL}/FundMApi/FundBaseTypeInformation.ashx`;
  const response = await api.get(url, {
    params: {
      FCODE: code,
      deviceid: 'Wap',
      plat: 'Wap',
      product: 'EFund',
      version: '2.0.0',
    },
  });
  return response.Datas;
};

// 获取基金持仓
export const fetchFundPosition = async (code: string): Promise<{
  stocks: StockPosition[];
  date: string;
}> => {
  const url = `${BASE_URL}/FundMNewApi/FundMNInverstPosition`;
  const response = await api.get(url, {
    params: {
      FCODE: code,
      deviceid: 'Wap',
      plat: 'Wap',
      product: 'EFund',
      version: '2.0.0',
    },
  });
  return {
    stocks: response.Datas?.fundStocks || [],
    date: response.Expansion || '',
  };
};

// 搜索基金
export const searchFund = async (keyword: string): Promise<SearchResult[]> => {
  const url = 'https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx';
  const response = await api.get(url, {
    params: {
      m: 9,
      key: keyword,
    },
  });
  return response.Datas || [];
};

// 获取基金估值走势（当日分时）
export const fetchFundEstimateTrend = async (code: string): Promise<{
  time: string[];
  values: number[];
}> => {
  const url = `${BASE_URL}/FundMNewApi/FundMNGZTrend`;
  const response = await api.get(url, {
    params: {
      FCODE: code,
      deviceid: 'Wap',
      plat: 'Wap',
      product: 'EFund',
      version: '2.0.0',
    },
  });

  const data = response.Datas || [];
  return {
    time: data.map((item: any) => item.x),
    values: data.map((item: any) => parseFloat(item.y)),
  };
};
```

### 7.3 指数 API (src/services/indexApi.ts)

```typescript
import api from './api';
import type { IndexData } from '@/types/index';

const BASE_URL = 'https://push2.eastmoney.com';

// 获取指数实时数据
export const fetchIndexData = async (codes: string[]): Promise<IndexData[]> => {
  if (codes.length === 0) return [];

  const url = `${BASE_URL}/api/qt/ulist.np/get`;
  const response = await api.get(url, {
    params: {
      fltt: 2,
      fields: 'f2,f3,f4,f12,f13,f14',
      secids: codes.join(','),
    },
  });
  return response.data?.diff || [];
};

// 获取股票实时数据
export const fetchStockData = async (codes: string[]): Promise<IndexData[]> => {
  return fetchIndexData(codes);
};

// 获取指数/股票走势图数据
export const fetchTrendData = async (code: string): Promise<{
  time: string[];
  values: number[];
  changes: number[];
}> => {
  const url = `${BASE_URL}/api/qt/stock/trends2/get`;
  const response = await api.get(url, {
    params: {
      fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13',
      fields2: 'f51,f52,f53,f54,f55,f56,f57,f58',
      secid: code,
      ndays: 1,
      iscr: 0,
    },
  });

  const trends = response.data?.trends || [];
  const time: string[] = [];
  const values: number[] = [];
  const changes: number[] = [];

  trends.forEach((item: string) => {
    const parts = item.split(',');
    time.push(parts[0].split(' ')[1]);
    values.push(parseFloat(parts[2]));
    changes.push(parseFloat(parts[8]));
  });

  return { time, values, changes };
};
```

### 7.4 行情 API (src/services/marketApi.ts)

```typescript
import api from './api';

const BASE_URL = 'https://push2.eastmoney.com';

// 获取两市成交信息
export const fetchMarketTurnover = async () => {
  const url = `${BASE_URL}/api/qt/ulist.np/get`;
  const response = await api.get(url, {
    params: {
      fltt: 2,
      fields: 'f6,f104,f105,f106',
      secids: '1.000001,0.399001', // 上证、深证
    },
  });
  return response.data?.diff || [];
};

// 获取大盘资金流向
export const fetchMarketFlow = async () => {
  const url = `${BASE_URL}/api/qt/ulist.np/get`;
  const response = await api.get(url, {
    params: {
      fltt: 2,
      fields: 'f62,f184,f66,f69,f72,f75,f78,f81,f84,f87',
      secids: '1.000001,0.399001',
    },
  });
  return response.data?.diff || [];
};

// 获取行业板块资金流向
export const fetchIndustryFlow = async () => {
  const url = `${BASE_URL}/api/qt/clist/get`;
  const response = await api.get(url, {
    params: {
      pn: 1,
      pz: 50,
      po: 1,
      np: 1,
      fltt: 2,
      invt: 2,
      fid: 'f62',
      fs: 'm:90+t:2',
      fields: 'f12,f14,f3,f62,f184,f66,f69,f72,f75,f78,f81,f84,f87',
    },
  });
  return response.data?.diff || [];
};

// 获取北向资金
export const fetchNorthFlow = async () => {
  const url = 'https://push2.eastmoney.com/api/qt/kamt.rtmin/get';
  const response = await api.get(url, {
    params: {
      fields1: 'f1,f2,f3,f4',
      fields2: 'f51,f52,f54,f56',
    },
  });
  return response.data || {};
};

// 获取南向资金
export const fetchSouthFlow = async () => {
  const url = 'https://push2.eastmoney.com/api/qt/kamtbs.rtmin/get';
  const response = await api.get(url, {
    params: {
      fields1: 'f1,f2,f3,f4',
      fields2: 'f51,f52,f54,f56',
    },
  });
  return response.data || {};
};
```

---

## 八、工具函数

### 8.1 收益计算 (src/utils/calculate.ts)

```typescript
import type { FundData, FundItem, FundApiResponse } from '@/types/fund';

// 计算持有金额
export const calculateAmount = (dwjz: number | null, num: number): number => {
  if (!dwjz || !num) return 0;
  return Number((dwjz * num).toFixed(2));
};

// 计算当日收益
export const calculateGains = (
  dwjz: number | null,
  gsz: number | null,
  gszzl: number,
  num: number,
  hasReplace: boolean
): number => {
  if (!num) return 0;

  if (hasReplace && dwjz) {
    // 已更新实际净值，使用涨跌幅计算
    return Number(((dwjz - dwjz / (1 + gszzl * 0.01)) * num).toFixed(2));
  } else if (gsz && dwjz) {
    // 使用估算净值计算
    return Number(((gsz - dwjz) * num).toFixed(2));
  }

  return 0;
};

// 计算持有收益
export const calculateCostGains = (
  dwjz: number | null,
  cost: number | undefined,
  num: number
): number => {
  if (!dwjz || !cost || !num) return 0;
  return Number(((dwjz - cost) * num).toFixed(2));
};

// 计算持有收益率
export const calculateCostGainsRate = (
  dwjz: number | null,
  cost: number | undefined
): number => {
  if (!dwjz || !cost || cost === 0) return 0;
  return Number((((dwjz - cost) / cost) * 100).toFixed(2));
};

// 处理 API 数据转换为展示数据
export const transformFundData = (
  apiData: FundApiResponse[],
  fundList: FundItem[]
): FundData[] => {
  return apiData.map((item) => {
    const fundItem = fundList.find((f) => f.code === item.FCODE);
    const num = fundItem?.num || 0;
    const cost = fundItem?.cost;

    const dwjz = isNaN(Number(item.NAV)) ? null : Number(item.NAV);
    let gsz = isNaN(Number(item.GSZ)) ? null : Number(item.GSZ);
    let gszzl = isNaN(Number(item.GSZZL)) ? 0 : Number(item.GSZZL);
    let hasReplace = false;

    // 判断是否已更新实际净值
    if (item.PDATE !== '--' && item.PDATE === item.GZTIME?.substr(0, 10)) {
      gsz = dwjz;
      gszzl = isNaN(Number(item.NAVCHGRT)) ? 0 : Number(item.NAVCHGRT);
      hasReplace = true;
    }

    return {
      fundcode: item.FCODE,
      name: item.SHORTNAME,
      jzrq: item.PDATE,
      dwjz,
      gsz,
      gszzl,
      gztime: item.GZTIME,
      hasReplace,
      num,
      cost,
      amount: calculateAmount(dwjz, num),
      gains: calculateGains(dwjz, gsz, gszzl, num, hasReplace),
      costGains: calculateCostGains(dwjz, cost, num),
      costGainsRate: calculateCostGainsRate(dwjz, cost),
    };
  });
};

// 计算总收益
export const calculateTotalGains = (fundData: FundData[]): {
  gains: number;
  gainsRate: number;
  costGains: number;
  costGainsRate: number;
} => {
  let totalGains = 0;
  let totalCostGains = 0;
  let totalAmount = 0;

  fundData.forEach((fund) => {
    totalGains += fund.gains;
    totalCostGains += fund.costGains;
    totalAmount += fund.amount;
  });

  return {
    gains: Number(totalGains.toFixed(2)),
    gainsRate: totalAmount ? Number(((totalGains * 100) / totalAmount).toFixed(2)) : 0,
    costGains: Number(totalCostGains.toFixed(2)),
    costGainsRate: totalAmount
      ? Number(((totalCostGains * 100) / (totalAmount - totalCostGains)).toFixed(2))
      : 0,
  };
};
```

### 8.2 交易时间判断 (src/utils/holiday.ts)

```typescript
interface HolidayData {
  version: string;
  lastDate: string;
  data: {
    [year: string]: {
      [date: string]: {
        holiday: boolean;
        name: string;
      };
    };
  };
}

let holidayData: HolidayData | null = null;

// 加载节假日数据
export const loadHolidayData = async (): Promise<HolidayData> => {
  if (holidayData) return holidayData;

  try {
    const response = await fetch('/holiday.json');
    holidayData = await response.json();
    return holidayData!;
  } catch (error) {
    console.error('Failed to load holiday data:', error);
    return { version: '0', lastDate: '', data: {} };
  }
};

// 检查是否是节假日
export const isHoliday = async (date: Date): Promise<boolean> => {
  const data = await loadHolidayData();

  const year = date.getFullYear().toString();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateKey = `${month}-${day}`;

  const yearData = data.data[year];
  if (yearData && yearData[dateKey]) {
    return yearData[dateKey].holiday;
  }

  return false;
};

// 判断是否是交易时间
export const isDuringTradeTime = async (): Promise<boolean> => {
  // 转换为东8区时间
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  const china = new Date(utc + 8 * 60 * 60 * 1000);

  // 检查周末
  const dayOfWeek = china.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // 检查节假日
  if (await isHoliday(china)) {
    return false;
  }

  // 检查交易时间
  const hours = china.getHours();
  const minutes = china.getMinutes();
  const time = hours * 60 + minutes;

  // 上午：9:30 - 11:35
  const amStart = 9 * 60 + 30;
  const amEnd = 11 * 60 + 35;

  // 下午：13:00 - 15:05
  const pmStart = 13 * 60;
  const pmEnd = 15 * 60 + 5;

  return (time >= amStart && time <= amEnd) || (time >= pmStart && time <= pmEnd);
};
```

### 8.3 格式化工具 (src/utils/format.ts)

```typescript
// 格式化数字（添加千分位）
export const formatNumber = (
  num: number,
  decimals: number = 2
): string => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// 格式化金额（自动添加单位）
export const formatAmount = (num: number): string => {
  const absNum = Math.abs(num);

  if (absNum < 10000) {
    return formatNumber(num);
  } else if (absNum < 100000000) {
    return formatNumber(num / 10000, 2) + '万';
  } else {
    return formatNumber(num / 100000000, 2) + '亿';
  }
};

// 格式化百分比
export const formatPercent = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals) + '%';
};

// 格式化时间
export const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';

  // 如果是完整时间，只取时间部分
  if (timeStr.includes(' ')) {
    return timeStr.split(' ')[1].substring(0, 5);
  }

  // 如果是日期，只取月日
  if (timeStr.includes('-')) {
    return timeStr.substring(5);
  }

  return timeStr;
};

// 获取涨跌颜色 class
export const getChangeColor = (value: number): string => {
  if (value > 0) return 'text-up';
  if (value < 0) return 'text-down';
  return 'text-muted-foreground';
};

// 获取涨跌背景颜色 class
export const getChangeBgColor = (value: number): string => {
  if (value > 0) return 'bg-up/10 text-up';
  if (value < 0) return 'bg-down/10 text-down';
  return 'bg-muted text-muted-foreground';
};
```

---## 九、核心组件实现示例

### 9.1 基金列表组件 (src/components/fund/FundList.tsx)

```tsx
import React, { useEffect, useCallback } from 'react';
import { RefreshCw, Settings, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFundStore } from '@/stores/fundStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { fetchFundData } from '@/services/fundApi';
import { transformFundData, calculateTotalGains } from '@/utils/calculate';
import { isDuringTradeTime } from '@/utils/holiday';
import { formatNumber, getChangeColor } from '@/utils/format';
import FundItem from './FundItem';

export default function FundList() {
  const { fundList, fundData, setFundData, setLoading, isLoading } = useFundStore();
  const { showGains, showCost, isLiveUpdate } = useSettingsStore();

  const [isDuringTrade, setIsDuringTrade] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);

  // 获取基金数据
  const fetchData = useCallback(async () => {
    if (fundList.length === 0) return;

    setLoading(true);
    try {
      const codes = fundList.map(f => f.code);
      const apiData = await fetchFundData(codes);
      const data = transformFundData(apiData, fundList);
      setFundData(data);
    } catch (error) {
      console.error('Failed to fetch fund data:', error);
    } finally {
      setLoading(false);
    }
  }, [fundList, setFundData, setLoading]);

  // 检查交易时间并设置定时器
  useEffect(() => {
    const checkAndFetch = async () => {
      const trading = await isDuringTradeTime();
      setIsDuringTrade(trading);
      fetchData();
    };

    checkAndFetch();

    // 设置定时更新
    let interval: NodeJS.Timeout | null = null;
    if (isLiveUpdate) {
      interval = setInterval(checkAndFetch, 60 * 1000); // 每分钟更新
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchData, isLiveUpdate]);

  // 计算总收益
  const totals = calculateTotalGains(fundData);

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            共 {fundList.length} 只基金
          </span>
          <span className={`text-xs px-2 py-0.5 rounded ${
            isDuringTrade ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {isDuringTrade ? '交易中' : '休市'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant={isEditing ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '完成' : '编辑'}
          </Button>
        </div>
      </div>

      {/* 基金列表 */}
      <div className="border rounded-lg divide-y">
        {fundData.map((fund, index) => (
          <FundItem
            key={fund.fundcode}
            fund={fund}
            index={index}
            isEditing={isEditing}
          />
        ))}

        {fundData.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <p>暂无基金，点击添加</p>
            <Button variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              添加基金
            </Button>
          </div>
        )}
      </div>

      {/* 收益汇总 */}
      {(showGains || showCost) && fundData.length > 0 && (
        <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
          {showGains && (
            <div>
              <span className="text-sm text-muted-foreground">日收益：</span>
              <span className={`font-semibold ${getChangeColor(totals.gains)}`}>
                {formatNumber(totals.gains)}
                <span className="text-xs ml-1">({totals.gainsRate}%)</span>
              </span>
            </div>
          )}
          {showCost && (
            <div>
              <span className="text-sm text-muted-foreground">持有收益：</span>
              <span className={`font-semibold ${getChangeColor(totals.costGains)}`}>
                {formatNumber(totals.costGains)}
                <span className="text-xs ml-1">({totals.costGainsRate}%)</span>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### 9.2 指数栏组件 (src/components/index/IndexBar.tsx)

```tsx
import React, { useEffect, useState } from 'react';
import { useFundStore } from '@/stores/fundStore';
import { fetchIndexData } from '@/services/indexApi';
import { formatNumber, getChangeColor } from '@/utils/format';
import type { IndexData } from '@/types/index';

export default function IndexBar() {
  const { indexList } = useFundStore();
  const [indexData, setIndexData] = useState<IndexData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (indexList.length === 0) return;
      const data = await fetchIndexData(indexList);
      setIndexData(data);
    };

    fetchData();
    const interval = setInterval(fetchData, 10 * 1000); // 每10秒更新

    return () => clearInterval(interval);
  }, [indexList]);

  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-card rounded-lg border">
      {indexData.map((index) => (
        <div
          key={`${index.f13}.${index.f12}`}
          className="text-center cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
        >
          <div className="text-sm font-medium truncate">{index.f14}</div>
          <div className={`text-lg font-bold ${getChangeColor(index.f3)}`}>
            {formatNumber(index.f2, index.f2 > 1000 ? 2 : 4)}
          </div>
          <div className={`text-sm ${getChangeColor(index.f3)}`}>
            {index.f4 > 0 ? '+' : ''}{formatNumber(index.f4, 2)}
            <span className="ml-2">
              {index.f3 > 0 ? '+' : ''}{formatNumber(index.f3, 2)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 9.3 估值走势图组件 (src/components/chart/EstimateChart.tsx)

```tsx
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { fetchFundEstimateTrend } from '@/services/fundApi';
import { useSettingsStore } from '@/stores/settingsStore';

interface Props {
  fundCode: string;
  baseValue: number;
}

export default function EstimateChart({ fundCode, baseValue }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { darkMode } = useSettingsStore();

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, darkMode ? 'dark' : undefined);

    const loadData = async () => {
      const { time, values } = await fetchFundEstimateTrend(fundCode);

      // 计算涨跌幅
      const changes = values.map(v => ((v - baseValue) / baseValue * 100).toFixed(2));

      const option: echarts.EChartsOption = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            const data = params[0];
            const change = changes[data.dataIndex];
            const color = Number(change) >= 0 ? '#ef4444' : '#22c55e';
            return `
              <div>
                <div>${data.axisValue}</div>
                <div>估值：${data.value}</div>
                <div style="color:${color}">涨跌：${change}%</div>
              </div>
            `;
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: time,
          boundaryGap: false,
          axisLabel: {
            interval: 30,
          },
        },
        yAxis: {
          type: 'value',
          scale: true,
          splitLine: {
            lineStyle: {
              type: 'dashed',
            },
          },
        },
        series: [
          {
            name: '估值',
            type: 'line',
            data: values,
            smooth: true,
            symbol: 'none',
            lineStyle: {
              width: 2,
            },
            areaStyle: {
              opacity: 0.1,
            },
            itemStyle: {
              color: values[values.length - 1] >= baseValue ? '#ef4444' : '#22c55e',
            },
          },
        ],
      };

      chart.setOption(option);
    };

    loadData();

    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, [fundCode, baseValue, darkMode]);

  return <div ref={chartRef} className="w-full h-64" />;
}
```

---

## 十、页面结构

### 10.1 首页 (src/pages/index.astro)

```astro
---
import Layout from '../layouts/Layout.astro';
import App from '../components/App';
---

<Layout title="自选基金助手">
  <App client:load />
</Layout>
```

### 10.2 主应用组件 (src/components/App.tsx)

```tsx
import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import IndexBar from './index/IndexBar';
import FundList from './fund/FundList';
import FundSearch from './fund/FundSearch';
import ThemeToggle from './layout/ThemeToggle';

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* 响应式头部 */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">基金派</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* 响应式主体 - 移动端优化间距 */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">
        <IndexBar />
        <FundSearch />
        <FundList />
      </main>

      <Toaster />
    </div>
  );
}
```

---

## 十一、迁移步骤

### 第一阶段：基础搭建（1-2天）✅ 高优先级

1. [ ] 安装所有依赖（React、Tailwind、shadcn/ui、ECharts等）
2. [ ] 配置 Astro + React + Tailwind
3. [ ] 配置 Vite 代理解决跨域
4. [ ] 配置 shadcn/ui
5. [ ] 创建基础目录结构
6. [ ] 实现类型定义（fund.ts, index.ts, settings.ts）
7. [ ] 实现 Zustand stores（fundStore, settingsStore）
8. [ ] 配置 Vercel 部署文件

### 第二阶段：API 层（1天）✅ 高优先级

1. [ ] 实现 Axios 配置（api.ts）
2. [ ] 实现基金 API（fundApi.ts）
3. [ ] 实现指数 API（indexApi.ts）
4. [ ] 实现行情 API（marketApi.ts）
5. [ ] 实现搜索 API（searchApi.ts）
6. [ ] 测试 API 调用（开发环境代理）

### 第三阶段：工具函数（0.5天）✅ 高优先级

1. [ ] 实现收益计算函数（calculate.ts）
2. [ ] 实现交易时间判断（holiday.ts）
3. [ ] 实现格式化工具（format.ts）

### 第四阶段：核心组件（3-4天）✅ 高优先级

1. [ ] 主题切换组件（ThemeToggle）
2. [ ] 指数栏组件（IndexBar）
3. [ ] 基金列表组件（FundList, FundItem）
4. [ ] 基金搜索组件（FundSearch）
5. [ ] 基金详情弹窗（FundDetail）
6. [ ] 收益汇总展示
7. [ ] 响应式布局适配

### 第五阶段：图表组件（2天）✅ 高优先级

1. [ ] 估值走势图（EstimateChart）
2. [ ] 历史净值图（HistoryChart）
3. [ ] 累计收益图（ProfitChart）
4. [ ] 配置 ECharts 明暗主题

### 第六阶段：行情中心（1-2天）✅ 高优先级

1. [ ] 行情中心入口
2. [ ] 大盘资金流向（MarketFlow）
3. [ ] 行业板块（IndustryFlow）
4. [ ] 北向/南向资金（NorthFlow, SouthFlow）

### 第七阶段：设置功能（1天）✅ 高优先级

1. [ ] 显示设置（显示/隐藏各项数据）
2. [ ] 主题切换（明/暗主题）
3. [ ] 排序设置

### 第八阶段：优化完善（1-2天）✅ 高优先级

1. [ ] 移动端响应式优化
2. [ ] 性能优化（懒加载、缓存）
3. [ ] 错误处理和降级
4. [ ] 加载状态优化
5. [ ] 部署到 Vercel 测试

### 第九阶段：低优先级功能（延后）🔜

1. [ ] 数据导入导出（Excel）
2. [ ] 拖拽排序功能
3. [ ] 更多图表类型
4. [ ] 性能监控和优化

---

## 十二、注意事项

### 12.1 跨域问题

**采用方案 C**：开发环境使用 Vite 代理，生产环境后续根据实际情况决定（可能直接调用或使用代理）。

#### 开发环境配置

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  output: 'static',
  vite: {
    server: {
      proxy: {
        '/api/fund': {
          target: 'https://fundmobapi.eastmoney.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/fund/, ''),
          secure: false,
        },
        '/api/index': {
          target: 'https://push2.eastmoney.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/index/, ''),
          secure: false,
        },
        '/api/search': {
          target: 'https://fundsuggest.eastmoney.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/search/, ''),
          secure: false,
        },
      },
    },
  },
});
```

#### API 调用配置

```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.DEV ? '' : 'https://fundmobapi.eastmoney.com';
const INDEX_BASE_URL = import.meta.env.DEV ? '' : 'https://push2.eastmoney.com';
const SEARCH_BASE_URL = import.meta.env.DEV ? '' : 'https://fundsuggest.eastmoney.com';

// 开发环境使用代理路径，生产环境使用实际 API 地址
export const getApiUrl = (type: 'fund' | 'index' | 'search') => {
  if (import.meta.env.DEV) {
    return `/api/${type}`;
  }
  switch (type) {
    case 'fund': return API_BASE_URL;
    case 'index': return INDEX_BASE_URL;
    case 'search': return SEARCH_BASE_URL;
  }
};
```

### 12.2 Vercel 部署配置

**创建 vercel.json 配置文件**：

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "framework": "astro",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/_astro/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

**环境变量配置**（如需要）：

在 Vercel 项目设置中配置：
- `NODE_VERSION`: 20
- `PNPM_VERSION`: 9

**部署步骤**：

1. 将项目推送到 GitHub
2. 在 Vercel 中导入项目
3. 选择 Astro 框架
4. 保持默认配置或使用 vercel.json
5. 部署

### 12.3 浏览器扩展特有功能

以下功能无法直接迁移到 Web：

| 功能 | 替代方案 |
|------|---------|
| 角标提醒 | 使用浏览器通知 API / 标题闪烁 |
| chrome.storage.sync | localStorage + 手动导入导出 |
| 后台定时任务 | 使用 setInterval（页面打开时） |
| 右键菜单 | 不适用 |

### 12.3 性能优化建议

1. 使用 `useMemo` 和 `useCallback` 优化渲染
2. 基金数据分页加载（如超过50只）
3. 图表组件懒加载
4. 使用 Web Worker 处理复杂计算

### 12.4 移动端适配要点

#### 响应式设计原则

1. **移动优先策略**：从小屏幕开始设计，逐步适配大屏
2. **触摸友好**：按钮最小点击区域 44x44px
3. **可读性**：移动端最小字号 14px，重要信息 16px
4. **简化操作**：减少输入，提供快捷操作

#### Tailwind 响应式断点

```typescript
// 使用 Tailwind 响应式类
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 移动端 1 列，平板 2 列，桌面 4 列 */}
</div>

<div className="text-sm sm:text-base lg:text-lg">
  {/* 根据屏幕大小调整字号 */}
</div>

<div className="px-3 sm:px-4 lg:px-6">
  {/* 移动端小间距，大屏大间距 */}
</div>
```

#### 移动端组件适配示例

```tsx
// 响应式指数栏
<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
  {/* 移动端 2 列，桌面 4 列 */}
</div>

// 响应式表格
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* 移动端横向滚动 */}
  </table>
</div>

// 响应式弹窗
<Dialog>
  <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh]">
    {/* 移动端几乎全屏，桌面固定宽度 */}
  </DialogContent>
</Dialog>
```

#### 移动端交互优化

- **下拉刷新**：使用 `pull-to-refresh` 库
- **长列表优化**：使用虚拟滚动（react-window）
- **手势操作**：侧滑删除、左右切换
- **底部导航**：移动端使用底部 Tab 导航

### 12.5 主题切换实现

#### 主题配置 (src/lib/theme.ts)

```typescript
export const themes = {
  light: {
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(222.2 84% 4.9%)',
    primary: 'hsl(221.2 83.2% 53.3%)',
    // ...
  },
  dark: {
    background: 'hsl(222.2 84% 4.9%)',
    foreground: 'hsl(210 40% 98%)',
    primary: 'hsl(217.2 91.2% 59.8%)',
    // ...
  },
};

// 主题切换 hook
export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};
```

#### 主题切换组件 (src/components/layout/ThemeToggle.tsx)

```tsx
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/stores/settingsStore';

export default function ThemeToggle() {
  const { darkMode, setDarkMode } = useSettingsStore();

  React.useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setDarkMode(!darkMode)}
      aria-label="切换主题"
    >
      {darkMode ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
```

#### CSS 变量配置 (src/styles/globals.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    /* 自定义涨跌颜色 */
    --up: 0 84.2% 60.2%;
    --down: 142.1 76.2% 36.3%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    /* 暗色主题涨跌颜色 */
    --up: 0 72.2% 50.6%;
    --down: 142.1 70.6% 45.3%;
  }
}

/* 主题切换动画 */
* {
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
```

---

## 十三、项目决策总结

### 已确认决策

| 决策项 | 结果 |
|--------|------|
| **项目名称** | 基金派 |
| **部署平台** | Vercel |
| **跨域方案** | 方案 C：开发环境用 Vite 代理，生产环境后续决定 |
| **PWA 支持** | 不需要 |
| **数据迁移** | 不需要（新项目，无老用户） |
| **MVP 优先级** | 导入导出低优先级，其他功能高优先级 |

### 技术栈对比

| 原项目（funds-master） | 新项目（基金派） |
|----------------------|----------------|
| Vue 2 | React 19 |
| Element UI | shadcn/ui |
| Webpack | Astro/Vite |
| SCSS | Tailwind CSS |
| chrome.storage | Zustand + localStorage |
| 浏览器扩展 | 响应式 Web 应用 |
| 单一主题 | 明暗主题切换 |
| 桌面端 | 移动端 + 桌面端 |

### 核心特性

**第一阶段交付**：
- ✅ 完整的基金管理功能（添加/删除/排序）
- ✅ 实时数据展示（估值/涨跌幅）
- ✅ 收益计算（日收益/持有收益）
- ✅ 指数栏实时展示
- ✅ 图表功能（估值走势/历史净值）
- ✅ 行情中心（大盘/行业/资金流向）
- ✅ 移动端优先的响应式设计
- ✅ 明暗主题无缝切换
- ✅ 本地数据存储，保护用户隐私

**第二阶段交付**：
- 🔜 数据导入导出功能
- 🔜 拖拽排序优化
- 🔜 更多图表类型

### 时间估算

- **第一阶段（MVP）**：10-12 个工作日
- **第二阶段（低优先级）**：3-5 个工作日
- **总计**：13-17 个工作日

---

## 十四、开发准备清单

开始开发前请确认：

- [ ] Node.js 20+ 已安装
- [ ] pnpm 已安装
- [ ] Git 仓库已创建
- [ ] GitHub 仓库已关联（用于 Vercel 部署）
- [ ] 确认东方财富 API 可访问
- [ ] 准备好 holiday.json 文件
- [ ] VS Code 安装相关插件（Astro, Tailwind CSS IntelliSense）

**准备就绪后，可以开始第一阶段的开发工作！**
