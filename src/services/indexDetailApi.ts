// 指数详情相关 API

export interface IndexTrendData {
  time: string;
  price: number;
  volume: number;
}

export interface IndexDetailResult {
  prePrice: number; // 昨收价
  trends: IndexTrendData[];
}

/**
 * 获取指数分时数据
 */
export async function fetchIndexTrends(secid: string): Promise<IndexDetailResult> {
  const url = `https://push2.eastmoney.com/api/qt/stock/trends2/get?secid=${secid}&fields1=f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13&fields2=f51,f53,f56,f58&iscr=0&iscca=0&ndays=1&forcect=1&_=${Date.now()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.data) {
      const trends = data.data.trends.map((item: string) => {
        const parts = item.split(',');
        return {
          time: parts[0],
          price: parseFloat(parts[1]),
          volume: parseFloat(parts[2]),
        };
      });

      return {
        prePrice: data.data.prePrice,
        trends,
      };
    }

    return { prePrice: 0, trends: [] };
  } catch (error) {
    console.error('Failed to fetch index trends:', error);
    return { prePrice: 0, trends: [] };
  }
}

/**
 * 生成时间数组
 */
export function generateTimeArray(type: 'hs' | 'hk' | 'us-s' | 'us-w'): string[] {
  const addTime = (time: string, minutes: number): string => {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m + minutes;
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = totalMinutes % 60;
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  };

  const generateRange = (start: string, end: string): string[] => {
    const result: string[] = [];
    let current = start;
    while (current !== end) {
      result.push(current);
      current = addTime(current, 1);
    }
    result.push(end);
    return result;
  };

  switch (type) {
    case 'hs': // 沪深市场
      return [...generateRange('09:30', '11:30'), ...generateRange('13:00', '15:00')];
    case 'hk': // 港股市场
      return [...generateRange('09:30', '12:00'), ...generateRange('13:00', '16:00')];
    case 'us-s': // 美股夏令时
      return generateRange('21:30', '04:00');
    case 'us-w': // 美股冬令时
      return generateRange('22:30', '05:00');
    default:
      return generateRange('09:30', '15:00');
  }
}

/**
 * 判断市场类型
 */
export function getMarketType(marketCode: number, firstTime?: string): 'hs' | 'hk' | 'us-s' | 'us-w' {
  if (marketCode === 0 || marketCode === 1) {
    return 'hs';
  }

  if (firstTime) {
    const hour = parseInt(firstTime.split(':')[0]);
    if (hour === 9) return 'hk';
    if (hour === 21) return 'us-s';
    if (hour === 22) return 'us-w';
  }

  return 'hs';
}
