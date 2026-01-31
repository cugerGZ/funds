import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, PieChart, TrendingUp, BarChart3, Info } from 'lucide-react';
import FundValuationChart from './FundValuationChart';
import FundHistoryChart from './FundHistoryChart';
import FundPositionList from './FundPositionList';
import FundInfoPanel from './FundInfoPanel';
import ManagerDetailDialog from './ManagerDetailDialog';

interface FundDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fund: {
    fundcode: string;
    name: string;
  } | null;
}

export default function FundDetailDialog({ open, onOpenChange, fund }: FundDetailDialogProps) {
  const [activeTab, setActiveTab] = useState('valuation');
  const [showManagerDetail, setShowManagerDetail] = useState(false);

  if (!fund) return null;

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {fund.name}（{fund.fundcode}）
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="valuation" className="flex items-center gap-1 text-xs">
              <LineChart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">净值估算</span>
              <span className="sm:hidden">估算</span>
            </TabsTrigger>
            <TabsTrigger value="position" className="flex items-center gap-1 text-xs">
              <PieChart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">持仓明细</span>
              <span className="sm:hidden">持仓</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1 text-xs">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">历史净值</span>
              <span className="sm:hidden">净值</span>
            </TabsTrigger>
            <TabsTrigger value="yield" className="flex items-center gap-1 text-xs">
              <BarChart3 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">累计收益</span>
              <span className="sm:hidden">收益</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center gap-1 text-xs">
              <Info className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">基金概况</span>
              <span className="sm:hidden">概况</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="valuation">
            <FundValuationChart fundCode={fund.fundcode} />
          </TabsContent>

          <TabsContent value="position">
            <FundPositionList fundCode={fund.fundcode} />
          </TabsContent>

          <TabsContent value="history">
            <FundHistoryChart fundCode={fund.fundcode} chartType="JZ" />
          </TabsContent>

          <TabsContent value="yield">
            <FundHistoryChart fundCode={fund.fundcode} chartType="LJSY" />
          </TabsContent>

          <TabsContent value="info">
            <FundInfoPanel
              fundCode={fund.fundcode}
              onManagerClick={() => setShowManagerDetail(true)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>

    {/* 基金经理详情弹窗 */}
    <ManagerDetailDialog
      open={showManagerDetail}
      onOpenChange={setShowManagerDetail}
      fundCode={fund.fundcode}
      fundName={fund.name}
    />
    </>
  );
}
