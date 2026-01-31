import React, { useEffect, useState } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { fetchFundNetDiagram, fetchFundYieldDiagram, type FundNetData, type FundYieldData } from '@/services/fundDetailApi';
import { useSettingsStore } from '@/stores/settingsStore';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

interface FundHistoryChartProps {
  fundCode: string;
  chartType: 'JZ' | 'LJSY'; // JZ = 历史净值, LJSY = 累计收益
}

type TimeRange = 'y' | '3y' | '6y' | 'n' | '3n' | '5n';

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: 'y', label: '月' },
  { value: '3y', label: '季' },
  { value: '6y', label: '半年' },
  { value: 'n', label: '一年' },
  { value: '3n', label: '三年' },
  { value: '5n', label: '五年' },
];

export default function FundHistoryChart({ fundCode, chartType }: FundHistoryChartProps) {
  const { darkMode } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('y');
  const [netData, setNetData] = useState<FundNetData[]>([]);
  const [yieldData, setYieldData] = useState<FundYieldData[]>([]);
  const [indexName, setIndexName] = useState('沪深300');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (chartType === 'LJSY') {
          const result = await fetchFundYieldDiagram(fundCode, timeRange);
          setYieldData(result.dataList);
          setIndexName(result.indexName);
        } else {
          const result = await fetchFundNetDiagram(fundCode, timeRange);
          setNetData(result);
        }
      } catch (error) {
        console.error('Failed to load fund history data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fundCode, timeRange, chartType]);

  const axisLabelColor = darkMode ? 'rgba(255,255,255,0.6)' : '#999';
  const splitLineColor = darkMode ? 'rgba(255,255,255,0.1)' : '#eee';

  const getChartOption = () => {
    if (chartType === 'LJSY') {
      // 累计收益图
      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#eee',
          textStyle: { color: darkMode ? '#fff' : '#333' },
          formatter: (p: any) => {
            let str = p.length > 1 ? `<br />${p[1].seriesName}：${p[1].value}%` : '';
            return `时间：${p[0].name}<br />${p[0].seriesName}：${p[0].value}%${str}`;
          },
        },
        legend: {
          show: true,
          top: 10,
          textStyle: { color: axisLabelColor },
        },
        grid: {
          top: 50,
          bottom: 30,
          left: 60,
          right: 20,
        },
        xAxis: {
          type: 'category',
          data: yieldData.map(item => item.PDATE),
          axisLabel: { color: axisLabelColor },
          axisLine: { lineStyle: { color: splitLineColor } },
        },
        yAxis: {
          type: 'value',
          scale: true,
          axisLabel: {
            color: axisLabelColor,
            formatter: (val: number) => val.toFixed(1) + '%',
          },
          splitLine: {
            lineStyle: { type: 'dashed', color: splitLineColor },
          },
        },
        series: [
          {
            type: 'line',
            name: '涨幅',
            data: yieldData.map(item => item.YIELD),
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 2 },
          },
          {
            type: 'line',
            name: indexName,
            data: yieldData.map(item => item.INDEXYIED),
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 2 },
          },
        ],
      };
    } else {
      // 历史净值图
      return {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#eee',
          textStyle: { color: darkMode ? '#fff' : '#333' },
          formatter: (p: any) => {
            const idx = p[0].dataIndex;
            const item = netData[idx];
            let str = p.length > 1 ? `<br />${p[1].seriesName}：${p[1].value}` : '';
            return `时间：${p[0].name}<br />${p[0].seriesName}：${p[0].value}${str}<br />日增长率：${item?.JZZZL || 0}%`;
          },
        },
        legend: {
          show: true,
          top: 10,
          textStyle: { color: axisLabelColor },
        },
        grid: {
          top: 50,
          bottom: 30,
          left: 60,
          right: 20,
        },
        xAxis: {
          type: 'category',
          data: netData.map(item => item.FSRQ),
          axisLabel: { color: axisLabelColor },
          axisLine: { lineStyle: { color: splitLineColor } },
        },
        yAxis: {
          type: 'value',
          scale: true,
          axisLabel: {
            color: axisLabelColor,
            formatter: (val: number) => val.toFixed(3),
          },
          splitLine: {
            lineStyle: { type: 'dashed', color: splitLineColor },
          },
        },
        series: [
          {
            type: 'line',
            name: '单位净值',
            data: netData.map(item => item.DWJZ),
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 2 },
          },
          {
            type: 'line',
            name: '累计净值',
            data: netData.map(item => item.LJJZ),
            smooth: true,
            symbol: 'none',
            lineStyle: { width: 2 },
          },
        ],
      };
    }
  };

  return (
    <div className="space-y-4">
      {/* 图表 */}
      <div className="h-[220px] relative">
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

      {/* 时间范围选择 */}
      <div className="flex justify-center gap-2">
        {TIME_RANGE_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => setTimeRange(option.value)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-md transition-colors",
              timeRange === option.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
