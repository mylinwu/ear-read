"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Trash2, Play } from "lucide-react";
import { useMount } from "ahooks";
import { useStore } from "@/store/useStore";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Header } from "@/components/Header";

export default function HistoryPage() {
  const { history, clearHistory, setCurrentResource, getSubscriptionById } = useStore();
  const [mounted, setMounted] = useState(false);

  useMount(() => {
    setMounted(true);
  });

  if (!mounted) {
    return <div className="pt-4 min-h-[70vh]" />;
  }

  const handlePlay = (item: typeof history[0]) => {
    const subscription = getSubscriptionById(item.subscriptionId);
    if (!subscription) return;
    
    const course = subscription.courses.find(c => c.id === item.courseId);
    if (!course) return;
    
    const resourceIndex = course.resources.findIndex(r => r.id === item.resourceId);
    if (resourceIndex === -1) return;
    
    // 播放当前及后续资源
    const playlist = course.resources.slice(resourceIndex, resourceIndex + 20);
    setCurrentResource(item.subscriptionId, item.courseId, item.resourceId, playlist);
  };

  const handleClear = () => {
    if (confirm("确定要清空播放历史吗？")) {
      clearHistory();
    }
  };

  return (
    <div className="pt-20 pb-32 min-h-screen">
      <Header 
        title="播放历史" 
        rightContent={history.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
            <span>清空</span>
          </button>
        )}
      />

      {history.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Clock size={48} className="mx-auto mb-4 opacity-30" />
          <p>暂无播放记录</p>
          <p className="text-sm mt-1">开始播放内容后会在这里显示</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, index) => (
            <div
              key={`${item.resourceId}-${index}`}
              className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all"
            >
              <button
                onClick={() => handlePlay(item)}
                className="shrink-0 w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Play size={16} fill="currentColor" className="ml-0.5" />
              </button>
              
              <Link 
                href={`/episode/${item.resourceId}?courseId=${item.courseId}&sid=${item.subscriptionId}`}
                className="flex-1 min-w-0"
              >
                <div className="font-semibold text-sm truncate mb-0.5">
                  {item.resourceTitle}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                  <span className="truncate">{item.courseTitle}</span>
                  <span>·</span>
                  <span className="shrink-0 flex items-center gap-1">
                    <Clock size={10} />
                    {formatDistanceToNow(new Date(item.playedAt), { addSuffix: true, locale: zhCN })}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
