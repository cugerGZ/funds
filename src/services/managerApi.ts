// 基金经理详情 API 服务
import { getApiUrl } from './api';

export interface ManagerHistory {
  MGRID: string;
  MGRNAME: string;
  FEMPDATE: string;
  LEMPDATE: string;
  DAYS: number;
  PENAVGROWTH: number;
}

export interface ManagerDetail {
  MGRID: string;
  MGRNAME: string;
  FEMPDATE: string;
  DAYS: string;
  PHOTOURL: string;
  RESUME: string;
}

// 获取基金经理变动列表
export async function fetchManagerList(fundCode: string): Promise<ManagerHistory[]> {
  try {
    const baseUrl = getApiUrl('fund');
    const url = `${baseUrl}/FundMApi/FundManagerList.ashx?FCODE=${fundCode}&deviceid=Wap&plat=Wap&product=EFund&version=2.0.0&Uid=&_=${Date.now()}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.Datas) {
      return data.Datas;
    }

    return [];
  } catch (error) {
    console.error('获取基金经理列表失败:', error);
    return [];
  }
}

// 获取现任基金经理详情
export async function fetchManagerDetail(fundCode: string): Promise<ManagerDetail[]> {
  try {
    const baseUrl = getApiUrl('fund');
    const url = `${baseUrl}/FundMApi/FundMangerDetail.ashx?FCODE=${fundCode}&deviceid=Wap&plat=Wap&product=EFund&version=2.0.0&Uid=&_=${Date.now()}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.Datas) {
      return data.Datas;
    }

    return [];
  } catch (error) {
    console.error('获取基金经理详情失败:', error);
    return [];
  }
}
