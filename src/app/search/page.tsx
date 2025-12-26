"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, BookOpen, FileText } from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const { subscriptions } = useStore();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 自动聚焦输入框
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 搜索结果
  const results = useMemo(() => {
    if (!query.trim()) return { courses: [], resources: [] };

    const q = query.toLowerCase().trim();
    const courses: { subscriptionId: string; subscriptionName: string; id: string; title: string; resourceCount: number }[] = [];
    const resources: { subscriptionId: string; courseId: string; courseTitle: string; id: string; title: string }[] = [];

    subscriptions.forEach(sub => {
      sub.courses.forEach(course => {
        const courseTitle = course.title || "";
        // 搜索课程标题
        if (courseTitle.toLowerCase().includes(q)) {
          courses.push({
            subscriptionId: sub.id,
            subscriptionName: sub.name,
            id: course.id,
            title: courseTitle,
            resourceCount: course.resources?.length || 0
          });
        }

        // 搜索资源标题
        course.resources?.forEach(resource => {
          const resourceTitle = resource.title || "";
          if (resourceTitle.toLowerCase().includes(q)) {
            resources.push({
              subscriptionId: sub.id,
              courseId: course.id,
              courseTitle: courseTitle,
              id: resource.id,
              title: resourceTitle
            });
          }
        });
      });
    });

    return { courses, resources };
  }, [query, subscriptions]);

  const hasResults = results.courses.length > 0 || results.resources.length > 0;
  const totalResults = results.courses.length + results.resources.length;

  // 高亮匹配文字
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-primary/30 text-primary px-0.5 rounded">{part}</mark> : part
    );
  };

  return (
    <div className="pt-20 pb-32 min-h-screen">
      <Header title="搜索" onBack={() => router.push('/')} />

      {/* Search Input */}
      <div className={cn(
        "relative flex items-center bg-muted/50 border rounded-2xl transition-all",
        isFocused ? "border-primary ring-2 ring-primary/20" : "border-border"
      )}>
        <Search size={20} className="absolute left-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="搜索课程或内容..."
          className="w-full bg-transparent pl-12 pr-10 py-3.5 focus:outline-none"
        />
        {query && (
          <button 
            onClick={() => setQuery("")}
            className="absolute right-3 p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X size={16} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Results */}
      <div className="mt-6">
        {query.trim() === "" ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search size={48} className="mx-auto mb-4 opacity-30" />
            <p>输入关键词开始搜索</p>
            <p className="text-sm mt-1">支持搜索课程名称和讲次标题</p>
          </div>
        ) : !hasResults ? (
          <div className="text-center py-16 text-muted-foreground">
            <p>没有找到相关结果</p>
            <p className="text-sm mt-1">尝试使用其他关键词</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              找到 <span className="text-foreground font-medium">{totalResults}</span> 个结果
            </p>

            {/* 课程结果 */}
            {results.courses.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <BookOpen size={14} />
                  课程 ({results.courses.length})
                </h3>
                <div className="space-y-2">
                  {results.courses.map((course) => (
                    <Link
                      key={`${course.subscriptionId}-${course.id}`}
                      href={`/course/${course.id}?sid=${course.subscriptionId}`}
                      className="block p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:shadow-md transition-all"
                    >
                      <div className="font-semibold mb-1">
                        {highlightMatch(course.title, query)}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className="bg-muted px-2 py-0.5 rounded">{course.subscriptionName}</span>
                        <span>{course.resourceCount} 个节目</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 资源结果 */}
            {results.resources.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <FileText size={14} />
                  节目 ({results.resources.length})
                </h3>
                <div className="space-y-2">
                  {results.resources.slice(0, 20).map((resource) => (
                    <Link
                      key={`${resource.subscriptionId}-${resource.courseId}-${resource.id}`}
                      href={`/episode/${resource.id}?courseId=${resource.courseId}&sid=${resource.subscriptionId}`}
                      className="block p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:shadow-md transition-all"
                    >
                      <div className="font-medium mb-1 text-sm">
                        {highlightMatch(resource.title, query)}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        来自《{resource.courseTitle}》
                      </div>
                    </Link>
                  ))}
                  {results.resources.length > 20 && (
                    <p className="text-center text-sm text-muted-foreground py-2">
                      还有 {results.resources.length - 20} 个结果...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
