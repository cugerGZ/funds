import React from 'react';
import { Trash2, Edit2, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFundStore } from '@/stores/fundStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { formatNumber, formatPercent, getChangeColor, getChangeBgColor } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { FundData } from '@/types/fund';

interface FundItemProps {
  fund: FundData;
  index: number;
  isEditing: boolean;
  onShowDetail: (fund: FundData) => void;
  onEditAmount: (fund: FundData) => void;
}

export default function FundItem({ fund, index, isEditing, onShowDetail, onEditAmount }: FundItemProps) {
  const { removeFund } = useFundStore();
  const { showGSZ, showAmount, showGains, showCost, showCostRate } = useSettingsStore();

  const isUp = fund.gszzl > 0;
  const isDown = fund.gszzl < 0;

  return (
    <div
      className={cn(
        "group relative p-4 sm:p-5 transition-all duration-300 animate-fade-in",
        !isEditing && "cursor-pointer hover:bg-primary/5"
      )}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => !isEditing && onShowDetail(fund)}
    >
      {/* 悬浮光效 */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none",
        isUp && "bg-gradient-to-r from-up/5 via-transparent to-transparent",
        isDown && "bg-gradient-to-r from-down/5 via-transparent to-transparent"
      )} />

      <div className="relative flex items-start justify-between gap-4">
        {/* 左侧信息 */}
        <div className="flex-1 min-w-0">
          {/* 基金名称和代码 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-sm sm:text-base truncate">
              {fund.name}
            </span>
            <span className="text-xs text-muted-foreground font-mono px-1.5 py-0.5 rounded bg-muted/50 shrink-0">
              {fund.fundcode}
            </span>
          </div>

          {/* 详细信息行 */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
            {/* 净值 */}
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground/60">净值</span>
              <span className="tabular-nums text-foreground font-medium">{fund.dwjz?.toFixed(4) || '--'}</span>
            </div>

            {/* 估值 */}
            {showGSZ && fund.gsz && !fund.hasReplace && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground/60">估值</span>
                <span className={cn("tabular-nums font-medium", getChangeColor(fund.gszzl))}>{fund.gsz.toFixed(4)}</span>
              </div>
            )}

            {/* 持有金额 */}
            {showAmount && fund.num > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground/60">持有</span>
                <span className="tabular-nums text-foreground font-medium">¥{formatNumber(fund.amount)}</span>
              </div>
            )}

            {/* 份额 */}
            {fund.num > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground/60">份额</span>
                <span className="tabular-nums">{formatNumber(fund.num, 0)}</span>
              </div>
            )}
          </div>

          {/* 收益信息 */}
          {(showGains || showCost || showCostRate) && fund.num > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs sm:text-sm">
              {showGains && (
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-lg",
                  fund.gains >= 0 ? "bg-up/5" : "bg-down/5"
                )}>
                  <span className="text-muted-foreground/60">日收益</span>
                  <span className={cn("tabular-nums font-semibold", getChangeColor(fund.gains))}>
                    {fund.gains >= 0 ? '+' : ''}{formatNumber(fund.gains)}
                  </span>
                </div>
              )}
              {showCost && fund.costGains !== 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground/60">持有收益</span>
                  <span className={cn("tabular-nums font-medium", getChangeColor(fund.costGains))}>
                    {fund.costGains >= 0 ? '+' : ''}{formatNumber(fund.costGains)}
                  </span>
                  {showCostRate && fund.costGainsRate !== 0 && (
                    <span className={cn("tabular-nums", getChangeColor(fund.costGainsRate))}>
                      ({formatPercent(fund.costGainsRate)})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 右侧涨跌幅 */}
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <div className={cn(
                "relative overflow-hidden px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-center min-w-[80px] sm:min-w-[100px] transition-all duration-300",
                "border",
                isUp && "bg-up/10 border-up/20 group-hover:bg-up/15 group-hover:shadow-lg group-hover:shadow-up/20",
                isDown && "bg-down/10 border-down/20 group-hover:bg-down/15 group-hover:shadow-lg group-hover:shadow-down/20",
                !isUp && !isDown && "bg-muted/50 border-muted"
              )}>
                {/* 趋势图标 */}
                <div className="absolute top-1 right-1 opacity-30">
                  {isUp ? (
                    <TrendingUp className="h-3 w-3 text-up" />
                  ) : isDown ? (
                    <TrendingDown className="h-3 w-3 text-down" />
                  ) : null}
                </div>

                <div className={cn(
                  "text-base sm:text-lg font-bold tabular-nums",
                  getChangeColor(fund.gszzl)
                )}>
                  {formatPercent(fund.gszzl)}
                </div>
                {fund.hasReplace && (
                  <div className="text-[10px] text-muted-foreground mt-0.5">已确认</div>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 hidden sm:block" />
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditAmount(fund);
                }}
                className="h-9 w-9 rounded-xl hover:bg-primary/10"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFund(fund.fundcode);
                }}
                className="h-9 w-9 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
