"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Play, CheckCircle, Target, Filter } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { CourseResource } from "@/types";
import { Header } from "@/components/Header";
import { useMount } from "ahooks";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 从 URL 获取订阅源 ID
  const subscriptionId = searchParams.get("sid");
  
  const { subscriptions, getSubscriptionById, currentResourceId, setCurrentResource, isPlaying } = useStore();
  const listRef = useRef<HTMLDivElement>(null);
  const [showScrollTip, setShowScrollTip] = useState(false);
  const [showUnlearnedOnly, setShowUnlearnedOnly] = useState(false);
  const [mounted, setMounted] = useState(false);

  useMount(() => {
    setMounted(true);
  });

  // 查找对应的订阅源和课程
  const subscription = subscriptionId ? getSubscriptionById(subscriptionId) : subscriptions[0];
  const course = subscription?.courses.find(c => c.id === id);

  // 过滤资源列表
  const filteredResources = course?.resources.filter(res => 
    showUnlearnedOnly ? !res.isLearned : true
  ) || [];

  // 获取未学习数量
  const unlearnedCount = course?.resources.filter(r => !r.isLearned).length || 0;

  useEffect(() => {
    // 检查最近学习的是否在视口外
    if (course?.lastResourceId && !showUnlearnedOnly) {
      // 使用 requestAnimationFrame 确保 DOM 已渲染
      requestAnimationFrame(() => {
        const element = document.getElementById(`res-${course.lastResourceId}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          // 如果元素不在可视区域内（考虑底部导航和播放器的高度）
          const isVisible = rect.top >= 0 && rect.bottom <= viewportHeight - 140;
          setShowScrollTip(!isVisible);
        }
      });
    }
  }, [course?.lastResourceId, showUnlearnedOnly]);

  if (!mounted) {
    return <div className="pt-20 pb-32 min-h-screen" />; // 渲染一个空容器占位，保持布局高度
  }

  if (!course || !subscription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Header title="课程详情" />
        <p className="text-muted-foreground mt-20">课程不存在</p>
        <button onClick={() => router.back()} className="mt-4 text-primary">返回首页</button>
      </div>
    );
  }

  const handlePlay = (resource: CourseResource) => {
    // 从原始列表找到索引，以便播放完整的后续内容
    const originalIndex = course.resources.findIndex(r => r.id === resource.id);
    const count = 20;
    const playlist = course.resources.slice(originalIndex, originalIndex + count);
    setCurrentResource(subscription.id, course.id, resource.id, playlist);
  };

  const scrollToLast = () => {
    const element = document.getElementById(`res-${course.lastResourceId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setShowScrollTip(false);
    }
  };

  return (
    <div className="pt-20 pb-32">
      <Header title={course.title} />

      {/* 过滤开关 */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="text-sm text-muted-foreground">
          共 {course.resources.length} 个节目
          {unlearnedCount > 0 && ` · ${unlearnedCount} 个未学`}
        </div>
        <button
          onClick={() => setShowUnlearnedOnly(!showUnlearnedOnly)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full transition-all",
            showUnlearnedOnly 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          <Filter size={14} />
          <span>只看未学</span>
        </button>
      </div>

      <div className="space-y-3" ref={listRef}>
        {filteredResources.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <CheckCircle size={48} className="mx-auto mb-4 opacity-30" />
            <p>恭喜！所有内容都已学完</p>
          </div>
        ) : (
          filteredResources.map((res) => {
            const isCurrent = currentResourceId === res.id;
            const isLastLearned = course.lastResourceId === res.id;
            
            return (
              <div 
                key={res.id} 
                id={`res-${res.id}`}
                className={cn(
                  "group relative flex items-center justify-between p-4 bg-card border border-border rounded-2xl transition-all",
                  isCurrent ? "border-primary/50 shadow-lg shadow-primary/5 bg-primary/5" : "hover:border-primary/20"
                )}
              >
                <div 
                  className="flex-1 min-w-0 pr-4 cursor-pointer"
                  onClick={() => router.push(`/episode/${res.id}?courseId=${course.id}&sid=${subscription.id}`)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={cn(
                      "font-bold truncate group-hover:text-primary transition-colors",
                      res.isLearned && !isCurrent ? "text-muted-foreground/60" : "text-foreground",
                      isCurrent && "text-primary"
                    )}>
                      {res.title}
                    </h3>
                    {isLastLearned && (
                      <span className="shrink-0 text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-bold">
                        上次学到
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {res.isLearned ? (
                      <div className="flex items-center gap-1 text-green-500/70">
                        <CheckCircle size={12} />
                        <span>已学完</span>
                      </div>
                    ) : (
                      <span>未学习</span>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => handlePlay(res)}
                  className={cn(
                    "shrink-0 w-9 h-9 flex items-center justify-center rounded-full transition-all",
                    isCurrent && isPlaying 
                      ? "bg-primary text-primary-foreground animate-pulse" 
                      : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                  )}
                >
                  {isCurrent && isPlaying ? (
                     <div className="flex gap-0.5 items-end h-3.5">
                        <div className="w-0.5 bg-current animate-[height-grow_0.6s_ease-in-out_infinite]" style={{height: '60%'}} />
                        <div className="w-0.5 bg-current animate-[height-grow_0.8s_ease-in-out_infinite]" style={{height: '100%'}} />
                        <div className="w-0.5 bg-current animate-[height-grow_0.5s_ease-in-out_infinite]" style={{height: '80%'}} />
                     </div>
                  ) : (
                    <Play size={16} fill="currentColor" />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {showScrollTip && course.lastResourceId && !showUnlearnedOnly && (
        <button 
          onClick={scrollToLast}
          className="fixed bottom-24 right-6 glass bg-primary/90 text-white p-3 rounded-full shadow-xl flex items-center gap-2 animate-in slide-in-from-right duration-300"
        >
          <Target size={18} />
          <span className="text-sm font-bold">定位到最近学习</span>
        </button>
      )}
    </div>
  );
}
