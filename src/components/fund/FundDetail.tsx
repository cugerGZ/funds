import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { fetchFundInfo, fetchFundPosition, fetchFundEstimateTrend, fetchFundHistory } from '@/services/fundApi';
import { formatNumber, formatPercent, getChangeColor, formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { FundData, FundInfo, StockPosition } from '@/types/fund';
import { TrendingUp, TrendingDown, Building2, User, Calendar, Loader2 } from 'lucide-react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([LineChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer]);

interface FundDetailProps {
  fund: FundData | null;
  open: boolean;
  onClose: () => void;
}

export default function FundDetail({ fund, open, onClose }: FundDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [fundInfo, setFundInfo] = useState<FundInfo | null>(null);
  const [positions, setPositions] = useState<StockPosition[]>([]);
  const [positionDate, setPositionDate] = useState('');
  const [trendData, setTrendData] = useState<{ time: string[]; values: number[] }>({ time: [], values: [] });
  const [historyData, setHistoryData] = useState<{ dates: string[]; values: number[] }>({ dates: [], values: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!fund || !open) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [info, position, trend, history] = await Promise.all([
          fetchFundInfo(fund.fundcode),
          fetchFundPosition(fund.fundcode),
          fetchFundEstimateTrend(fund.fundcode),
          fetchFundHistory(fund.fundcode, 30),
        ]);

        setFundInfo(info);
        setPositions(position.stocks);
        setPositionDate(position.date);
        setTrendData(trend);
        setHistoryData(history);
      } catch (error) {
        console.error('Failed to load fund detail:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fund, open]);

  if (!fund) return null;

  const isUp = fund.gszzl > 0;

  // 估值走势图配置
  const getTrendOption = () => ({
    backgroundColor: 'transparent',
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'hsl(var(--popover))',
      borderColor: 'hsl(var(--border))',
      textStyle: { color: 'hsl(var(--popover-foreground))' },
      formatter: (params: any) => {
        const data = params[0];
        return `<div class="text-sm">
          <div class="text-muted-foreground">${data.axisValue}</div>
          <div class="font-semibold">${data.value?.toFixed(4) || '--'}</div>
        </div>`;
      },
    },
    xAxis: {
      type: 'category',
      data: trendData.time,
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 10 },
      axisLine: { lineStyle: { color: 'hsl(var(--border))' } },
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 10 },
      splitLine: { lineStyle: { color: 'hsl(var(--border))', type: 'dashed' } },
    },
    series: [{
      type: 'line',
      data: trendData.values,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color: isUp ? 'hsl(var(--up))' : 'hsl(var(--down))' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: isUp ? 'hsla(var(--up), 0.3)' : 'hsla(var(--down), 0.3)' },
          { offset: 1, color: isUp ? 'hsla(var(--up), 0.05)' : 'hsla(var(--down), 0.05)' },
        ]),
      },
    }],
  });

  // 历史净值图配置
  const getHistoryOption = () => ({
    backgroundColor: 'transparent',
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'hsl(var(--popover))',
      borderColor: 'hsl(var(--border))',
      textStyle: { color: 'hsl(var(--popover-foreground))' },
    },
    xAxis: {
      type: 'category',
      data: historyData.dates.map(d => d.substring(5)),
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 10 },
      axisLine: { lineStyle: { color: 'hsl(var(--border))' } },
    },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: { color: 'hsl(var(--muted-foreground))', fontSize: 10 },
      splitLine: { lineStyle: { color: 'hsl(var(--border))', type: 'dashed' } },
    },
    series: [{
      type: 'line',
      data: historyData.values,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2, color: 'hsl(var(--primary))' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'hsla(var(--primary), 0.2)' },
          { offset: 1, color: 'hsla(var(--primary), 0.02)' },
        ]),
      },
    }],
  });

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {fund.name}
            <span className="text-sm font-normal text-muted-foreground font-mono">{fund.fundcode}</span>
          </DialogTitle>
          <DialogDescription className="flex items-center gap-3">
            <span className={cn("text-xl font-bold tabular-nums", getChangeColor(fund.gszzl))}>
              {formatPercent(fund.gszzl)}
            </span>
            <span className="text-sm">
              {fund.hasReplace ? '最新净值' : '估值'}: {fund.gsz?.toFixed(4) || '--'}
            </span>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="overview">概况</TabsTrigger>
              <TabsTrigger value="chart">走势</TabsTrigger>
              <TabsTrigger value="position">持仓</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              {fundInfo && (
                <>
                  {/* 基金信息卡片 */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="p-3">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Building2 className="h-4 w-4" />
                        <span className="text-xs">基金公司</span>
                      </div>
                      <p className="text-sm font-medium truncate">{fundInfo.JJGS || '--'}</p>
                    </Card>
                    <Card className="p-3">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <User className="h-4 w-4" />
                        <span className="text-xs">基金经理</span>
                      </div>
                      <p className="text-sm font-medium truncate">{fundInfo.JJJL || '--'}</p>
                    </Card>
                  </div>

                  {/* 收益率 */}
                  <Card className="p-3">
                    <h4 className="text-sm font-medium mb-3">历史收益率</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { label: '近1月', value: fundInfo.SYL_Y },
                        { label: '近3月', value: fundInfo.SYL_3Y },
                        { label: '近6月', value: fundInfo.SYL_6Y },
                        { label: '近1年', value: fundInfo.SYL_1N },
                      ].map(({ label, value }) => (
                        <div key={label} className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">{label}</p>
                          <p className={cn(
                            "text-sm font-semibold tabular-nums",
                            getChangeColor(parseFloat(value) || 0)
                          )}>
                            {value ? `${parseFloat(value) > 0 ? '+' : ''}${value}%` : '--'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* 基金详情 */}
                  <Card className="p-3">
                    <h4 className="text-sm font-medium mb-3">基金详情</h4>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="flex justify-between pr-4">
                        <span className="text-muted-foreground">基金类型</span>
                        <span>{fundInfo.FTYPE || '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">基金规模</span>
                        <span>{fundInfo.ENDNAV ? `${formatNumber(parseFloat(fundInfo.ENDNAV) / 100000000)}亿` : '--'}</span>
                      </div>
                      <div className="flex justify-between pr-4">
                        <span className="text-muted-foreground">单位净值</span>
                        <span className="tabular-nums">{fundInfo.DWJZ || '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">累计净值</span>
                        <span className="tabular-nums">{fundInfo.LJJZ || '--'}</span>
                      </div>
                    </div>
                  </Card>
                </>
              )}
            </TabsContent>

            <TabsContent value="chart" className="mt-4 space-y-4">
              {/* 估值走势 */}
              <Card className="p-3">
                <h4 className="text-sm font-medium mb-2">今日估值走势</h4>
                {trendData.values.length > 0 ? (
                  <ReactEChartsCore
                    echarts={echarts}
                    option={getTrendOption()}
                    style={{ height: 200 }}
                    opts={{ renderer: 'canvas' }}
                  />
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    暂无数据
                  </div>
                )}
              </Card>

              {/* 历史净值 */}
              <Card className="p-3">
                <h4 className="text-sm font-medium mb-2">近30日净值走势</h4>
                {historyData.values.length > 0 ? (
                  <ReactEChartsCore
                    echarts={echarts}
                    option={getHistoryOption()}
                    style={{ height: 200 }}
                    opts={{ renderer: 'canvas' }}
                  />
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    暂无数据
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="position" className="mt-4">
              <Card className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">重仓股票</h4>
                  {positionDate && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {positionDate}
                    </span>
                  )}
                </div>
                {positions.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {positions.slice(0, 10).map((stock, index) => (
                        <div
                          key={stock.GPDM}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium">{stock.GPJC}</p>
                              <p className="text-xs text-muted-foreground font-mono">{stock.GPDM}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium tabular-nums">{stock.JZBL}%</p>
                            {stock.PCTNVCHG && stock.PCTNVCHG !== '0' && (
                              <p className={cn(
                                "text-xs tabular-nums",
                                getChangeColor(parseFloat(stock.PCTNVCHG))
                              )}>
                                {parseFloat(stock.PCTNVCHG) > 0 ? '+' : ''}{stock.PCTNVCHG}%
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                    暂无持仓数据
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
