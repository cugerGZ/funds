// 基金详情相关 API
import { getApiUrl } from './api';

// 基金净值估算数据
export interface FundValuationData {
  time: string;
  value: number;
}

// 基金净值数据
export interface FundNetData {
  FSRQ: string; // 日期
  DWJZ: number; // 单位净值
  LJJZ: number; // 累计净值
  JZZZL: string; // 日增长率
}

// 累计收益数据
export interface FundYieldData {
  PDATE: string; // 日期
  YIELD: number; // 涨幅
  INDEXYIED: number; // 指数涨幅
}

// 持仓股票数据
export interface FundStockItem {
  GPDM: string; // 股票代码
  GPJC: string; // 股票简称
  JZBL: string; // 占比
  PCTNVCHG: string; // 较上期变化
  PCTNVCHGTYPE: string; // 变化类型
  NEWTEXCH: string; // 交易所
}

// 股票实时数据
export interface StockQuote {
  f2: number; // 最新价
  f3: number; // 涨跌幅
  f12: string; // 代码
  f13: number; // 市场
  f14: string; // 名称
}

// 基金概况数据
export interface FundInfoData {
  FCODE: string; // 基金代码
  SHORTNAME: string; // 基金简称
  DWJZ: number; // 单位净值
  LJJZ: number; // 累计净值
  FSRQ: string; // 净值日期
  FTYPE: string; // 基金类型
  JJGS: string; // 基金公司
  JJJL: string; // 基金经理
  SGZT: string; // 申购状态
  SHZT: string; // 赎回状态
  ENDNAV: number; // 基金规模
  SYL_Y: number; // 近1月收益率
  SYL_3Y: number; // 近3月收益率
  SYL_6Y: number; // 近6月收益率
  SYL_1N: number; // 近1年收益率
  RANKM: string; // 近1月排名
  RANKQ: string; // 近3月排名
  RANKHY: string; // 近6月排名
  RANKY: string; // 近1年排名
  FUNDBONUS?: {
    PDATE: string;
    CHGRATIO: string;
  };
}

// 基金经理数据
export interface FundManagerData {
  MGRID: string;
  MGRNAME: string;
  PFCODE: string;
  EXPERIENCE: string;
  NEWPHOTO: string;
  TOTALSIZE: number;
  BESTPROFIT: string;
}

// 获取 base URL
const getBaseUrl = () => getApiUrl('fund');
const getIndexBaseUrl = () => getApiUrl('index');

/**
 * 获取基金净值估算数据（分时图）
 */
export async function fetchFundValuationData(fundCode: string): Promise<{
  dataList: FundValuationData[];
  DWJZ: number;
}> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/FundMApi/FundVarietieValuationDetail.ashx?FCODE=${fundCode}&deviceid=Wap&plat=Wap&product=EFund&version=2.0.0&_=${Date.now()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.Datas) {
      const dataList = data.Datas.map((item: string) => {
        const parts = item.split(',');
        return {
          time: parts[0],
          value: parseFloat(parts[2]),
        };
      });

      return {
        dataList,
        DWJZ: parseFloat(data.Expansion?.DWJZ || 0),
      };
    }

    return { dataList: [], DWJZ: 0 };
  } catch (error) {
    console.error('Failed to fetch fund valuation data:', error);
    return { dataList: [], DWJZ: 0 };
  }
}

/**
 * 获取基金历史净值数据
 * @param range 时间范围: y(月), 3y(季), 6y(半年), n(一年), 3n(三年), 5n(五年)
 */
export async function fetchFundNetDiagram(
  fundCode: string,
  range: string = 'y'
): Promise<FundNetData[]> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/FundMApi/FundNetDiagram.ashx?FCODE=${fundCode}&RANGE=${range}&deviceid=Wap&plat=Wap&product=EFund&version=2.0.0&_=${Date.now()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data.Datas || [];
  } catch (error) {
    console.error('Failed to fetch fund net diagram:', error);
    return [];
  }
}

/**
 * 获取基金累计收益数据
 * @param range 时间范围: y(月), 3y(季), 6y(半年), n(一年), 3n(三年), 5n(五年)
 */
export async function fetchFundYieldDiagram(
  fundCode: string,
  range: string = 'y'
): Promise<{
  dataList: FundYieldData[];
  indexName: string;
}> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/FundMApi/FundYieldDiagramNew.ashx?FCODE=${fundCode}&RANGE=${range}&deviceid=Wap&plat=Wap&product=EFund&version=2.0.0&_=${Date.now()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      dataList: data.Datas || [],
      indexName: data.Expansion?.INDEXNAME || '沪深300',
    };
  } catch (error) {
    console.error('Failed to fetch fund yield diagram:', error);
    return { dataList: [], indexName: '沪深300' };
  }
}

/**
 * 获取基金持仓明细
 */
export async function fetchFundPositions(fundCode: string): Promise<{
  stocks: FundStockItem[];
  updateDate: string;
}> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/FundMNewApi/FundMNInverstPosition?FCODE=${fundCode}&deviceid=Wap&plat=Wap&product=EFund&version=2.0.0&_=${Date.now()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return {
      stocks: data.Datas?.fundStocks || [],
      updateDate: data.Expansion || '',
    };
  } catch (error) {
    console.error('Failed to fetch fund positions:', error);
    return { stocks: [], updateDate: '' };
  }
}

/**
 * 获取股票实时行情
 */
export async function fetchStockQuotes(secids: string[]): Promise<StockQuote[]> {
  const baseUrl = getIndexBaseUrl();
  const secidsStr = secids.join(',');
  const url = `${baseUrl}/api/qt/ulist.np/get?fields=f1,f2,f3,f4,f12,f13,f14,f292&fltt=2&secids=${secidsStr}&_=${Date.now()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data.data?.diff || [];
  } catch (error) {
    console.error('Failed to fetch stock quotes:', error);
    return [];
  }
}

/**
 * 获取基金概况信息
 */
export async function fetchFundInfo(fundCode: string): Promise<FundInfoData | null> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/FundMApi/FundBaseTypeInformation.ashx?FCODE=${fundCode}&deviceid=Wap&plat=Wap&product=EFund&version=2.0.0&_=${Date.now()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data.Datas || null;
  } catch (error) {
    console.error('Failed to fetch fund info:', error);
    return null;
  }
}

/**
 * 获取基金经理详情
 */
export async function fetchFundManager(fundCode: string): Promise<FundManagerData[]> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/FundMApi/FundBasicInformation.ashx?FCODE=${fundCode}&deviceid=Wap&plat=Wap&product=EFund&version=2.0.0&_=${Date.now()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data.Datas?.MGRINFO || [];
  } catch (error) {
    console.error('Failed to fetch fund manager:', error);
    return [];
  }
}
