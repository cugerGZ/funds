import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { RefreshCw, Wallet, Sparkles, TrendingUp, Trash2, Plus, Check, SquarePen, Minus, LineChart, Coins, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFundStore } from '@/stores/fundStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { fetchFundData } from '@/services/fundApi';
import {
  transformFundData,
  calculateTotalGains,
  calculateAmount,
  calculateGains,
  calculateCostGains,
  calculateCostGainsRate,
} from '@/utils/calculate';
import { isDuringTradeTime } from '@/utils/holiday';
import { formatNumber, getChangeColor } from '@/utils/format';
import { cn } from '@/lib/utils';
import FundSearch from './FundSearch';
import { FundDetailDialog } from '@/components/fund-detail';
import type { FundData } from '@/types/fund';

export default function FundList() {
  const { fundList, fundData, setFundData, setLoading, isLoading, removeFund, updateFund } = useFundStore();
  const { showGains, showCost, isLiveUpdate, showGSZ, showAmount, showCostRate } = useSettingsStore();

  const [isDuringTrade, setIsDuringTrade] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  // 保存输入框的字符串值，避免小数点丢失
  const [inputValues, setInputValues] = useState<Record<string, { cost?: string; num?: string }>>({});
  const [selectedFund, setSelectedFund] = useState<FundData | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustMode, setAdjustMode] = useState<'add' | 'reduce'>('add');
  const [adjustFund, setAdjustFund] = useState<FundData | null>(null);
  const [adjustNum, setAdjustNum] = useState('');
  const [adjustCost, setAdjustCost] = useState('');

  // 排序状态：none -> desc -> asc -> none
  type SortKey = 'amount' | 'costGains' | 'costGainsRate' | 'gszzl' | 'gains';
  type SortOrder = 'none' | 'desc' | 'asc';
  const [sortKey, setSortKey] = useState<SortKey | null>('gszzl'); // 默认按涨跌幅排序
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc'); // 默认降序（涨幅最高在上）

  // 获取基金数据
  const fetchData = useCallback(async () => {
    if (fundList.length === 0) {
      setFundData([]);
      return;
    }

    setLoading(true);
    try {
      const codes = fundList.map(f => f.code);
      const apiData = await fetchFundData(codes);
      const data = transformFundData(apiData, fundList);
      setFundData(data);
    } catch (error) {
      console.error('Failed to fetch fund data:', error);
    } finally {
      setLoading(false);
    }
  }, [fundList, setFundData, setLoading]);

  // 检查交易时间并设置定时器
  useEffect(() => {
    const checkAndFetch = async () => {
      const trading = await isDuringTradeTime();
      setIsDuringTrade(trading);
      fetchData();
    };

    checkAndFetch();

    // 设置定时更新
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isLiveUpdate) {
      interval = setInterval(checkAndFetch, 60 * 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchData, isLiveUpdate]);

  // 当 fundList 变化时重新获取数据
  useEffect(() => {
    if (fundList.length > 0 && fundData.length === 0) {
      fetchData();
    }
  }, [fundList, fundData.length, fetchData]);

  // 计算总收益
  const totals = calculateTotalGains(fundData);

  // 排序函数
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      // 同一列，切换排序状态: none -> desc -> asc -> none
      if (sortOrder === 'none') {
        setSortOrder('desc');
      } else if (sortOrder === 'desc') {
        setSortOrder('asc');
      } else {
        setSortOrder('none');
        setSortKey(null);
      }
    } else {
      // 不同列，设置为降序
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  // 排序后的数据
  const sortedFundData = useMemo(() => {
    if (!sortKey || sortOrder === 'none') {
      return fundData;
    }
    return [...fundData].sort((a, b) => {
      const valA = Number(a[sortKey]) || 0;
      const valB = Number(b[sortKey]) || 0;
      if (sortOrder === 'asc') {
        return valA - valB;
      }
      return valB - valA;
    });
  }, [fundData, sortKey, sortOrder]);

  // 排序指示器组件
  const SortIndicator = ({ columnKey }: { columnKey: SortKey }) => {
    const isActive = sortKey === columnKey;
    return (
      <span className="inline-flex flex-col ml-1 -space-y-1">
        <ChevronUp className={cn(
          "h-3 w-3 transition-colors",
          isActive && sortOrder === 'asc' ? "text-primary" : "text-muted-foreground/30"
        )} />
        <ChevronDown className={cn(
          "h-3 w-3 transition-colors",
          isActive && sortOrder === 'desc' ? "text-primary" : "text-muted-foreground/30"
        )} />
      </span>
    );
  };

  const updateFundAndData = (fundcode: string, updates: { num?: number; cost?: number }) => {
    updateFund(fundcode, updates);
    const nextData: FundData[] = fundData.map((fund: FundData) => {
      if (fund.fundcode !== fundcode) return fund;
      const num = updates.num ?? fund.num;
      const cost = updates.cost ?? fund.cost;
      return {
        ...fund,
        num,
        cost,
        amount: calculateAmount(fund.dwjz, num),
        gains: calculateGains(fund.dwjz, fund.gsz, fund.gszzl, num, fund.hasReplace),
        costGains: calculateCostGains(fund.dwjz, cost, num),
        costGainsRate: calculateCostGainsRate(fund.dwjz, cost),
      };
    });
    setFundData(nextData);
  };

  // 处理成本价变更
  const handleCostChange = (fundcode: string, value: string) => {
    // 只允许数字、小数点和空字符串
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
      return;
    }
    // 更新本地 state，保持输入的原始字符串
    setInputValues(prev => ({
      ...prev,
      [fundcode]: { ...prev[fundcode], cost: value }
    }));
  };

  // 处理成本价失焦（计算数据）
  const handleCostBlur = (fundcode: string, value: string) => {
    const cost = value === '' ? undefined : parseFloat(value) || undefined;
    updateFundAndData(fundcode, { cost });
    // 清除本地 state
    setInputValues(prev => {
      const { [fundcode]: _, ...rest } = prev;
      return rest;
    });
  };

  // 处理持有份额变更
  const handleNumChange = (fundcode: string, value: string) => {
    // 只允许数字、小数点和空字符串
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
      return;
    }
    // 更新本地 state，保持输入的原始字符串
    setInputValues(prev => ({
      ...prev,
      [fundcode]: { ...prev[fundcode], num: value }
    }));
  };

  // 处理持有份额失焦（计算数据）
  const handleNumBlur = (fundcode: string, value: string) => {
    const num = value === '' ? 0 : parseFloat(value) || 0;
    updateFundAndData(fundcode, { num });
    // 清除本地 state
    setInputValues(prev => {
      const { [fundcode]: _, ...rest } = prev;
      return rest;
    });
  };

  const openAdjustDialog = (mode: 'add' | 'reduce', fund: FundData) => {
    setAdjustMode(mode);
    setAdjustFund(fund);
    setAdjustNum('');
    setAdjustCost(fund.cost ? String(fund.cost) : '');
    setAdjustOpen(true);
  };

  const handleAdjustConfirm = () => {
    if (!adjustFund) return;
    const delta = parseFloat(adjustNum);
    if (!delta || delta <= 0) return;
    const inputCost = parseFloat(adjustCost);
    const currentNum = adjustFund.num || 0;
    const currentCost = adjustFund.cost || 0;

    if (adjustMode === 'add') {
      const newNum = currentNum + delta;
      let newCost = currentCost;
      if (!Number.isNaN(inputCost) && inputCost > 0) {
        newCost = currentNum > 0 && currentCost > 0
          ? Number(((currentCost * currentNum + inputCost * delta) / newNum).toFixed(4))
          : inputCost;
      }
      updateFundAndData(adjustFund.fundcode, { num: newNum, cost: newCost || undefined });
    } else {
      const newNum = Math.max(currentNum - delta, 0);
      let newCost = currentCost;
      if (!Number.isNaN(inputCost) && inputCost > 0) {
        newCost = inputCost;
      }
      updateFundAndData(adjustFund.fundcode, { num: newNum, cost: newNum === 0 ? undefined : (newCost || undefined) });
    }

    setAdjustOpen(false);
  };

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* 页面标题 */}
        <div className="glass-card rounded-2xl p-5 sm:p-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/50 shadow-lg shadow-primary/25">
                <LineChart className="h-5 w-5 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-accent animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">我的基金</h2>
              <p className="text-xs text-muted-foreground">管理您的基金持仓</p>
            </div>
          </div>
        </div>

        {/* 总收益统计卡片 */}
        {fundData.length > 0 && (showGains || showCost || showAmount) && (
          <Card className="glass-card border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                {/* 持有金额 */}
                {showAmount && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Wallet className="h-4 w-4" />
                      <span className="text-xs">持有金额</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold tabular-nums">
                      ¥{formatNumber(totals.totalAmount)}
                    </p>
                  </div>
                )}

                {/* 日收益 */}
                {showGains && (
                  <div
                    className="flex flex-col gap-1"
                    title={totals.gains >= 0 ? "d=====(￣▽￣*)b 赞一个" : "∑(っ°Д°;)っ 大事不好啦"}
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-xs">日收益</span>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <p className={cn(
                        "text-xl sm:text-2xl font-bold tabular-nums",
                        totals.gains >= 0 ? "text-up" : "text-down"
                      )}>
                        {totals.gains >= 0 ? '+' : ''}{formatNumber(totals.gains)}
                      </p>
                      {!isNaN(totals.gainsRate) && totals.gainsRate !== 0 && (
                        <span className={cn(
                          "text-sm font-medium",
                          totals.gainsRate >= 0 ? "text-up/70" : "text-down/70"
                        )}>
                          {totals.gainsRate >= 0 ? '+' : ''}{totals.gainsRate}%
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 持有收益 */}
                {showCost && (
                  <div
                    className="flex flex-col gap-1"
                    title={totals.costGains >= 0 ? "d=====(￣▽￣*)b 赞一个" : "∑(っ°Д°;)っ 大事不好啦"}
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Coins className="h-4 w-4" />
                      <span className="text-xs">持有收益</span>
                    </div>
                    <p className={cn(
                      "text-xl sm:text-2xl font-bold tabular-nums",
                      totals.costGains >= 0 ? "text-up" : "text-down"
                    )}>
                      {totals.costGains >= 0 ? '+' : ''}{formatNumber(totals.costGains)}
                    </p>
                  </div>
                )}

                {/* 持有收益率 */}
                {showCostRate && totals.costGainsRate !== 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs">持有收益率</span>
                    </div>
                    <p className={cn(
                      "text-xl sm:text-2xl font-bold tabular-nums",
                      totals.costGainsRate >= 0 ? "text-up" : "text-down"
                    )}>
                      {totals.costGainsRate >= 0 ? '+' : ''}{totals.costGainsRate}%
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 基金列表卡片 */}
        <Card className="glass-card border-0 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 sm:pb-4 border-b border-white/5">
            {/* 顶部工具栏 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <h2 className="text-base sm:text-lg font-semibold">持仓明细</h2>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={fetchData}
                  disabled={isLoading}
                  className="h-9 w-9 rounded-xl hover:bg-primary/10 transition-all duration-300"
                >
                  <RefreshCw className={cn("h-4 w-4 transition-transform duration-500", isLoading && "animate-spin")} />
                </Button>
                <Button
                  variant={isEditing ? "default" : "ghost"}
                  size="icon"
                  onClick={() => setIsEditing(!isEditing)}
                  className={cn(
                    "h-9 w-9 rounded-xl transition-all duration-300",
                    isEditing ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"
                  )}
                >
                  {isEditing ? <Check className="h-4 w-4" /> : <SquarePen className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setShowSearch(true)}
                  className="h-9 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg shadow-primary/25"
                >
                  添加基金
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* 基金列表 - 表格形式，支持横向滚动 */}
            {fundData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground whitespace-nowrap">
                        基金名称（{fundData.length}）
                      </th>
                      {isEditing && (
                        <th className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">基金代码</th>
                      )}
                      {showGSZ && !isEditing && (
                        <th className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">估算净值</th>
                      )}
                      {isEditing && (showCostRate || showCost) && (
                        <th className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">成本价</th>
                      )}
                      {isEditing && (showAmount || showGains || showCost || showCostRate) && (
                        <th className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">持有份额</th>
                      )}
                      {showAmount && (
                        <th
                          className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors"
                          onClick={() => !isEditing && handleSort('amount')}
                        >
                          <span className="inline-flex items-center">
                            持有额
                            {!isEditing && <SortIndicator columnKey="amount" />}
                          </span>
                        </th>
                      )}
                      {showCost && (
                        <th
                          className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors"
                          onClick={() => !isEditing && handleSort('costGains')}
                        >
                          <span className="inline-flex items-center">
                            持有收益
                            {!isEditing && <SortIndicator columnKey="costGains" />}
                          </span>
                        </th>
                      )}
                      {showCostRate && (
                        <th
                          className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors"
                          onClick={() => !isEditing && handleSort('costGainsRate')}
                        >
                          <span className="inline-flex items-center">
                            持有收益率
                            {!isEditing && <SortIndicator columnKey="costGainsRate" />}
                          </span>
                        </th>
                      )}
                      <th
                        className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors"
                        onClick={() => !isEditing && handleSort('gszzl')}
                      >
                        <span className="inline-flex items-center">
                          涨跌幅
                          {!isEditing && <SortIndicator columnKey="gszzl" />}
                        </span>
                      </th>
                      {showGains && !isEditing && (
                        <th
                          className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors"
                          onClick={() => handleSort('gains')}
                        >
                          <span className="inline-flex items-center">
                            估算收益
                            <SortIndicator columnKey="gains" />
                          </span>
                        </th>
                      )}
                      {!isEditing && (
                        <th className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">更新时间</th>
                      )}
                      {isEditing && (
                        <th className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">加减仓</th>
                      )}
                      {isEditing && (
                        <th className="text-center py-3 px-3 font-medium text-muted-foreground whitespace-nowrap">删除</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFundData.map((fund, index) => (
                      <tr
                        key={fund.fundcode}
                        className={cn(
                          "border-b border-white/5 transition-colors",
                          !isEditing && "cursor-pointer hover:bg-primary/5",
                          index % 2 === 0 ? "bg-muted/10" : ""
                        )}
                        onClick={() => !isEditing && setSelectedFund(fund)}
                      >
                        {/* 基金名称 - 左对齐 */}
                        <td className={cn("py-3 px-4 whitespace-nowrap", isEditing ? "" : "cursor-pointer")}>
                          <div className="font-medium">{fund.name}</div>
                          {!isEditing && <div className="text-xs text-muted-foreground">{fund.fundcode}</div>}
                        </td>

                        {/* 基金代码 - 编辑模式，居中 */}
                        {isEditing && (
                          <td className="text-center py-3 px-3 text-muted-foreground whitespace-nowrap">
                            {fund.fundcode}
                          </td>
                        )}

                        {/* 估算净值 - 非编辑模式，居中 */}
                        {showGSZ && !isEditing && (
                          <td className={cn("text-center py-3 px-3 tabular-nums whitespace-nowrap", getChangeColor(fund.gszzl))}>
                            {fund.gsz?.toFixed(4) || '-'}
                          </td>
                        )}

                        {/* 成本价 - 编辑模式，居中 */}
                        {isEditing && (showCostRate || showCost) && (
                          <td className="text-center py-3 px-3">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="持仓成本价"
                              value={inputValues[fund.fundcode]?.cost ?? (fund.cost || '')}
                              onChange={(e) => handleCostChange(fund.fundcode, e.target.value)}
                              onBlur={(e) => handleCostBlur(fund.fundcode, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-28 h-8 px-2 text-center text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </td>
                        )}

                        {/* 持有份额 - 编辑模式，居中 */}
                        {isEditing && (showAmount || showGains || showCost || showCostRate) && (
                          <td className="text-center py-3 px-3">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="输入持有份额"
                              value={inputValues[fund.fundcode]?.num ?? (fund.num || '')}
                              onChange={(e) => handleNumChange(fund.fundcode, e.target.value)}
                              onBlur={(e) => handleNumBlur(fund.fundcode, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-32 h-8 px-2 text-center text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </td>
                        )}

                        {/* 持有额 - 居中 */}
                        {showAmount && (
                          <td className="text-center py-3 px-3 tabular-nums whitespace-nowrap">
                            {fund.num > 0 ? formatNumber(fund.amount) : '-'}
                          </td>
                        )}

                        {/* 持有收益 - 居中 */}
                        {showCost && (
                          <td className={cn("text-center py-3 px-3 tabular-nums font-medium whitespace-nowrap", getChangeColor(fund.costGains))}>
                            {fund.costGains !== 0 ? formatNumber(fund.costGains) : '-'}
                          </td>
                        )}

                        {/* 持有收益率 - 居中 */}
                        {showCostRate && (
                          <td className={cn("text-center py-3 px-3 tabular-nums whitespace-nowrap", getChangeColor(fund.costGainsRate))}>
                            {fund.cost && fund.cost > 0 ? fund.costGainsRate + '%' : '-'}
                          </td>
                        )}

                        {/* 估算收益 - 非编辑模式，居中 */}
                        {showGains && !isEditing && (
                          <td className={cn("text-center py-3 px-3 tabular-nums whitespace-nowrap", getChangeColor(fund.gains))}>
                            {fund.num > 0 ? formatNumber(fund.gains) : '-'}
                          </td>
                        )}

                        {/* 涨跌幅 - 居中 */}
                        <td className={cn("text-center py-3 px-3 tabular-nums font-bold whitespace-nowrap", getChangeColor(fund.gszzl))}>
                          {fund.gszzl}%
                        </td>

                        {/* 更新时间 - 非编辑模式，居中 */}
                        {!isEditing && (
                          <td className="text-center py-3 px-3 text-muted-foreground text-xs whitespace-nowrap">
                            {fund.gztime ? fund.gztime.substring(10) : '-'}
                          </td>
                        )}

                        {/* 加减仓 - 编辑模式，居中 */}
                        {isEditing && (
                          <td className="text-center py-3 px-3">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAdjustDialog('add', fund);
                                }}
                                className="h-7 w-7 rounded-md text-up hover:text-up hover:bg-up/10 border-up/30"
                                title="加仓"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAdjustDialog('reduce', fund);
                                }}
                                className="h-7 w-7 rounded-md text-down hover:text-down hover:bg-down/10 border-down/30"
                                title="减仓"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        )}

                        {/* 删除 - 编辑模式，居中 */}
                        {isEditing && (
                          <td className="text-center py-3 px-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFund(fund.fundcode);
                              }}
                              className="h-7 w-7 rounded-md text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-muted-foreground">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <Wallet className="h-10 w-10 text-primary/50" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-accent" />
                  </div>
                </div>
                <p className="text-base mb-2">还没有添加基金</p>
                <p className="text-sm text-muted-foreground/60 mb-6">点击下方按钮开始添加</p>
                <Button
                  onClick={() => setShowSearch(true)}
                  className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25"
                >
                  添加基金
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 添加基金弹窗 */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>添加基金</DialogTitle>
            <DialogDescription>搜索基金代码或名称添加到自选</DialogDescription>
          </DialogHeader>
          <FundSearch onClose={() => setShowSearch(false)} />
        </DialogContent>
      </Dialog>

      {/* 基金详情弹窗 */}
      <FundDetailDialog
        open={!!selectedFund}
        onOpenChange={(open) => !open && setSelectedFund(null)}
        fund={selectedFund ? { fundcode: selectedFund.fundcode, name: selectedFund.name } : null}
      />

      {/* 加减仓弹窗 */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>{adjustMode === 'add' ? '加仓' : '减仓'}</DialogTitle>
            <DialogDescription>
              {adjustFund ? `${adjustFund.name}（${adjustFund.fundcode}）` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">
                {adjustMode === 'add' ? '加仓份额' : '减仓份额'}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={adjustNum}
                onChange={(e) => setAdjustNum(e.target.value)}
                className="mt-2 w-full h-9 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={adjustMode === 'add' ? '输入本次加仓份额' : '输入本次减仓份额'}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">
                {adjustMode === 'add' ? '本次买入价' : '新成本价（可选）'}
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={adjustCost}
                onChange={(e) => setAdjustCost(e.target.value)}
                className="mt-2 w-full h-9 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder={adjustMode === 'add' ? '输入本次买入净值' : '留空则保持原成本价'}
              />
              {adjustMode === 'add' && adjustFund && adjustFund.cost && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  当前成本价：{adjustFund.cost}，加仓后将自动计算加权平均成本
                </p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setAdjustOpen(false)}>取消</Button>
              <Button onClick={handleAdjustConfirm}>{adjustMode === 'add' ? '确认加仓' : '确认减仓'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
