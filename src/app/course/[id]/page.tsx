"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, CheckCircle, Target } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { CourseResource } from "@/types";

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { subscription, currentResourceId, setCurrentResource, isPlaying } = useStore();
  const listRef = useRef<HTMLDivElement>(null);
  const [showScrollTip, setShowScrollTip] = useState(false);

  const course = subscription?.courses.find(c => c.id === id);

  useEffect(() => {
    // 检查最近学习的是否在视口外
    if (course?.lastResourceId) {
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
  }, [course?.lastResourceId]);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">课程不存在</p>
        <button onClick={() => router.back()} className="mt-4 text-primary">返回首页</button>
      </div>
    );
  }

  const handlePlay = (resource: CourseResource, index: number) => {
    // 逻辑：点击播放按钮，把当前及后面19条加入播放列表
    const startIndex = index;
    const count = 20;
    const playlist = course.resources.slice(startIndex, startIndex + count);
    setCurrentResource(course.id, resource.id, playlist);
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
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-40 glass border-b border-border">
        <div className="container-tight flex items-center h-16 gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-xl transition-colors shrink-0"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold truncate pr-4">{course.title}</h1>
        </div>
      </div>

      <div className="space-y-3" ref={listRef}>
        {course.resources.map((res, index) => {
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
                onClick={() => router.push(`/episode/${res.id}?courseId=${course.id}`)}
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
                onClick={() => handlePlay(res, index)}
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
        })}
      </div>

      {showScrollTip && course.lastResourceId && (
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
