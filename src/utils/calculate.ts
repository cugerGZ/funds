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
  totalAmount: number;
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

  // 持有收益率计算逻辑：与原版保持一致
  // 原版公式：(allCostGains * 100) / (allNum - allCostGains)
  // 即：总持有收益 / (总持有额 - 总持有收益) = 总持有收益 / 总成本
  const costBase = totalAmount - totalCostGains;

  return {
    totalAmount: Number(totalAmount.toFixed(2)),
    gains: Number(totalGains.toFixed(2)),
    gainsRate: totalAmount ? Number(((totalGains * 100) / totalAmount).toFixed(2)) : 0,
    costGains: Number(totalCostGains.toFixed(2)),
    costGainsRate: costBase > 0
      ? Number(((totalCostGains * 100) / costBase).toFixed(2))
      : 0,
  };
};
