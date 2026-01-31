import React, { useEffect, useState, useRef } from 'react';
import { useFundStore } from '@/stores/fundStore';
import { fetchIndexData } from '@/services/indexApi';
import { formatNumber, getChangeColor } from '@/utils/format';
import { getMarketStatus } from '@/utils/holiday';
import { cn } from '@/lib/utils';
import type { IndexData } from '@/types/index';
import { INDEX_OPTIONS } from '@/types/index';
import { TrendingUp, TrendingDown, Minus, Clock, Activity, Zap, X, Plus, Edit2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import IndexDetailDialog from '@/components/index-detail/IndexDetailDialog';

export default function IndexBar() {
  const { indexList, setIndexList, addIndex, removeIndex } = useFundStore();
  const [indexData, setIndexData] = useState<IndexData[]>([]);
  const [marketStatus, setMarketStatus] = useState<'trading' | 'closed' | 'lunch'>('closed');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddSelect, setShowAddSelect] = useState(false);
  const [selectedNewIndex, setSelectedNewIndex] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<IndexData | null>(null);

  // 拖拽相关状态
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (indexList.length === 0) return;

      try {
        const data = await fetchIndexData(indexList);
        setIndexData(data);
      } catch (error) {
        console.error('Failed to fetch index data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const checkMarketStatus = async () => {
      const status = await getMarketStatus();
      setMarketStatus(status);
    };

    fetchData();
    checkMarketStatus();

    // 交易时间每10秒更新，非交易时间每分钟更新
    const interval = setInterval(() => {
      fetchData();
      checkMarketStatus();
    }, marketStatus === 'trading' ? 10 * 1000 : 60 * 1000);

    return () => clearInterval(interval);
  }, [indexList, marketStatus]);

  const getIndexLabel = (code: string): string => {
    const index = INDEX_OPTIONS.find(i => i.value === code);
    return index?.label || code;
  };

  // 获取可添加的指数列表（排除已添加的）
  const availableIndexOptions = INDEX_OPTIONS.filter(
    opt => !indexList.includes(opt.value)
  );

  // 处理添加指数
  const handleAddIndex = () => {
    if (selectedNewIndex) {
      addIndex(selectedNewIndex);
      setSelectedNewIndex('');
      setShowAddSelect(false);
    }
  };

  // 处理删除指数
  const handleRemoveIndex = (code: string) => {
    removeIndex(code);
  };

  // 拖拽开始
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  // 拖拽经过
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== index) {
      setDragOverIndex(index);
    }
  };

  // 拖拽结束
  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      const newList = [...indexList];
      const [removed] = newList.splice(dragIndex, 1);
      newList.splice(dragOverIndex, 0, removed);
      setIndexList(newList);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // 处理点击指数卡片
  const handleIndexClick = (index: IndexData) => {
    if (!isEditing) {
      setSelectedIndex(index);
    }
  };

  const getStatusConfig = () => {
    switch (marketStatus) {
      case 'trading':
        return { text: '交易中', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: Zap, pulse: true };
      case 'lunch':
        return { text: '午间休市', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: Clock, pulse: false };
      case 'closed':
        return { text: '已休市', color: 'text-muted-foreground', bg: 'bg-muted/50 border-muted', icon: Clock, pulse: false };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;

  if (isLoading) {
    return (
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="glass-card rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-5 w-20 bg-muted rounded animate-shimmer" />
            <div className="h-6 w-16 bg-muted rounded-full animate-shimmer" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 sm:h-28 rounded-xl bg-muted/30 animate-shimmer" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="glass-card rounded-2xl p-4 sm:p-6 animate-fade-in">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Activity className="h-5 w-5 text-primary" />
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold">大盘指数</h2>
            </div>
            <div className="flex items-center gap-2">
              {/* 编辑按钮 */}
              <Button
                variant={isEditing ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setIsEditing(!isEditing);
                  setShowAddSelect(false);
                }}
                className={cn(
                  "h-8 rounded-lg transition-all duration-300",
                  isEditing ? "bg-primary text-primary-foreground" : "hover:bg-primary/10"
                )}
              >
                <Edit2 className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">{isEditing ? '完成' : '编辑'}</span>
              </Button>
              {/* 市场状态 */}
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-300",
                status.bg,
                status.color
              )}>
                <StatusIcon className={cn("h-3 w-3", status.pulse && "animate-pulse")} />
                {status.text}
              </div>
            </div>
          </div>

          {/* 指数卡片网格 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {indexData.map((index, i) => {
              const isUp = index.f3 > 0;
              const isDown = index.f3 < 0;
              const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
              const indexCode = `${index.f13}.${index.f12}`;

              return (
                <div
                  key={indexCode}
                  draggable={isEditing}
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleIndexClick(index)}
                  className={cn(
                    "group relative overflow-hidden rounded-xl p-4 transition-all duration-300",
                    "bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm",
                    "border border-white/5 hover:border-white/10",
                    !isEditing && "cursor-pointer hover-lift",
                    isEditing && "cursor-grab active:cursor-grabbing",
                    isUp && "hover:shadow-[0_10px_40px_-10px_hsl(var(--up)/0.3)]",
                    isDown && "hover:shadow-[0_10px_40px_-10px_hsl(var(--down)/0.3)]",
                    dragIndex === i && "opacity-50",
                    dragOverIndex === i && "ring-2 ring-primary",
                    "animate-fade-in"
                  )}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* 编辑模式下的删除按钮 */}
                  {isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveIndex(indexCode);
                      }}
                      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-destructive/90 text-destructive-foreground hover:bg-destructive transition-all duration-200 shadow-lg"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}

                  {/* 拖拽手柄 */}
                  {isEditing && (
                    <div className="absolute top-2 left-2 z-10 p-1 text-muted-foreground/50">
                      <GripVertical className="h-4 w-4" />
                    </div>
                  )}

                  {/* 光晕背景效果 */}
                  <div className={cn(
                    "absolute -top-12 -right-12 w-24 h-24 rounded-full blur-2xl transition-opacity duration-500",
                    "opacity-0 group-hover:opacity-100",
                    isUp ? "bg-up/20" : isDown ? "bg-down/20" : "bg-primary/10"
                  )} />

                  <div className="relative">
                    {/* 指数名称和图标 */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                        {index.f14 || getIndexLabel(indexCode)}
                      </span>
                      <div className={cn(
                        "p-1.5 rounded-lg transition-all duration-300",
                        isUp ? "bg-up/10 group-hover:bg-up/20" : isDown ? "bg-down/10 group-hover:bg-down/20" : "bg-muted"
                      )}>
                        <TrendIcon className={cn(
                          "h-3 w-3 sm:h-3.5 sm:w-3.5 transition-transform duration-300 group-hover:scale-110",
                          getChangeColor(index.f3)
                        )} />
                      </div>
                    </div>

                    {/* 最新价 */}
                    <div className={cn(
                      "text-xl sm:text-2xl font-bold tabular-nums mb-2 transition-all duration-300",
                      getChangeColor(index.f3)
                    )}>
                      {formatNumber(index.f2, index.f2 > 1000 ? 2 : 4)}
                    </div>

                    {/* 涨跌信息 */}
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-xs sm:text-sm font-semibold tabular-nums",
                        isUp ? "bg-up/10 text-up" : isDown ? "bg-down/10 text-down" : "bg-muted text-muted-foreground"
                      )}>
                        {index.f3 > 0 ? '+' : ''}{formatNumber(index.f3, 2)}%
                      </span>
                      <span className={cn(
                        "text-xs tabular-nums text-muted-foreground/80",
                        getChangeColor(index.f4)
                      )}>
                        {index.f4 > 0 ? '+' : ''}{formatNumber(index.f4, 2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 添加指数卡片 */}
            {isEditing && indexList.length < 4 && (
              <div className={cn(
                "rounded-xl p-4 border-2 border-dashed border-muted-foreground/20",
                "flex flex-col items-center justify-center min-h-[100px]",
                "transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
              )}>
                {!showAddSelect ? (
                  <button
                    onClick={() => setShowAddSelect(true)}
                    className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">添加指数</span>
                  </button>
                ) : (
                  <div className="w-full space-y-2 px-2">
                    <Select value={selectedNewIndex} onValueChange={setSelectedNewIndex}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="选择指数" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableIndexOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowAddSelect(false);
                          setSelectedNewIndex('');
                        }}
                        className="flex-1 h-7 text-xs"
                      >
                        取消
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddIndex}
                        disabled={!selectedNewIndex}
                        className="flex-1 h-7 text-xs"
                      >
                        确定
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 指数详情弹窗 */}
      <IndexDetailDialog
        open={!!selectedIndex}
        onOpenChange={(open) => !open && setSelectedIndex(null)}
        index={selectedIndex ? {
          code: `${selectedIndex.f13}.${selectedIndex.f12}`,
          name: selectedIndex.f14 || '',
          market: selectedIndex.f13
        } : null}
      />
    </>
  );
}
