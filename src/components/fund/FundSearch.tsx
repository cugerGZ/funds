import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Plus, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { searchFund } from '@/services/fundApi';
import { useFundStore } from '@/stores/fundStore';
import { cn } from '@/lib/utils';
import type { SearchResult } from '@/types/fund';

interface FundSearchProps {
  onClose?: () => void;
}

export default function FundSearch({ onClose }: FundSearchProps) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { fundList, addFund } = useFundStore();

  // 防抖搜索
  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchFund(keyword);
        setResults(data.slice(0, 20));
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword]);

  const handleAdd = useCallback((code: string) => {
    addFund(code);
  }, [addFund]);

  const isAdded = (code: string) => fundList.some(f => f.code === code);

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="relative">
        <Input
          type="text"
          placeholder="搜索基金代码或名称"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="px-4 h-12 text-base"
          autoFocus
        />
        {keyword && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setKeyword('')}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* 搜索状态 */}
      {isSearching && (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          搜索中...
        </div>
      )}

      {/* 搜索结果 */}
      {!isSearching && results.length > 0 && (
        <ScrollArea className="h-[300px] sm:h-[400px]">
          <div className="space-y-1">
            {results.map((item) => {
              const added = isAdded(item.CODE);
              return (
                <div
                  key={item.CODE}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg transition-colors",
                    added ? "bg-muted/50" : "hover:bg-muted cursor-pointer"
                  )}
                  onClick={() => !added && handleAdd(item.CODE)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-primary">{item.CODE}</span>
                      {item.FundBaseInfo?.FTYPE && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {item.FundBaseInfo.FTYPE}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground truncate mt-0.5">
                      {item.NAME || item.FundBaseInfo?.SHORTNAME}
                    </p>
                  </div>
                  <Button
                    variant={added ? "secondary" : "default"}
                    size="sm"
                    disabled={added}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAdd(item.CODE);
                    }}
                    className="ml-3 shrink-0"
                  >
                    {added ? '已添加' : (
                      <Plus className="h-4 w-4 mr-1" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* 无结果 */}
      {!isSearching && keyword && results.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          未找到相关基金
        </div>
      )}
    </div>
  );
}
