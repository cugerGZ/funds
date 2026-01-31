import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, LineChart, Building2, ArrowUpCircle, ArrowDownCircle, Sparkles } from 'lucide-react';
import MarketCapitalFlow from './MarketCapitalFlow';
import MarketIndustryFlow from './MarketIndustryFlow';
import MarketNorthboundFlow from './MarketNorthboundFlow';
import MarketSouthboundFlow from './MarketSouthboundFlow';

export default function Market() {
  const [activeTab, setActiveTab] = useState('capital');

  return (
    <div className="space-y-6">
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

      {/* 行情标签页 */}
      <Card className="glass-card p-4 sm:p-6 animate-fade-in stagger-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="capital" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <LineChart className="h-4 w-4" />
              <span className="hidden sm:inline">大盘资金</span>
              <span className="sm:hidden">资金</span>
            </TabsTrigger>
            <TabsTrigger value="industry" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">行业板块</span>
              <span className="sm:hidden">行业</span>
            </TabsTrigger>
            <TabsTrigger value="northbound" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <ArrowUpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">北向资金</span>
              <span className="sm:hidden">北向</span>
            </TabsTrigger>
            <TabsTrigger value="southbound" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <ArrowDownCircle className="h-4 w-4" />
              <span className="hidden sm:inline">南向资金</span>
              <span className="sm:hidden">南向</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="capital">
            <MarketCapitalFlow />
          </TabsContent>

          <TabsContent value="industry">
            <MarketIndustryFlow />
          </TabsContent>

          <TabsContent value="northbound">
            <MarketNorthboundFlow />
          </TabsContent>

          <TabsContent value="southbound">
            <MarketSouthboundFlow />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
