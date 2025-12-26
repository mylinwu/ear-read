"use client";

import Link from "next/link";
import { useStore } from "@/store/useStore";
import { BookMarked, PlusCircle } from "lucide-react";

export default function HomePage() {
  const { subscription } = useStore();
  // 过滤掉0个节目的课程
  const courses = (subscription?.courses || []).filter(c => c.resources && c.resources.length > 0);

  if (courses.length === 0) {
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

  return (
    <div className="pt-4 pb-50 space-y-5">
      <div>
        <h1 className="text-2xl font-bold mb-1">我的课程</h1>
        <p className="text-sm text-muted-foreground">欢迎回来，继续您的学习规划</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {courses.map((course, index) => (
          <Link 
            key={course.id || `course-${index}`}
            href={`/course/${course.id}`}
            className="group relative flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all"
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base leading-tight mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                {course.title}
              </h3>
              <div className="text-sm text-muted-foreground flex items-center gap-3">
                <span>{course.resources?.length || 0} 个节目</span>
                {course.lastResourceId && (
                   <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                    正在学习
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
