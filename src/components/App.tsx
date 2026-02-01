import React, { useEffect, useCallback, useState } from 'react';
import Header from '@/components/layout/Header';
import FundList from '@/components/fund/FundList';
import Market from '@/components/market/Market';
import Settings from '@/components/settings/Settings';
import { useFundStore } from '@/stores/fundStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { fetchFundData } from '@/services/fundApi';
import { isMarketOpen } from '@/utils/holiday';
import { transformFundData } from '@/utils/calculate';

export default function App() {
  const [activeTab, setActiveTab] = useState('funds');
  const { fundList, setFundData } = useFundStore();
  const { isLiveUpdate, darkMode } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);

  // 应用主题 - 默认深色
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  // 路由同步
  const getTabFromPath = useCallback((path: string) => {
    if (path.startsWith('/market')) return 'market';
    if (path.startsWith('/settings')) return 'settings';
    return 'funds';
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const applyPath = () => setActiveTab(getTabFromPath(window.location.pathname));
    applyPath();
    window.addEventListener('popstate', applyPath);
    return () => window.removeEventListener('popstate', applyPath);
  }, [getTabFromPath]);

  const navigateTab = useCallback((tab: string) => {
    if (typeof window === 'undefined') return;
    const path = tab === 'market' ? '/market' : tab === 'settings' ? '/settings' : '/';
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setActiveTab(tab);
  }, []);

  // 刷新数据
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 获取基金数据
      const fundCodes = fundList.map(f => f.code);
      if (fundCodes.length > 0) {
        const apiDataList = await fetchFundData(fundCodes);
        const newFundData = transformFundData(apiDataList, fundList);
        setFundData(newFundData);
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fundList, setFundData]);

  // 初始加载和自动刷新
  useEffect(() => {
    refreshData();

    if (!isLiveUpdate) return;

    // 每分钟检查是否需要刷新
    const interval = setInterval(() => {
      if (isMarketOpen()) {
        refreshData();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isLiveUpdate, refreshData]);

  // 渲染当前页面
  const renderPage = () => {
    switch (activeTab) {
      case 'funds':
        return <FundList />;
      case 'market':
        return <Market />;
      case 'settings':
        return <Settings />;
      default:
        return <FundList />;
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
      </div>

      {/* 顶部导航 */}
      <div className="sticky top-0 z-50">
        <div className="glass-strong">
          <Header
            onRefresh={refreshData}
            isLoading={isLoading}
            activeTab={activeTab}
            onTabChange={navigateTab}
          />
        </div>
      </div>

      {/* 主内容区 */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-fade-in">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}
