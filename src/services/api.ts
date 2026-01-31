import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

// 判断是否为开发环境
const isDev = import.meta.env.DEV;

// 定义东方财富 API 响应类型
interface EastmoneyResponse<T = any> {
  Datas: T;
  ErrCode: number;
  ErrMsg: string | null;
  Expansion: any;
}

// 创建 axios 实例
const api = axios.create({
  timeout: 15000,
});

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加时间戳防止缓存
    config.params = {
      ...config.params,
      _: Date.now(),
    };
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 直接返回 data
api.interceptors.response.use(
  (response: AxiosResponse<EastmoneyResponse>) => response.data as unknown as AxiosResponse,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// 类型安全的请求方法
export const apiGet = async <T = any>(url: string, params?: Record<string, any>): Promise<EastmoneyResponse<T>> => {
  const response = await api.get(url, { params });
  return response as unknown as EastmoneyResponse<T>;
};

// 获取 API URL
export const getApiUrl = (type: 'fund' | 'index' | 'search') => {
  if (isDev) {
    return `/api/${type}`;
  }
  switch (type) {
    case 'fund': return 'https://fundmobapi.eastmoney.com';
    case 'index': return 'https://push2.eastmoney.com';
    case 'search': return 'https://fundsuggest.eastmoney.com';
  }
};

export default api;

export type { EastmoneyResponse };
