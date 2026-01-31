// 格式化数字（添加千分位）
export const formatNumber = (
  num: number,
  decimals: number = 2
): string => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// 格式化金额（自动添加单位）
export const formatAmount = (num: number): string => {
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum < 10000) {
    return sign + formatNumber(absNum);
  } else if (absNum < 100000000) {
    return sign + formatNumber(absNum / 10000, 2) + '万';
  } else {
    return sign + formatNumber(absNum / 100000000, 2) + '亿';
  }
};

// 格式化百分比
export const formatPercent = (num: number, decimals: number = 2): string => {
  const sign = num > 0 ? '+' : '';
  return sign + num.toFixed(decimals) + '%';
};

// 格式化时间
export const formatTime = (timeStr: string): string => {
  if (!timeStr) return '';

  // 如果是完整时间，只取时间部分
  if (timeStr.includes(' ')) {
    return timeStr.split(' ')[1].substring(0, 5);
  }

  // 如果是日期，只取月日
  if (timeStr.includes('-')) {
    return timeStr.substring(5);
  }

  return timeStr;
};

// 格式化日期
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  return dateStr.replace(/-/g, '/');
};

// 获取涨跌颜色 class
export const getChangeColor = (value: number): string => {
  if (value > 0) return 'text-up';
  if (value < 0) return 'text-down';
  return 'text-muted-foreground';
};

// 获取涨跌背景颜色 class
export const getChangeBgColor = (value: number): string => {
  if (value > 0) return 'bg-up-muted text-up';
  if (value < 0) return 'bg-down-muted text-down';
  return 'bg-muted text-muted-foreground';
};

// 判断是否需要显示正号
export const withSign = (num: number): string => {
  return num > 0 ? '+' + num.toString() : num.toString();
};
