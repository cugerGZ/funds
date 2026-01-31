import React from 'react';
import { Wallet, TrendingUp, Settings, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function MobileNav({ activeTab, onTabChange, onRefresh, isLoading }: MobileNavProps) {
  const tabs = [
    { id: 'funds', label: '基金', icon: Wallet },
    { id: 'market', label: '行情', icon: TrendingUp },
    { id: 'settings', label: '设置', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden safe-area-inset-bottom">
      {/* 毛玻璃背景 */}
      <div className="absolute inset-0 glass-strong border-t border-white/10" />

      <div className="relative flex items-center justify-around h-16 px-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 cursor-pointer relative group"
            )}
          >
            {/* 选中状态背景 */}
            {activeTab === id && (
              <div className="absolute inset-x-2 inset-y-1 bg-primary/10 rounded-xl transition-all duration-300" />
            )}

            <div className={cn(
              "relative p-1.5 rounded-lg transition-all duration-300",
              activeTab === id
                ? "text-primary"
                : "text-muted-foreground group-hover:text-foreground"
            )}>
              <Icon className={cn(
                "h-5 w-5 transition-all duration-300",
                activeTab === id && "scale-110"
              )} />
              {/* 选中指示器发光 */}
              {activeTab === id && (
                <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md" />
              )}
            </div>

            <span className={cn(
              "text-[10px] font-medium transition-all duration-300 relative",
              activeTab === id
                ? "text-primary font-semibold"
                : "text-muted-foreground group-hover:text-foreground"
            )}>
              {label}
            </span>
          </button>
        ))}

        {/* 刷新按钮 */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 cursor-pointer group",
            "text-muted-foreground hover:text-foreground disabled:opacity-50"
          )}
        >
          <div className="relative p-1.5 rounded-lg transition-all duration-300 group-hover:bg-primary/10">
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <RefreshCw className="h-5 w-5 transition-transform duration-500 group-hover:rotate-180" />
            )}
          </div>
          <span className="text-[10px] font-medium">刷新</span>
        </button>
      </div>
    </nav>
  );
}
