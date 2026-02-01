import api, { getApiUrl } from './api';

// 指数概览
export interface IndexQuote {
  code: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const DEFAULT_INDEX_SECIDS = '1.000001,1.000300,0.399001,0.399006';

export const fetchIndexOverview = async (secids: string = DEFAULT_INDEX_SECIDS): Promise<IndexQuote[]> => {
  const baseUrl = getApiUrl('index');
  const url = `${baseUrl}/api/qt/ulist.np/get`;

  try {
    const response: any = await api.get(url, {
      params: {
        fltt: 2,
        secids,
        fields: 'f12,f14,f2,f3,f4',
      },
    });

    const diff = response.data?.diff || [];
    return diff.map((item: any) => ({
      code: item.f12,
      name: item.f14,
      price: Number(item.f2) || 0,
      change: Number(item.f4) || 0,
      changePercent: Number(item.f3) || 0,
    }));
  } catch (error) {
    console.error('Failed to fetch index overview:', error);
    return [];
  }
};

// 获取两市成交额数据
export interface TurnoverData {
  f6: number;   // 成交额
  f104: number; // 上涨数
  f105: number; // 下跌数
  f106: number; // 平盘数
}

export const fetchTurnoverData = async (): Promise<TurnoverData[]> => {
  const baseUrl = getApiUrl('index');
  const url = `${baseUrl}/api/qt/ulist.np/get`;

  try {
    const response: any = await api.get(url, {
      params: {
        fltt: 2,
        secids: '1.000001,0.399001',
        fields: 'f1,f2,f3,f4,f6,f12,f13,f104,f105,f106',
      },
    });
    return response.data?.diff || [];
  } catch (error) {
    console.error('Failed to fetch turnover data:', error);
    return [];
  }
};

// 获取大盘资金流向数据 (主力、超大单、大单、中单、小单)
export interface CapitalFlowData {
  time: string[];
  mainFlow: number[];      // 主力净流入
  superLargeFlow: number[]; // 超大单净流入
  largeFlow: number[];      // 大单净流入
  mediumFlow: number[];     // 中单净流入
  smallFlow: number[];      // 小单净流入
}

export const fetchCapitalFlowData = async (): Promise<CapitalFlowData> => {
  const baseUrl = getApiUrl('index');
  const url = `${baseUrl}/api/qt/stock/fflow/kline/get`;

  try {
    const response: any = await api.get(url, {
      params: {
        lmt: 0,
        klt: 1,
        secid: '1.000001',
        secid2: '0.399001',
        fields1: 'f1,f2,f3,f7',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63',
      },
    });

    const klines = response.data?.klines || [];
    const time: string[] = [];
    const mainFlow: number[] = [0];
    const superLargeFlow: number[] = [0];
    const largeFlow: number[] = [0];
    const mediumFlow: number[] = [0];
    const smallFlow: number[] = [0];

    klines.forEach((item: string) => {
      const arr = item.split(',');
      time.push(arr[0].substring(11, 16)); // 提取时间 HH:MM
      mainFlow.push(parseFloat(arr[1]) / 100000000);
      smallFlow.push(parseFloat(arr[2]) / 100000000);
      mediumFlow.push(parseFloat(arr[3]) / 100000000);
      largeFlow.push(parseFloat(arr[4]) / 100000000);
      superLargeFlow.push(parseFloat(arr[5]) / 100000000);
    });

    return { time, mainFlow, superLargeFlow, largeFlow, mediumFlow, smallFlow };
  } catch (error) {
    console.error('Failed to fetch capital flow data:', error);
    return { time: [], mainFlow: [], superLargeFlow: [], largeFlow: [], mediumFlow: [], smallFlow: [] };
  }
};

// 获取行业板块资金流向
export interface IndustryFlowData {
  name: string;
  flow: number;
}

export const fetchIndustryFlowData = async (): Promise<IndustryFlowData[]> => {
  const baseUrl = getApiUrl('index');
  const url = `${baseUrl}/api/qt/clist/get`;

  try {
    const response: any = await api.get(url, {
      params: {
        pn: 1,
        pz: 500,
        po: 1,
        np: 1,
        fields: 'f12,f13,f14,f62',
        fid: 'f62',
        fs: 'm:90+t:2',
      },
    });

    const diff = response.data?.diff || [];
    return diff.map((item: any) => ({
      name: item.f14,
      flow: item.f62,
    }));
  } catch (error) {
    console.error('Failed to fetch industry flow data:', error);
    return [];
  }
};

// 北向资金/南向资金数据
export interface CrossBorderFlowData {
  // 北向: 沪股通(f1)、深股通(f3)、北向合计(f5)
  // 南向: 港股通沪(f1)、港股通深(f3)、南向合计(f5)
  time: string[];
  data1: number[];     // 沪股通/港股通沪
  data3: number[];     // 深股通/港股通深
  data5: number[];     // 北向合计/南向合计
  lastData: {
    value1: number;    // 沪股通/港股通沪 净流入
    balance1: number;  // 沪股通/港股通沪 余额
    value3: number;    // 深股通/港股通深 净流入
    balance3: number;  // 深股通/港股通深 余额
    value5: number;    // 北向/南向 净流入
  };
}

export const fetchNorthboundFlowData = async (): Promise<CrossBorderFlowData> => {
  const baseUrl = getApiUrl('index');
  const url = `${baseUrl}/api/qt/kamt.rtmin/get`;

  try {
    const response: any = await api.get(url, {
      params: {
        fields1: 'f1,f2,f3,f4',
        fields2: 'f51,f52,f53,f54,f55,f56',
        ut: '',
      },
    });

    const s2nList = response.data?.s2n || [];
    const time: string[] = [];
    const data1: number[] = [];
    const data3: number[] = [];
    const data5: number[] = [];
    let lastData = { value1: 0, balance1: 0, value3: 0, balance3: 0, value5: 0 };

    s2nList.forEach((item: string) => {
      const arr = item.split(',');
      time.push(arr[0]);

      if (arr[1] !== '-') {
        data1.push(parseFloat(arr[1]) / 10000);
        data3.push(parseFloat(arr[3]) / 10000);
        data5.push(parseFloat(arr[5]) / 10000);
        lastData = {
          value1: parseFloat(arr[1]) / 10000,
          balance1: parseFloat(arr[2]) / 10000,
          value3: parseFloat(arr[3]) / 10000,
          balance3: parseFloat(arr[4]) / 10000,
          value5: parseFloat(arr[5]) / 10000,
        };
      } else {
        data1.push(NaN);
        data3.push(NaN);
        data5.push(NaN);
      }
    });

    return { time, data1, data3, data5, lastData };
  } catch (error) {
    console.error('Failed to fetch northbound flow data:', error);
    return {
      time: [], data1: [], data3: [], data5: [],
      lastData: { value1: 0, balance1: 0, value3: 0, balance3: 0, value5: 0 }
    };
  }
};

export const fetchSouthboundFlowData = async (): Promise<CrossBorderFlowData> => {
  const baseUrl = getApiUrl('index');
  const url = `${baseUrl}/api/qt/kamt.rtmin/get`;

  try {
    const response: any = await api.get(url, {
      params: {
        fields1: 'f1,f2,f3,f4',
        fields2: 'f51,f52,f53,f54,f55,f56',
        ut: '',
      },
    });

    const n2sList = response.data?.n2s || [];
    const time: string[] = [];
    const data1: number[] = [];
    const data3: number[] = [];
    const data5: number[] = [];
    let lastData = { value1: 0, balance1: 0, value3: 0, balance3: 0, value5: 0 };

    n2sList.forEach((item: string) => {
      const arr = item.split(',');
      time.push(arr[0]);

      if (arr[1] !== '-') {
        data1.push(parseFloat(arr[1]) / 10000);
        data3.push(parseFloat(arr[3]) / 10000);
        data5.push(parseFloat(arr[5]) / 10000);
        lastData = {
          value1: parseFloat(arr[1]) / 10000,
          balance1: parseFloat(arr[2]) / 10000,
          value3: parseFloat(arr[3]) / 10000,
          balance3: parseFloat(arr[4]) / 10000,
          value5: parseFloat(arr[5]) / 10000,
        };
      } else {
        data1.push(NaN);
        data3.push(NaN);
        data5.push(NaN);
      }
    });

    return { time, data1, data3, data5, lastData };
  } catch (error) {
    console.error('Failed to fetch southbound flow data:', error);
    return {
      time: [], data1: [], data3: [], data5: [],
      lastData: { value1: 0, balance1: 0, value3: 0, balance3: 0, value5: 0 }
    };
  }
};
