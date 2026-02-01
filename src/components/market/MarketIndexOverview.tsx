import React, { useEffect, useState } from 'react';
import { Loader2, Landmark, BarChart3, LineChart, Zap } from 'lucide-react';
import { fetchIndexOverview, type IndexQuote } from '@/services/marketApi';
import { cn } from '@/lib/utils';
import { getChangeColor } from '@/utils/format';

export default function MarketIndexOverview() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<IndexQuote[]>([]);

  const iconMap: Record<string, { Icon: React.ElementType; text: string; bg: string }> = {
    '000001': { Icon: Landmark, text: 'text-primary', bg: 'bg-primary/10' },
    '000300': { Icon: BarChart3, text: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    '399001': { Icon: LineChart, text: 'text-amber-500', bg: 'bg-amber-500/10' },
    '399006': { Icon: Zap, text: 'text-purple-500', bg: 'bg-purple-500/10' },
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchIndexOverview();
        setData(result);
      } catch (error) {
        console.error('Failed to load index overview:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[180px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {data.map((item) => {
        const iconConfig = iconMap[item.code] || { Icon: LineChart, text: 'text-primary', bg: 'bg-primary/10' };
        const Icon = iconConfig.Icon;
        return (
        <div
          key={item.code}
          className="rounded-lg bg-muted/30 p-3 sm:p-3.5 flex flex-col gap-1"
        >
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span className={cn("h-5 w-5 rounded-md flex items-center justify-center", iconConfig.bg)}>
              <Icon className={cn("h-3 w-3", iconConfig.text)} />
            </span>
            <span className="truncate">{item.name}</span>
          </div>
          <div className="text-base sm:text-lg font-semibold tabular-nums">
            {item.price.toFixed(2)}
          </div>
          <div className={cn("text-xs sm:text-sm font-medium tabular-nums", getChangeColor(item.changePercent))}>
            {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
          </div>
        </div>
        );
      })}
    </div>
  );
}
