import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BarChart3, LineChart, Building2, ArrowUpCircle, ArrowDownCircle, Sparkles } from 'lucide-react';
import MarketCapitalFlow from './MarketCapitalFlow';
import MarketIndustryFlow from './MarketIndustryFlow';
import MarketNorthboundFlow from './MarketNorthboundFlow';
import MarketSouthboundFlow from './MarketSouthboundFlow';

export default function Market() {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 页面标题 */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/50 shadow-lg shadow-primary/25">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-accent animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">行情中心</h2>
            <p className="text-xs text-muted-foreground">实时掌握市场动态</p>
          </div>
        </div>
      </div>

      {/* 大盘资金流 */}
      <Card className="glass-card animate-fade-in stagger-1">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10">
              <LineChart className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold">大盘资金流</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <MarketCapitalFlow />
        </CardContent>
      </Card>

      {/* 行业板块 */}
      <Card className="glass-card animate-fade-in stagger-2">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-semibold">行业板块资金流</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <MarketIndustryFlow />
        </CardContent>
      </Card>

      {/* 北向资金 */}
      <Card className="glass-card animate-fade-in stagger-3">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-up/10">
              <ArrowUpCircle className="h-4 w-4 text-up" />
            </div>
            <h3 className="text-base font-semibold">北向资金流</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <MarketNorthboundFlow />
        </CardContent>
      </Card>

      {/* 南向资金 */}
      <Card className="glass-card animate-fade-in stagger-4">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-down/10">
              <ArrowDownCircle className="h-4 w-4 text-down" />
            </div>
            <h3 className="text-base font-semibold">南向资金流</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <MarketSouthboundFlow />
        </CardContent>
      </Card>
    </div>
  );
}
