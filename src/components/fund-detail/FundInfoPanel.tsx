import React, { useEffect, useState } from 'react';
import { fetchFundInfo, type FundInfoData } from '@/services/fundDetailApi';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FundInfoPanelProps {
  fundCode: string;
  onManagerClick?: (fundCode: string) => void;
}

export default function FundInfoPanel({ fundCode, onManagerClick }: FundInfoPanelProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [info, setInfo] = useState<FundInfoData | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchFundInfo(fundCode);
        setInfo(result);
      } catch (error) {
        console.error('Failed to load fund info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fundCode]);

  // 格式化基金规模
  const formatSize = (value: number) => {
    if (!value) return '-';
    const k = 10000;
    const sizes = ['', '万', '亿', '万亿'];
    if (value < k) return value.toFixed(2);
    const i = Math.floor(Math.log(value) / Math.log(k));
    return (value / Math.pow(k, i)).toFixed(2) + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[260px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!info) {
    return (
      <div className="flex items-center justify-center h-[260px] text-muted-foreground">
        暂无数据
      </div>
    );
  }

  return (
    <div className="space-y-1 text-sm">
      {/* 历史排名 */}
      <div className="flex justify-between gap-2 py-2 border-b">
        <div className="text-center flex-1">
          <div className="text-xs text-muted-foreground mb-1">近1月(排名)</div>
          <p className={cn("font-medium", (info.SYL_Y ?? 0) > 0 ? "text-up" : "text-down")}>
            {info.SYL_Y ?? '-'}%（{info.RANKM ?? '-'}）
          </p>
        </div>
        <div className="text-center flex-1">
          <div className="text-xs text-muted-foreground mb-1">近3月(排名)</div>
          <p className={cn("font-medium", (info.SYL_3Y ?? 0) > 0 ? "text-up" : "text-down")}>
            {info.SYL_3Y ?? '-'}%（{info.RANKQ ?? '-'}）
          </p>
        </div>
        <div className="text-center flex-1">
          <div className="text-xs text-muted-foreground mb-1">近6月(排名)</div>
          <p className={cn("font-medium", (info.SYL_6Y ?? 0) > 0 ? "text-up" : "text-down")}>
            {info.SYL_6Y ?? '-'}%（{info.RANKHY ?? '-'}）
          </p>
        </div>
        <div className="text-center flex-1">
          <div className="text-xs text-muted-foreground mb-1">近1年(排名)</div>
          <p className={cn("font-medium", (info.SYL_1N ?? 0) > 0 ? "text-up" : "text-down")}>
            {info.SYL_1N ?? '-'}%（{info.RANKY ?? '-'}）
          </p>
        </div>
      </div>

      {/* 基金信息列表 */}
      <div className="space-y-0">
        <div className="flex justify-between py-2 even:bg-muted/30 px-2">
          <span>单位净值</span>
          <span>{info.DWJZ ?? '-'}（{info.FSRQ ?? '-'}）</span>
        </div>
        <div className="flex justify-between py-2 even:bg-muted/30 px-2 bg-muted/30">
          <span>累计净值</span>
          <span>{info.LJJZ ?? '-'}</span>
        </div>
        <div className="flex justify-between py-2 even:bg-muted/30 px-2">
          <span>基金类型</span>
          <span>{info.FTYPE ?? '-'}</span>
        </div>
        <div className="flex justify-between py-2 even:bg-muted/30 px-2 bg-muted/30">
          <span>基金公司</span>
          <span>{info.JJGS ?? '-'}</span>
        </div>
        <div
          className="flex justify-between py-2 even:bg-muted/30 px-2 cursor-pointer hover:text-primary"
          onClick={() => onManagerClick?.(fundCode)}
        >
          <span>基金经理</span>
          <span className="text-primary">{info.JJJL ?? '-'}</span>
        </div>
        <div className="flex justify-between py-2 even:bg-muted/30 px-2 bg-muted/30">
          <span>交易状态</span>
          <span>{info.SGZT ?? '-'} / {info.SHZT ?? '-'}</span>
        </div>
        <div className="flex justify-between py-2 even:bg-muted/30 px-2">
          <span>基金规模</span>
          <span>{formatSize(info.ENDNAV)}</span>
        </div>
        {info.FUNDBONUS && (
          <div className="flex justify-between py-2 even:bg-muted/30 px-2 bg-muted/30">
            <span>分红状态</span>
            <span>{info.FUNDBONUS.PDATE}日，每份折算{info.FUNDBONUS.CHGRATIO}份</span>
          </div>
        )}
      </div>
    </div>
  );
}
