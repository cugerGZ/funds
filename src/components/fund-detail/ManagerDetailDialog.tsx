import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, User, Calendar, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchManagerList, fetchManagerDetail, type ManagerHistory, type ManagerDetail } from '@/services/managerApi';

interface ManagerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fundCode: string;
  fundName?: string;
}

export default function ManagerDetailDialog({
  open,
  onOpenChange,
  fundCode,
  fundName
}: ManagerDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [managerHistory, setManagerHistory] = useState<ManagerHistory[]>([]);
  const [managerDetails, setManagerDetails] = useState<ManagerDetail[]>([]);

  useEffect(() => {
    if (open && fundCode) {
      loadData();
    }
  }, [open, fundCode]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [historyData, detailData] = await Promise.all([
        fetchManagerList(fundCode),
        fetchManagerDetail(fundCode)
      ]);
      setManagerHistory(historyData);
      setManagerDetails(detailData);
    } catch (error) {
      console.error('获取基金经理数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {fundName ? `${fundName} - 基金经理` : '基金经理详情'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* 基金经理变动一览 */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  基金经理变动一览
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">起始期</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">截止期</th>
                        <th className="text-left py-2 px-3 font-medium text-muted-foreground">基金经理</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">任职期</th>
                        <th className="text-right py-2 px-3 font-medium text-muted-foreground">任职涨幅</th>
                      </tr>
                    </thead>
                    <tbody>
                      {managerHistory.map((manager) => (
                        <tr key={manager.MGRID} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-2 px-3">{manager.FEMPDATE}</td>
                          <td className="py-2 px-3">{manager.LEMPDATE || '至今'}</td>
                          <td className="py-2 px-3 font-medium">{manager.MGRNAME}</td>
                          <td className="py-2 px-3 text-right">{manager.DAYS?.toFixed(0)}天</td>
                          <td className={cn(
                            "py-2 px-3 text-right font-medium flex items-center justify-end gap-1",
                            manager.PENAVGROWTH >= 0 ? "text-up" : "text-down"
                          )}>
                            {manager.PENAVGROWTH >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {manager.PENAVGROWTH?.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {managerHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无数据
                  </div>
                )}
              </div>

              {/* 现任基金经理简介 */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  现任基金经理简介
                </h3>

                {managerDetails.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    暂无数据
                  </div>
                ) : (
                  <div className="space-y-6">
                    {managerDetails.map((manager) => (
                      <div key={manager.MGRID} className="rounded-xl bg-muted/30 p-4">
                        <div className="flex gap-4">
                          {/* 照片 */}
                          <div className="flex-shrink-0">
                            {manager.PHOTOURL ? (
                              <img
                                src={manager.PHOTOURL}
                                alt={manager.MGRNAME}
                                className="w-20 h-24 rounded-lg object-cover bg-muted"
                              />
                            ) : (
                              <div className="w-20 h-24 rounded-lg bg-muted flex items-center justify-center">
                                <User className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* 信息 */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-base">{manager.MGRNAME}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>上任日期：{manager.FEMPDATE}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              <span>管理年限：{manager.DAYS}</span>
                            </div>
                          </div>
                        </div>

                        {/* 简历 */}
                        {manager.RESUME && (
                          <div className="mt-4 pt-4 border-t border-border/50">
                            <p className="text-sm text-muted-foreground leading-relaxed text-justify indent-8">
                              {manager.RESUME}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
