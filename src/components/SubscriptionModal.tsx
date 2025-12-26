"use client";

import { useState, useEffect } from "react";
import { 
  X, RefreshCw, CheckCircle2, AlertCircle, Loader2, 
  Plus, Trash2, Edit3, ExternalLink, ChevronDown 
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { CourseData } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalView = 'list' | 'add' | 'edit';

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const { subscriptions, addSubscription, updateSubscription, removeSubscription, refreshSubscription } = useStore();
  
  const [view, setView] = useState<ModalView>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 重置表单
  const resetForm = () => {
    setUrl("");
    setName("");
    setError(null);
    setSuccess(false);
    setEditingId(null);
  };

  // 关闭时重置
  useEffect(() => {
    if (!isOpen) {
      setView('list');
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`请求失败 (${response.status})`);
      
      const data: CourseData = await response.json();
      if (!Array.isArray(data)) throw new Error("数据格式错误，应为 Course 数组");

      // 提取 URL 中的文件名作为默认名称
      const urlParts = url.split('/');
      const defaultName = name.trim() || urlParts[urlParts.length - 2] || '新订阅';

      addSubscription({
        name: defaultName,
        url: url.trim(),
        lastUpdatedAt: new Date().toISOString(),
        courses: data.map(c => ({ ...c, resources: c.resources || [] })),
      });

      setSuccess(true);
      setTimeout(() => {
        setView('list');
        resetForm();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "添加失败");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingId || !url.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`请求失败 (${response.status})`);
      
      const data: CourseData = await response.json();
      if (!Array.isArray(data)) throw new Error("数据格式错误");

      updateSubscription(editingId, {
        name: name.trim() || '订阅',
        url: url.trim(),
        lastUpdatedAt: new Date().toISOString(),
        courses: data.map(c => ({ ...c, resources: c.resources || [] })),
      });

      setSuccess(true);
      setTimeout(() => {
        setView('list');
        resetForm();
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (id: string, subUrl: string) => {
    setRefreshingId(id);
    try {
      const response = await fetch(subUrl);
      if (!response.ok) throw new Error("刷新失败");
      
      const data: CourseData = await response.json();
      if (!Array.isArray(data)) throw new Error("数据格式错误");

      refreshSubscription(id, data.map(c => ({ ...c, resources: c.resources || [] })));
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个订阅吗？")) {
      removeSubscription(id);
    }
  };

  const startEdit = (sub: typeof subscriptions[0]) => {
    setEditingId(sub.id);
    setUrl(sub.url);
    setName(sub.name);
    setView('edit');
  };

  // 列表视图
  const renderListView = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">订阅管理</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            共 {subscriptions.length} 个订阅源
          </p>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-3 max-h-[50vh] overflow-y-auto -mx-2 px-2">
        {subscriptions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>还没有订阅源</p>
            <p className="text-sm mt-1">点击下方按钮添加第一个订阅</p>
          </div>
        ) : (
          subscriptions.map((sub) => (
            <div 
              key={sub.id}
              className="bg-muted/30 border border-border rounded-xl overflow-hidden"
            >
              <div 
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{sub.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>{sub.courses.length} 个课程</span>
                    <span>·</span>
                    <span>
                      {formatDistanceToNow(new Date(sub.lastUpdatedAt), { addSuffix: true, locale: zhCN })}
                    </span>
                  </div>
                </div>
                <ChevronDown 
                  size={18} 
                  className={cn(
                    "text-muted-foreground transition-transform",
                    expandedId === sub.id && "rotate-180"
                  )} 
                />
              </div>
              
              {expandedId === sub.id && (
                <div className="px-3 pb-3 pt-1 border-t border-border/50 space-y-2">
                  <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded truncate">
                    {sub.url}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRefresh(sub.id, sub.url)}
                      disabled={refreshingId === sub.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50"
                    >
                      {refreshingId === sub.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RefreshCw size={14} />
                      )}
                      <span>刷新</span>
                    </button>
                    <button
                      onClick={() => startEdit(sub)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                    >
                      <Edit3 size={14} />
                      <span>编辑</span>
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => { resetForm(); setView('add'); }}
        className="w-full flex items-center justify-center gap-2 mt-4 py-3 rounded-xl font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
      >
        <Plus size={18} />
        <span>添加订阅</span>
      </button>
    </>
  );

  // 添加/编辑表单视图
  const renderFormView = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">
          {view === 'add' ? '添加订阅' : '编辑订阅'}
        </h2>
        <button 
          onClick={() => { setView('list'); resetForm(); }}
          className="p-1 hover:bg-muted rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            订阅名称 (可选)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：得到课程、我的书单"
            className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
            订阅地址 (JSON URL) <span className="text-red-500">*</span>
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
            <span>{view === 'add' ? '添加成功！' : '更新成功！'}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => { setView('list'); resetForm(); }}
            className="flex-1 py-3 rounded-xl font-semibold bg-muted hover:bg-muted/80 transition-all"
          >
            取消
          </button>
          <button
            onClick={view === 'add' ? handleAdd : handleEdit}
            disabled={loading || !url.trim()}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all shadow-sm",
              loading ? "bg-muted cursor-not-allowed" : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
            )}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <span>{view === 'add' ? '确认添加' : '保存修改'}</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
          <ExternalLink size={12} />
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            查看订阅格式说明
          </a>
        </div>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          {view === 'list' ? renderListView() : renderFormView()}
        </div>
      </div>
    </div>
  );
}
