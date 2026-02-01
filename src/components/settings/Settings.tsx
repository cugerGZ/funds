import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  Eye,
  Moon,
  Sun,
  RefreshCw,
  TrendingUp,
  Wallet,
  PiggyBank,
  Percent,
  Sparkles,
  Settings as SettingsIcon,
  Palette,
  Info,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Settings() {
  const {
    showGSZ,
    showAmount,
    showGains,
    showCost,
    showCostRate,
    darkMode,
    isLiveUpdate,
    setDarkMode,
    toggleSetting,
    setLiveUpdate,
  } = useSettingsStore();

  const displaySettings = [
    { key: 'showGSZ' as const, label: '显示估算净值', description: '在基金列表中显示实时估值', icon: TrendingUp, value: showGSZ },
    { key: 'showAmount' as const, label: '显示持有金额', description: '显示当前持有市值', icon: Wallet, value: showAmount },
    { key: 'showGains' as const, label: '显示日收益', description: '显示当日估算收益', icon: TrendingUp, value: showGains },
    { key: 'showCost' as const, label: '显示持有收益', description: '显示相对成本的收益', icon: PiggyBank, value: showCost },
    { key: 'showCostRate' as const, label: '显示持有收益率', description: '以百分比显示持有收益', icon: Percent, value: showCostRate },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/50 shadow-lg shadow-primary/25">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-accent animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">设置</h2>
            <p className="text-xs text-muted-foreground">个性化您的体验</p>
          </div>
        </div>
      </div>

      {/* 主题设置 */}
      <Card className="glass-card border-0 rounded-2xl overflow-hidden animate-fade-in stagger-1">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Palette className="h-4 w-4 text-primary" />
            </div>
            主题设置
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-between group cursor-pointer hover:bg-primary/5 -mx-2 px-2 py-2 rounded-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2.5 rounded-xl transition-all duration-300",
                darkMode ? "bg-primary/10" : "bg-amber-500/10"
              )}>
                {darkMode ? (
                  <Moon className="h-5 w-5 text-primary" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-500" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">暗色模式</p>
                <p className="text-xs text-muted-foreground">
                  {darkMode ? '当前为深色主题' : '当前为浅色主题'}
                </p>
              </div>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* 显示设置 */}
      <Card className="glass-card border-0 rounded-2xl overflow-hidden animate-fade-in stagger-2">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Eye className="h-4 w-4 text-primary" />
            </div>
            显示设置
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-1">
          {displaySettings.map(({ key, label, description, icon: Icon, value }, index) => (
            <div
              key={key}
              className="flex items-center justify-between group cursor-pointer hover:bg-primary/5 -mx-2 px-2 py-3 rounded-xl transition-all duration-300"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2 rounded-lg transition-all duration-300",
                  value ? "bg-primary/10" : "bg-muted"
                )}>
                  <Icon className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    value ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              <Switch
                checked={value}
                onCheckedChange={() => toggleSetting(key)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 更新设置 */}
      <Card className="glass-card border-0 rounded-2xl overflow-hidden animate-fade-in stagger-3">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <RefreshCw className="h-4 w-4 text-primary" />
            </div>
            更新设置
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-between group cursor-pointer hover:bg-primary/5 -mx-2 px-2 py-2 rounded-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2.5 rounded-xl transition-all duration-300",
                isLiveUpdate ? "bg-emerald-500/10" : "bg-muted"
              )}>
                <RefreshCw className={cn(
                  "h-5 w-5 transition-colors duration-300",
                  isLiveUpdate ? "text-emerald-500" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className="text-sm font-medium">自动刷新</p>
                <p className="text-xs text-muted-foreground">
                  {isLiveUpdate ? '交易时间自动更新数据' : '手动刷新数据'}
                </p>
              </div>
            </div>
            <Switch
              checked={isLiveUpdate}
              onCheckedChange={setLiveUpdate}
            />
          </div>
        </CardContent>
      </Card>

      {/* 关于 */}
      <Card className="glass-card border-0 rounded-2xl overflow-hidden animate-fade-in stagger-4">
        <CardHeader className="pb-3 border-b border-white/5">
          <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Info className="h-4 w-4 text-primary" />
            </div>
            关于
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-primary to-primary/50 shadow-lg shadow-primary/25">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">基金派</h3>
              <p className="text-sm text-muted-foreground">Fund Master v1.0.0</p>
            </div>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="pt-3 mt-3 border-t border-white/5">
              <p className="text-xs leading-relaxed">
                免责声明：本应用仅供学习参考，不构成任何投资建议。投资有风险，入市需谨慎。
              </p>
            </div>
            <div className="pt-3 flex items-center gap-1 text-xs">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-up fill-up" />
              <span>by Fund Master Team</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
