import React, { useEffect, useState, useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, MarkLineComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { fetchIndexTrends, generateTimeArray, getMarketType, type IndexTrendData } from '@/services/indexDetailApi';
import { useSettingsStore } from '@/stores/settingsStore';

echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, MarkLineComponent, CanvasRenderer]);

interface IndexDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  index: {
    code: string; // secid 格式: "1.000001"
    name: string;
    market: number; // f13
  } | null;
}

export default function IndexDetailDialog({ open, onOpenChange, index }: IndexDetailDialogProps) {
  const { darkMode } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [prePrice, setPrePrice] = useState(0);
  const [trends, setTrends] = useState<IndexTrendData[]>([]);
  const [timeData, setTimeData] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !index) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchIndexTrends(index.code);
        setPrePrice(result.prePrice);
        setTrends(result.trends);

        // 根据市场类型生成时间数组
        const firstTime = result.trends[0]?.time?.substr(11, 5);
        const marketType = getMarketType(index.market, firstTime);
        setTimeData(generateTimeArray(marketType));
      } catch (error) {
        console.error('Failed to load index trends:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [open, index]);

  const axisLabelColor = darkMode ? 'rgba(255,255,255,0.6)' : '#999';
  const splitLineColor = darkMode ? 'rgba(255,255,255,0.1)' : '#eee';

  // 计算 Y 轴范围
  const yAxisRange = useMemo(() => {
    if (trends.length === 0 || prePrice === 0) {
      return { min: 0, max: 0, interval: 0 };
    }
    const prices = trends.map(t => t.price);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const maxDiff = Math.max(
      Math.abs(maxPrice - prePrice) / prePrice,
      Math.abs(minPrice - prePrice) / prePrice
    );
    const range = Math.max(maxDiff, 0.01);
    const min = prePrice * (1 - range);
    const max = prePrice * (1 + range);
    return { min, max, interval: (max - min) / 8 };
  }, [trends, prePrice]);

  const getChartOption = () => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          show: true,
          backgroundColor: darkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.6)',
        },
      },
      backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)',
      borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#eee',
      textStyle: { color: darkMode ? '#fff' : '#333' },
      formatter: (p: any) => {
        const idx = p[0]?.dataIndex;
        if (idx === undefined || !trends[idx]) return '';
        const item = trends[idx];
        const change = ((item.price - prePrice) * 100 / prePrice).toFixed(2);
        const volume = (item.volume / 10000).toFixed(2) + '万';
        const color = item.price >= prePrice ? '#f56c6c' : '#4eb61b';
        return `时间：${timeData[idx] || ''}<br />价格：${item.price.toFixed(2)}<br />涨幅：${change}%<br /><span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${color}"></span>成交量：${volume}`;
      },
    },
    axisPointer: {
      link: { xAxisIndex: 'all' },
    },
    grid: [
      { top: 20, left: 60, right: 60, height: '50%' },
      { left: 60, right: 60, top: '65%', height: '25%' },
    ],
    xAxis: [
      {
        type: 'category',
        data: timeData,
        axisLine: { onZero: false, lineStyle: { color: splitLineColor } },
        axisLabel: {
          color: axisLabelColor,
          interval: (_: number, value: string) => {
            return ['09:30', '10:30', '11:30', '13:00', '14:00', '15:00'].includes(value);
          },
          formatter: (value: string) => value === '11:30' ? '11:30/13:00' : value,
        },
      },
      {
        type: 'category',
        gridIndex: 1,
        data: timeData,
        axisLine: { lineStyle: { color: splitLineColor } },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: true, lineStyle: { type: 'dashed', color: splitLineColor } },
      },
    ],
    yAxis: [
      {
        type: 'value',
        min: yAxisRange.min,
        max: yAxisRange.max,
        interval: yAxisRange.interval,
        axisLabel: {
          color: (val: number) => val > prePrice ? '#f56c6c' : val < prePrice ? '#4eb61b' : axisLabelColor,
          formatter: (val: number) => val.toFixed(2),
        },
        splitLine: { lineStyle: { type: 'dashed', color: splitLineColor } },
      },
      {
        type: 'value',
        min: yAxisRange.min,
        max: yAxisRange.max,
        interval: yAxisRange.interval,
        axisLabel: {
          color: (val: number) => val > prePrice ? '#f56c6c' : val < prePrice ? '#4eb61b' : axisLabelColor,
          formatter: (val: number) => {
            if (prePrice === 0) return '0%';
            const change = ((val - prePrice) * 100 / prePrice).toFixed(2);
            return change === '-0.00' ? '0.00%' : change + '%';
          },
        },
        splitLine: { show: false },
      },
      {
        type: 'value',
        gridIndex: 1,
        splitNumber: 3,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: {
          color: axisLabelColor,
          formatter: (val: number) => val === 0 ? '(万)' : (val / 10000).toFixed(2),
        },
      },
    ],
    series: [
      {
        name: '价格',
        type: 'line',
        data: trends.map(t => t.price),
        smooth: false,
        symbol: 'none',
        lineStyle: { width: 2, color: '#409eff' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' },
          ]),
        },
        markLine: {
          silent: true,
          symbol: 'none',
          animation: false,
          label: { show: false },
          lineStyle: { type: 'solid', color: axisLabelColor },
          data: [{ yAxis: prePrice }],
        },
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 2,
        data: trends.map((t, idx) => ({
          value: t.volume,
          itemStyle: {
            color: idx === 0 || trends[idx].price >= (trends[idx - 1]?.price ?? 0) ? '#f56c6c' : '#4eb61b',
          },
        })),
      },
    ],
  });

  if (!index) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {index.name}（{index.code}）
          </DialogTitle>
        </DialogHeader>

        <div className="h-[350px] relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ReactEChartsCore
              echarts={echarts}
              option={getChartOption()}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          )}
        </div>

        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            返回列表
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
