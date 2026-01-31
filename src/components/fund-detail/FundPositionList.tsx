import React, { useEffect, useState } from 'react';
import { fetchFundPositions, fetchStockQuotes, type FundStockItem, type StockQuote } from '@/services/fundDetailApi';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FundPositionListProps {
  fundCode: string;
  onStockClick?: (stock: StockQuote) => void;
}

export default function FundPositionList({ fundCode, onStockClick }: FundPositionListProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stocks, setStocks] = useState<FundStockItem[]>([]);
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [updateDate, setUpdateDate] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchFundPositions(fundCode);
        setStocks(result.stocks);
        setUpdateDate(result.updateDate);

        // 获取股票实时行情
        if (result.stocks.length > 0) {
          const secids = result.stocks.map(s => `${s.NEWTEXCH}.${s.GPDM}`);
          const quotesData = await fetchStockQuotes(secids);
          setQuotes(quotesData);
        }
      } catch (error) {
        console.error('Failed to load fund positions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fundCode]);

  const formatCompared = (stock: FundStockItem) => {
    if (stock.PCTNVCHGTYPE === '新增') {
      return '新增';
    }
    const val = parseFloat(stock.PCTNVCHG);
    if (isNaN(val)) return '0';
    const icon = val > 0 ? '↑ ' : '↓ ';
    return icon + Math.abs(val).toFixed(2) + '%';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[260px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[260px] text-muted-foreground">
        暂无持仓数据
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h5 className="text-sm text-muted-foreground">
        {updateDate ? `截止日期：${updateDate}` : '暂无数据'}
      </h5>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 font-medium">股票名称（代码）</th>
              <th className="text-right py-2 px-2 font-medium">价格</th>
              <th className="text-right py-2 px-2 font-medium">涨跌幅</th>
              <th className="text-right py-2 px-2 font-medium">持仓占比</th>
              <th className="text-right py-2 px-2 font-medium">较上期</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, idx) => {
              const quote = quotes[idx] || { f2: 0, f3: 0 };
              const isUp = quote.f3 >= 0;

              return (
                <tr
                  key={stock.GPDM}
                  className={cn(
                    "border-b last:border-b-0 cursor-pointer transition-colors",
                    idx % 2 === 0 ? "bg-muted/30" : "",
                    "hover:bg-muted/50"
                  )}
                  onClick={() => onStockClick?.(quote)}
                >
                  <td className="py-2 px-2 text-left hover:text-primary">
                    {stock.GPJC}（{stock.GPDM}）
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums">
                    {quote.f2?.toFixed(2) || '-'}
                  </td>
                  <td className={cn(
                    "py-2 px-2 text-right tabular-nums font-medium",
                    isUp ? "text-up" : "text-down"
                  )}>
                    {quote.f3?.toFixed(2) || '-'}%
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums">
                    {parseFloat(stock.JZBL).toFixed(2)}%
                  </td>
                  <td className="py-2 px-2 text-right">
                    {formatCompared(stock)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
