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
