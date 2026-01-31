import React, { useEffect, useState } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { fetchSouthboundFlowData, type CrossBorderFlowData } from '@/services/marketApi';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

// 南向资金交易时间（港股）
const TIME_DATA = [
  "09:30", "09:31", "09:32", "09:33", "09:34", "09:35", "09:36", "09:37", "09:38", "09:39",
  "09:40", "09:41", "09:42", "09:43", "09:44", "09:45", "09:46", "09:47", "09:48", "09:49",
  "09:50", "09:51", "09:52", "09:53", "09:54", "09:55", "09:56", "09:57", "09:58", "09:59",
  "10:00", "10:01", "10:02", "10:03", "10:04", "10:05", "10:06", "10:07", "10:08", "10:09",
  "10:10", "10:11", "10:12", "10:13", "10:14", "10:15", "10:16", "10:17", "10:18", "10:19",
  "10:20", "10:21", "10:22", "10:23", "10:24", "10:25", "10:26", "10:27", "10:28", "10:29",
  "10:30", "10:31", "10:32", "10:33", "10:34", "10:35", "10:36", "10:37", "10:38", "10:39",
  "10:40", "10:41", "10:42", "10:43", "10:44", "10:45", "10:46", "10:47", "10:48", "10:49",
  "10:50", "10:51", "10:52", "10:53", "10:54", "10:55", "10:56", "10:57", "10:58", "10:59",
  "11:00", "11:01", "11:02", "11:03", "11:04", "11:05", "11:06", "11:07", "11:08", "11:09",
  "11:10", "11:11", "11:12", "11:13", "11:14", "11:15", "11:16", "11:17", "11:18", "11:19",
  "11:20", "11:21", "11:22", "11:23", "11:24", "11:25", "11:26", "11:27", "11:28", "11:29", "11:30",
  "13:01", "13:02", "13:03", "13:04", "13:05", "13:06", "13:07", "13:08", "13:09",
  "13:10", "13:11", "13:12", "13:13", "13:14", "13:15", "13:16", "13:17", "13:18", "13:19",
  "13:20", "13:21", "13:22", "13:23", "13:24", "13:25", "13:26", "13:27", "13:28", "13:29",
  "13:30", "13:31", "13:32", "13:33", "13:34", "13:35", "13:36", "13:37", "13:38", "13:39",
  "13:40", "13:41", "13:42", "13:43", "13:44", "13:45", "13:46", "13:47", "13:48", "13:49",
  "13:50", "13:51", "13:52", "13:53", "13:54", "13:55", "13:56", "13:57", "13:58", "13:59",
  "14:00", "14:01", "14:02", "14:03", "14:04", "14:05", "14:06", "14:07", "14:08", "14:09",
  "14:10", "14:11", "14:12", "14:13", "14:14", "14:15", "14:16", "14:17", "14:18", "14:19",
  "14:20", "14:21", "14:22", "14:23", "14:24", "14:25", "14:26", "14:27", "14:28", "14:29",
  "14:30", "14:31", "14:32", "14:33", "14:34", "14:35", "14:36", "14:37", "14:38", "14:39",
  "14:40", "14:41", "14:42", "14:43", "14:44", "14:45", "14:46", "14:47", "14:48", "14:49",
  "14:50", "14:51", "14:52", "14:53", "14:54", "14:55", "14:56", "14:57", "14:58", "14:59",
  "15:00", "15:01", "15:02", "15:03", "15:04", "15:05", "15:06", "15:07", "15:08", "15:09",
  "15:10", "15:11", "15:12", "15:13", "15:14", "15:15", "15:16", "15:17", "15:18", "15:19",
  "15:20", "15:21", "15:22", "15:23", "15:24", "15:25", "15:26", "15:27", "15:28", "15:29",
  "15:30", "15:31", "15:32", "15:33", "15:34", "15:35", "15:36", "15:37", "15:38", "15:39",
  "15:40", "15:41", "15:42", "15:43", "15:44", "15:45", "15:46", "15:47", "15:48", "15:49",
  "15:50", "15:51", "15:52", "15:53", "15:54", "15:55", "15:56", "15:57", "15:58", "15:59", "16:00",
];

export default function MarketSouthboundFlow() {
  const { darkMode } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<CrossBorderFlowData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchSouthboundFlowData();
        setData(result);
      } catch (error) {
        console.error('Failed to load southbound flow data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getChartOption = () => {
    const axisLabelColor = darkMode ? 'rgba(255,255,255,0.6)' : '#999';
    const splitLineColor = darkMode ? 'rgba(255,255,255,0.1)' : '#eee';

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#eee',
        textStyle: { color: darkMode ? '#fff' : '#333' },
      },
      legend: {
        show: true,
        top: 8,
        textStyle: { color: axisLabelColor, fontSize: 10 },
        itemGap: 8,
      },
      grid: {
        top: 70,
        bottom: 25,
        left: 50,
        right: 15,
      },
      xAxis: {
        type: 'category',
        data: TIME_DATA,
        axisLabel: {
          color: axisLabelColor,
          interval: (index: number, value: string) => {
            return ['09:30', '10:30', '11:30', '14:00', '15:00', '16:00'].includes(value);
          },
          formatter: (value: string) => value === '11:30' ? '11:30/13:00' : value,
        },
        axisLine: { lineStyle: { color: splitLineColor } },
      },
      yAxis: {
        type: 'value',
        name: '单位：亿元',
        nameTextStyle: { color: axisLabelColor },
        scale: true,
        axisLabel: { color: axisLabelColor },
        splitLine: {
          lineStyle: { type: 'dashed', color: splitLineColor },
        },
      },
      series: [
        {
          type: 'line',
          name: '港股通(沪)',
          data: data?.data1 || [],
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2 },
          connectNulls: true,
        },
        {
          type: 'line',
          name: '港股通(深)',
          data: data?.data3 || [],
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2 },
          connectNulls: true,
        },
        {
          type: 'line',
          name: '南向资金',
          data: data?.data5 || [],
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 2.5 },
          connectNulls: true,
        },
      ],
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { lastData } = data || { lastData: { value1: 0, balance1: 0, value3: 0, balance3: 0, value5: 0 } };

  return (
    <div className="space-y-3">
      {/* 图表 */}
      <div className="h-[240px] sm:h-[260px]">
        <ReactEChartsCore
          echarts={echarts}
          option={getChartOption()}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>

      {/* 数据统计 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 text-sm bg-muted/30 rounded-lg p-2 sm:p-3">
        <div className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-md bg-background/50">
          <span className="text-muted-foreground text-xs mb-0.5 sm:mb-1">港股通(沪) 当日净流入</span>
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <span className={cn("font-bold text-sm sm:text-base", lastData.value1 >= 0 ? "text-up" : "text-down")}>
              {lastData.value1.toFixed(2)}亿
            </span>
            <span className="text-muted-foreground text-xs">余额 {lastData.balance1.toFixed(0)}亿</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-md bg-background/50">
          <span className="text-muted-foreground text-xs mb-0.5 sm:mb-1">港股通(深) 当日净流入</span>
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
            <span className={cn("font-bold text-sm sm:text-base", lastData.value3 >= 0 ? "text-up" : "text-down")}>
              {lastData.value3.toFixed(2)}亿
            </span>
            <span className="text-muted-foreground text-xs">余额 {lastData.balance3.toFixed(0)}亿</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-md bg-primary/10">
          <span className="text-muted-foreground text-xs mb-0.5 sm:mb-1">南向资金 当日净流入</span>
          <span className={cn("font-bold text-base sm:text-lg", lastData.value5 >= 0 ? "text-up" : "text-down")}>
            {lastData.value5.toFixed(2)}亿
          </span>
        </div>
      </div>
    </div>
  );
}
