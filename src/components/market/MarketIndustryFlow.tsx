import React, { useEffect, useState } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, DataZoomComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { fetchIndustryFlowData, type IndustryFlowData } from '@/services/marketApi';
import { useSettingsStore } from '@/stores/settingsStore';
import { Loader2 } from 'lucide-react';

echarts.use([BarChart, GridComponent, TooltipComponent, DataZoomComponent, CanvasRenderer]);

export default function MarketIndustryFlow() {
  const { darkMode } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<IndustryFlowData[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchIndustryFlowData();
        setData(result);
      } catch (error) {
        console.error('Failed to load industry flow data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getChartOption = () => {
    const axisLabelColor = darkMode ? 'rgba(255,255,255,0.6)' : '#999';
    const splitLineColor = darkMode ? 'rgba(255,255,255,0.1)' : '#eee';

    const xData = data.map(item => item.name);
    const sData = data.map(item => item.flow);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: darkMode ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: darkMode ? 'rgba(255,255,255,0.1)' : '#eee',
        textStyle: { color: darkMode ? '#fff' : '#333' },
        formatter: (params: any) => {
          const p = params[0];
          return `${p.name}<br/>${(p.value / 100000000).toFixed(2)}亿元`;
        },
      },
      grid: {
        top: 25,
        bottom: 85,
        left: 50,
        right: 15,
      },
      xAxis: {
        type: 'category',
        data: xData,
        axisLabel: {
          color: axisLabelColor,
          rotate: 45,
          fontSize: 10,
        },
        axisLine: { lineStyle: { color: splitLineColor } },
      },
      yAxis: {
        type: 'value',
        name: '单位：亿元',
        nameTextStyle: { color: axisLabelColor },
        scale: true,
        axisLabel: {
          color: axisLabelColor,
          formatter: (val: number) => (val / 100000000).toFixed(0),
        },
        splitLine: {
          lineStyle: { type: 'dashed', color: splitLineColor },
        },
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: 30,
          height: 20,
          bottom: 10,
          borderColor: 'transparent',
          backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : '#f5f5f5',
          fillerColor: darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)',
          handleStyle: {
            color: darkMode ? '#3B82F6' : '#3B82F6',
          },
          textStyle: {
            color: axisLabelColor,
          },
        },
        {
          type: 'inside',
          xAxisIndex: [0],
          start: 0,
          end: 30,
        },
      ],
      series: [
        {
          type: 'bar',
          data: sData,
          itemStyle: {
            color: (params: any) => {
              return params.value >= 0 ? '#f56c6c' : '#4eb61b';
            },
            borderRadius: [4, 4, 0, 0],
          },
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

  return (
    <div className="h-[320px] sm:h-[340px]">
      <ReactEChartsCore
        echarts={echarts}
        option={getChartOption()}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}
