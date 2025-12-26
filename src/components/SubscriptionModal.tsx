"use client";

import { useState } from "react";
import { X, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { CourseData, Subscription } from "@/types";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { subscription, setSubscription } = useStore();
  const [url, setUrl] = useState(subscription?.url || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("请求失败，请检查链接是否正确");
      
      const data: CourseData = await response.json();
      
      // 这里的 data 校验可以根据具体结构更详细一点
      if (!Array.isArray(data)) throw new Error("数据格式错误，应为 Course 数组");

      const newSub: Subscription = {
        url: url.trim(),
        lastUpdatedAt: new Date().toISOString(),
        courses: data.map(c => ({ ...c, resources: c.resources || [] })),
      };

      setSubscription(newSub);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败");
    } finally {
      setLoading(false);
    }
  };

  const isSame = subscription?.url === url.trim();

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">订阅管理</h2>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                订阅地址 (JSON URL)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/rss.json"
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-xl text-sm">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-xl text-sm">
                <CheckCircle2 size={16} />
                <span>更新成功！</span>
              </div>
            )}

            <button
              onClick={handleUpdate}
              disabled={loading || !url.trim()}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all shadow-sm",
                loading ? "bg-muted cursor-not-allowed" : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
              )}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : isSame ? (
                <>
                  <RefreshCw size={18} />
                  <span>刷新订阅</span>
                </>
              ) : (
                <span>确定订阅</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
