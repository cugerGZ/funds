import api, { getApiUrl } from './api';
import type { IndexData } from '@/types/index';

// 获取指数实时数据
export const fetchIndexData = async (codes: string[]): Promise<IndexData[]> => {
  if (codes.length === 0) return [];

  const baseUrl = getApiUrl('index');
  const url = `${baseUrl}/api/qt/ulist.np/get`;

  try {
    const response: any = await api.get(url, {
      params: {
        fltt: 2,
        fields: 'f2,f3,f4,f12,f13,f14',
        secids: codes.join(','),
      },
    });
    return response.data?.diff || [];
  } catch (error) {
    console.error('Failed to fetch index data:', error);
    return [];
  }
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
  const baseUrl = getApiUrl('index');
  const url = `${baseUrl}/api/qt/stock/trends2/get`;

  try {
    const response: any = await api.get(url, {
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
  } catch (error) {
    console.error('Failed to fetch trend data:', error);
    return { time: [], values: [], changes: [] };
  }
};
