"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/store/useStore";
import { BookMarked, PlusCircle } from "lucide-react";
import { useMount } from "ahooks";

export default function HomePage() {
  const { subscriptions, getAllCourses } = useStore();
  const [mounted, setMounted] = useState(false);
  
  useMount(() => {
    setMounted(true);
  });
  
  // 获取所有课程（带订阅源信息）
  const allCourses = getAllCourses();

  if (!mounted) {
    return <div className="pt-4 min-h-[70vh]" />; // 初始占位
  }

  if (allCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
        <div className="w-48 h-48 bg-muted/30 rounded-full flex items-center justify-center mb-8 animate-float">
          <BookMarked size={80} className="text-muted-foreground/40" />
        </div>
        <h2 className="text-2xl font-bold mb-3">开启您的阅读之旅</h2>
        <p className="text-muted-foreground mb-8 max-w-xs">
          您还没有订阅任何课程。请前往设置页面添加您的第一个订阅地址。
        </p>
        <Link 
          href="/settings"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <PlusCircle size={20} />
          <span>去订阅</span>
        </Link>
      </div>
    );
  }

  // 如果只有一个订阅源，不显示订阅源标签
  const showSubscriptionLabel = subscriptions.length > 1;

  return (
    <div className="pt-4 pb-50 space-y-5">
      <div>
        <h1 className="text-2xl font-bold mb-1">我的课程</h1>
        <p className="text-sm text-muted-foreground">
          欢迎回来，继续您的学习规划
          {subscriptions.length > 1 && (
            <span className="ml-2">· {subscriptions.length} 个订阅源</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {allCourses.map(({ subscriptionId, subscriptionName, course }, index) => (
          <Link 
            key={`${subscriptionId}-${course.id}-${index}`}
            href={`/course/${course.id}?sid=${subscriptionId}`}
            className="group relative flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base leading-tight mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                {course.title}
              </h3>
              <div className="text-sm text-muted-foreground flex items-center gap-3 flex-wrap">
                <span>{course.resources?.length || 0} 个节目</span>
                {course.lastResourceId && (
                   <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    正在学习
                   </span>
                )}
                {showSubscriptionLabel && (
                  <span className="bg-muted px-2 py-0.5 rounded text-[10px]">
                    {subscriptionName}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
