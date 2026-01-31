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
  FundBaseInfo?: {
    FTYPE: string;
    SHORTNAME: string;
  };
}
