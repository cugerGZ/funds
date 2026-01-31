import { apiGet, getApiUrl } from './api';
import type { FundApiResponse, FundInfo, StockPosition, SearchResult } from '@/types/fund';

// 生成设备 ID
const getDeviceId = (): string => {
  if (typeof window === 'undefined') return 'server';

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

  const baseUrl = getApiUrl('fund');
  const url = `${baseUrl}/FundMNewApi/FundMNFInfo`;

  try {
    const response = await apiGet<FundApiResponse[]>(url, {
      pageIndex: 1,
      pageSize: 200,
      plat: 'Android',
      appType: 'ttjj',
      product: 'EFund',
      Version: 1,
      deviceid: getDeviceId(),
      Fcodes: codes.join(','),
    });
    return response.Datas || [];
  } catch (error) {
    console.error('Failed to fetch fund data:', error);
    return [];
  }
};

// 获取基金详情
export const fetchFundInfo = async (code: string): Promise<FundInfo | null> => {
  const baseUrl = getApiUrl('fund');
  const url = `${baseUrl}/FundMApi/FundBaseTypeInformation.ashx`;

  try {
    const response = await apiGet<FundInfo>(url, {
      FCODE: code,
      deviceid: 'Wap',
      plat: 'Wap',
      product: 'EFund',
      version: '2.0.0',
    });
    return response.Datas || null;
  } catch (error) {
    console.error('Failed to fetch fund info:', error);
    return null;
  }
};

// 获取基金持仓
export const fetchFundPosition = async (code: string): Promise<{
  stocks: StockPosition[];
  date: string;
}> => {
  const baseUrl = getApiUrl('fund');
  const url = `${baseUrl}/FundMNewApi/FundMNInverstPosition`;

  try {
    const response = await apiGet<{ fundStocks: StockPosition[] }>(url, {
      FCODE: code,
      deviceid: 'Wap',
      plat: 'Wap',
      product: 'EFund',
      version: '2.0.0',
    });
    return {
      stocks: response.Datas?.fundStocks || [],
      date: response.Expansion || '',
    };
  } catch (error) {
    console.error('Failed to fetch fund position:', error);
    return { stocks: [], date: '' };
  }
};

// 搜索基金
export const searchFund = async (keyword: string): Promise<SearchResult[]> => {
  const baseUrl = getApiUrl('search');
  const url = `${baseUrl}/FundSearch/api/FundSearchAPI.ashx`;

  try {
    const response = await apiGet<SearchResult[]>(url, {
      m: 9,
      key: keyword,
    });
    return response.Datas || [];
  } catch (error) {
    console.error('Failed to search fund:', error);
    return [];
  }
};

// 获取基金估值走势（当日分时）
export const fetchFundEstimateTrend = async (code: string): Promise<{
  time: string[];
  values: number[];
}> => {
  const baseUrl = getApiUrl('fund');
  const url = `${baseUrl}/FundMNewApi/FundMNGZTrend`;

  try {
    const response = await apiGet<Array<{ x: string; y: string }>>(url, {
      FCODE: code,
      deviceid: 'Wap',
      plat: 'Wap',
      product: 'EFund',
      version: '2.0.0',
    });

    const data = response.Datas || [];
    return {
      time: data.map((item) => item.x),
      values: data.map((item) => parseFloat(item.y)),
    };
  } catch (error) {
    console.error('Failed to fetch fund trend:', error);
    return { time: [], values: [] };
  }
};

// 获取基金历史净值
export const fetchFundHistory = async (code: string, days: number = 30): Promise<{
  dates: string[];
  values: number[];
}> => {
  const baseUrl = getApiUrl('fund');
  const url = `${baseUrl}/FundMNewApi/FundMNHisNetList`;

  try {
    const response = await apiGet<Array<{ FSRQ: string; DWJZ: string }>>(url, {
      FCODE: code,
      pageIndex: 1,
      pageSize: days,
      deviceid: 'Wap',
      plat: 'Wap',
      product: 'EFund',
      version: '2.0.0',
    });

    const data = response.Datas || [];
    const reversed = [...data].reverse();
    return {
      dates: reversed.map((item) => item.FSRQ),
      values: reversed.map((item) => parseFloat(item.DWJZ)),
    };
  } catch (error) {
    console.error('Failed to fetch fund history:', error);
    return { dates: [], values: [] };
  }
};
