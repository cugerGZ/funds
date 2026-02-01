import React from 'react';
import { TrendingUp, RefreshCw, Loader2, Sparkles, Wallet, BarChart3, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ThemeToggle from './ThemeToggle';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Header({ onRefresh, isLoading, activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { id: 'funds', label: '我的基金', icon: Wallet },
    { id: 'market', label: '行情中心', icon: BarChart3 },
    { id: 'settings', label: '设置', icon: Settings },
  ];

  return (
    <>
    <header className="w-full border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <button
            type="button"
            onClick={() => onTabChange('funds')}
            className="flex items-center gap-2 sm:gap-3 group cursor-pointer shrink-0"
            aria-label="返回首页"
          >
            <div className="relative">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/50 shadow-lg shadow-primary/25 transition-transform duration-300 group-hover:scale-105">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 hidden sm:block">
                <Sparkles className="h-3 w-3 text-accent animate-pulse" />
              </div>
            </div>
            <span className="font-bold text-base sm:text-xl tracking-tight">
              基金派
            </span>
          </button>

          {/* 桌面端导航标签 */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer",
                  activeTab === id
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* 刷新按钮 */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-10 w-10 rounded-xl hover:bg-primary/10 transition-all duration-300 touch-manipulation active:scale-95"
              aria-label="刷新"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              ) : (
                <RefreshCw className="h-5 w-5 transition-transform duration-300 hover:rotate-180" />
              )}
            </Button>

            {/* 主题切换 */}
            <ThemeToggle />

            {/* 移动端下拉菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl hover:bg-primary/10 md:hidden touch-manipulation active:scale-95 transition-transform"
                  aria-label="菜单"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 z-[100]" sideOffset={8}>
                {/* 导航菜单 */}
                {tabs.map(({ id, label, icon: Icon }) => (
                  <DropdownMenuItem
                    key={id}
                    onClick={() => onTabChange(id)}
                    className={cn(
                      "cursor-pointer touch-manipulation",
                      activeTab === id && "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
