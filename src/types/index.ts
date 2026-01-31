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
  { value: '0.399005', label: '中小100' },
  { value: '100.HSI', label: '恒生指数' },
  { value: '100.DJIA', label: '道琼斯' },
  { value: '100.NDX', label: '纳斯达克' },
  { value: '100.SPX', label: '标普500' },
];
