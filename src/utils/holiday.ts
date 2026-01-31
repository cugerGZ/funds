interface HolidayData {
  version: string;
  lastDate: string;
  data: {
    [year: string]: {
      [date: string]: {
        holiday: boolean;
        name: string;
      };
    };
  };
}

let holidayData: HolidayData | null = null;

// 加载节假日数据
export const loadHolidayData = async (): Promise<HolidayData> => {
  if (holidayData) return holidayData;

  try {
    const response = await fetch('/holiday.json');
    holidayData = await response.json();
    return holidayData!;
  } catch (error) {
    console.error('Failed to load holiday data:', error);
    return { version: '0', lastDate: '', data: {} };
  }
};

// 检查是否是节假日
export const isHoliday = async (date: Date): Promise<boolean> => {
  const data = await loadHolidayData();

  const year = date.getFullYear().toString();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateKey = `${month}-${day}`;

  const yearData = data.data[year];
  if (yearData && yearData[dateKey]) {
    return yearData[dateKey].holiday;
  }

  return false;
};

// 获取中国时间
export const getChinaTime = (): Date => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
  return new Date(utc + 8 * 60 * 60 * 1000);
};

// 判断是否是交易时间
export const isDuringTradeTime = async (): Promise<boolean> => {
  const china = getChinaTime();

  // 检查周末
  const dayOfWeek = china.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // 检查节假日
  if (await isHoliday(china)) {
    return false;
  }

  // 检查交易时间
  const hours = china.getHours();
  const minutes = china.getMinutes();
  const time = hours * 60 + minutes;

  // 上午：9:30 - 11:35
  const amStart = 9 * 60 + 30;
  const amEnd = 11 * 60 + 35;

  // 下午：13:00 - 15:05
  const pmStart = 13 * 60;
  const pmEnd = 15 * 60 + 5;

  return (time >= amStart && time <= amEnd) || (time >= pmStart && time <= pmEnd);
};

// 获取市场状态
export const getMarketStatus = async (): Promise<'trading' | 'closed' | 'lunch'> => {
  const china = getChinaTime();

  // 检查周末
  const dayOfWeek = china.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 'closed';
  }

  // 检查节假日
  if (await isHoliday(china)) {
    return 'closed';
  }

  const hours = china.getHours();
  const minutes = china.getMinutes();
  const time = hours * 60 + minutes;

  // 上午：9:30 - 11:30
  const amStart = 9 * 60 + 30;
  const amEnd = 11 * 60 + 30;

  // 下午：13:00 - 15:00
  const pmStart = 13 * 60;
  const pmEnd = 15 * 60;

  // 午休：11:30 - 13:00
  const lunchStart = 11 * 60 + 30;
  const lunchEnd = 13 * 60;

  if ((time >= amStart && time <= amEnd) || (time >= pmStart && time <= pmEnd)) {
    return 'trading';
  }

  if (time >= lunchStart && time < lunchEnd) {
    return 'lunch';
  }

  return 'closed';
};

// 同步版本：简单判断是否在交易时间内（不检查节假日，仅检查周末和时间）
export const isMarketOpen = (): boolean => {
  const china = getChinaTime();

  // 检查周末
  const dayOfWeek = china.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  const hours = china.getHours();
  const minutes = china.getMinutes();
  const time = hours * 60 + minutes;

  // 上午：9:30 - 11:35
  const amStart = 9 * 60 + 30;
  const amEnd = 11 * 60 + 35;

  // 下午：13:00 - 15:05
  const pmStart = 13 * 60;
  const pmEnd = 15 * 60 + 5;

  return (time >= amStart && time <= amEnd) || (time >= pmStart && time <= pmEnd);
};
