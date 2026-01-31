import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Download, Upload, Copy, Check, AlertCircle } from 'lucide-react';
import { useFundStore } from '@/stores/fundStore';
import { cn } from '@/lib/utils';

interface ConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ConfigDialog({ open, onOpenChange }: ConfigDialogProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [exportConfig, setExportConfig] = useState('');
  const [importConfig, setImportConfig] = useState('');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);

  const fundStore = useFundStore();

  useEffect(() => {
    if (open && activeTab === 'export') {
      generateExportConfig();
    }
  }, [open, activeTab]);

  const generateExportConfig = () => {
    const config = {
      fundList: fundStore.fundList,
      indexList: fundStore.indexList,
      exportTime: new Date().toISOString(),
      version: '1.0.0',
    };
    setExportConfig(JSON.stringify(config, null, 2));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportConfig);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleImport = () => {
    setImportError('');
    setImportSuccess(false);

    if (!importConfig.trim()) {
      setImportError('请输入配置文本');
      return;
    }

    try {
      const config = JSON.parse(importConfig);

      // 验证配置格式
      if (!config || typeof config !== 'object') {
        throw new Error('配置格式不正确');
      }

      // 导入基金列表
      if (Array.isArray(config.fundList)) {
        fundStore.setFundList(config.fundList);
      }

      // 导入指数列表
      if (Array.isArray(config.indexList)) {
        fundStore.setIndexList(config.indexList);
      }

      setImportSuccess(true);
      setImportConfig('');

      // 2秒后关闭对话框
      setTimeout(() => {
        onOpenChange(false);
        setImportSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('导入失败:', err);
      setImportError('导入失败，配置文本格式不正确！');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {activeTab === 'export' ? (
              <>
                <Download className="h-5 w-5 text-primary" />
                配置管理
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 text-primary" />
                配置管理
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'export' | 'import')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              导出配置
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              导入配置
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4">
            <Textarea
              value={exportConfig}
              readOnly
              className="h-64 font-mono text-sm"
              placeholder="正在生成配置..."
            />
            <Button
              onClick={handleCopy}
              className="w-full"
              variant={copied ? "default" : "outline"}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  已复制到剪贴板
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  复制到剪贴板
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              请将配置文本保存到安全的地方，以便日后恢复
            </p>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Textarea
              value={importConfig}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setImportConfig(e.target.value);
                setImportError('');
                setImportSuccess(false);
              }}
              className="h-64 font-mono text-sm"
              placeholder="请在此粘贴配置文本..."
            />

            {importError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4" />
                {importError}
              </div>
            )}

            {importSuccess && (
              <div className="flex items-center gap-2 text-sm text-up bg-up/10 rounded-lg px-3 py-2">
                <Check className="h-4 w-4" />
                恭喜，导入配置成功！
              </div>
            )}

            <Button
              onClick={handleImport}
              className="w-full"
              disabled={importSuccess}
            >
              <Upload className="h-4 w-4 mr-2" />
              提交配置文本
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              导入配置将覆盖当前的基金列表和指数列表
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
