"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Headphones, CheckCircle2, Settings2, Plus, Minus } from "lucide-react";
import { useStore } from "@/store/useStore";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

export default function EpisodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  
  const { subscription, currentResourceId, setCurrentResource, isPlaying, markAsLearned, readingSettings, setReadingSettings } = useStore();
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const course = subscription?.courses.find(c => c.id === courseId);
  const resource = course?.resources.find(r => r.id === id);
  const resourceIndex = course?.resources.findIndex(r => r.id === id) ?? -1;

  const isCurrentPlaying = currentResourceId === id && isPlaying;

  useEffect(() => {
    if (!id || !courseId || !subscription || !course || !resource) return;

    const fetchContent = async () => {
      setLoading(true);
      try {
        const lastSlash = subscription.url.lastIndexOf('/');
        const baseUrl = subscription.url.substring(0, lastSlash + 1);
        const url = `${baseUrl}${encodeURIComponent(course.title)}/${resource.content_file}`;
        
        const res = await fetch(url);
        if (res.ok) {
          const text = await res.text();
          setContent(text);
        } else {
          setContent("无法加载内容。");
        }
      } catch (_err) {
        setContent("加载失败。");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, courseId, resource?.content_file, subscription?.url, course?.title]);

  // 滚动到底部自动标记已学过
  useEffect(() => {
    const handleScroll = () => {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
        if (courseId && id && !resource?.isLearned) {
          markAsLearned(courseId, id);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [courseId, id, resource?.isLearned, markAsLearned]);

  if (!resource) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">节目不存在</p>
      </div>
    );
  }

  const handleQuickPlay = () => {
    if (courseId && course) {
       // 逻辑：把当前及后面19条加入播放列表
       const startIndex = resourceIndex;
       const playlist = course.resources.slice(startIndex, startIndex + 20);
       setCurrentResource(courseId, resource.id, playlist);
    }
  };

  const navigateTo = (dir: 'prev' | 'next') => {
    if (!course) return;
    const nextIdx = dir === 'prev' ? resourceIndex - 1 : resourceIndex + 1;
    const nextRes = course.resources[nextIdx];
    if (nextRes) {
      router.push(`/episode/${nextRes.id}?courseId=${courseId}`);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="pt-6 pb-32">
      {/* 顶部导航 */}
      <div className="fixed top-0 left-0 right-0 z-40 glass border-b border-border">
        <div className="container-tight flex items-center justify-between h-16">
          <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-xl transition-colors">
            <ArrowLeft size={24} />
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSettingsOpen(true)}
              className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-colors"
            >
              <Settings2 size={22} />
            </button>
            
            <button 
              onClick={handleQuickPlay}
              className={cn(
                "flex items-center gap-2 p-2 rounded-xl transition-all",
                isCurrentPlaying ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <Headphones size={22} className={isCurrentPlaying ? "animate-pulse" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <div className="mb-6 px-2">
            <h1 className="text-2xl font-black leading-tight mb-3">{resource.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground/80">{course?.title}</span>
                <span>•</span>
                {resource.isLearned && (
                  <div className="flex items-center gap-1 text-green-500">
                    <CheckCircle2 size={14} />
                    <span>已学过</span>
                  </div>
                )}
            </div>
        </div>

        {loading ? (
          <div className="space-y-4 px-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded w-full" style={{width: `${100 - i * 10}%`}} />
            ))}
          </div>
        ) : (
          <article 
            className="prose prose-slate dark:prose-invert max-w-none px-2 text-foreground/90 selection:bg-primary/20"
            style={{ 
              fontSize: `${readingSettings.fontSize}px`, 
              lineHeight: readingSettings.lineHeight 
            }}
          >
            <ReactMarkdown
              components={{
                h1: () => null,
                h2: ({...props}) => <h2 className="text-2xl font-bold mt-10 mb-5 text-foreground flex items-center gap-3 before:content-[''] before:w-1.5 before:h-7 before:bg-primary before:rounded-full" {...props} />,
                h3: ({...props}) => <h3 className="text-xl font-bold mt-8 mb-4 text-foreground/90" {...props} />,
                p: ({...props}) => <p className="mb-6 last:mb-0 text-foreground/80" {...props} />,
                ul: ({...props}) => <ul className="list-disc list-inside mb-6 space-y-2 pl-2 text-foreground/80" {...props} />,
                ol: ({...props}) => <ol className="list-decimal list-inside mb-6 space-y-2 pl-2 text-foreground/80" {...props} />,
                li: ({...props}) => <li className="marker:text-primary marker:font-bold" {...props} />,
                blockquote: ({...props}) => (
                  <blockquote className="border-l-4 border-primary/30 bg-primary/5 px-6 py-4 my-8 rounded-r-2xl italic text-foreground/70 quote-icon" {...props} />
                ),
                img: ({...props}) => (
                  <img className="rounded-3xl shadow-lg my-8 mx-auto border border-border/50" {...props} />
                ),
                hr: () => <hr className="my-10 border-t-2 border-border/50 w-1/4 mx-auto" />,
                a: ({...props}) => <a className="text-primary underline underline-offset-4 font-medium hover:opacity-80 transition-opacity" {...props} />,
                strong: ({...props}) => <strong className="text-foreground font-black bg-primary/10 px-1 rounded-sm" {...props} />,
                code: ({...props}) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        )}

        {/* 底部导航 */}
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-4 pb-4 px-2">
          {resourceIndex > 0 && (
            <button 
              onClick={() => navigateTo('prev')}
              className="w-full flex items-center text-left py-2 group hover:opacity-80 transition-opacity"
            >
              <span className="text-sm shrink-0 mr-2">上一篇:</span>
              <span className="font-bold text-sm line-clamp-1 flex-1 text-primary">
                {course?.resources[resourceIndex - 1]?.title}
              </span>
            </button>
          )}

          {resourceIndex < (course?.resources.length ?? 0) - 1 && (
            <button 
              onClick={() => navigateTo('next')}
              className="w-full flex items-center text-left py-2 group hover:opacity-80 transition-opacity"
            >
              <span className="text-sm shrink-0 mr-2">下一篇:</span>
              <span className="font-bold text-sm line-clamp-1 flex-1 text-primary">
                {course?.resources[resourceIndex + 1]?.title}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 阅读设置抽屉 */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setSettingsOpen(false)}
          />
          <div className="relative bg-card rounded-t-3xl shadow-2xl flex flex-col animate-slide-up w-full max-w-lg mx-auto p-6">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-1.5 bg-muted rounded-full" />
            </div>
            
            <h3 className="text-lg font-bold mb-6 text-center">阅读设置</h3>
            
            <div className="space-y-8 mb-8">
              {/* 字体大小 */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">文字大小</span>
                <div className="flex items-center gap-6 bg-muted p-1 rounded-2xl">
                  <button 
                    onClick={() => setReadingSettings({ ...readingSettings, fontSize: Math.max(12, readingSettings.fontSize - 1) })}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-card shadow-sm active:scale-90 transition-all"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="text-lg font-bold w-6 text-center tabular-nums">{readingSettings.fontSize}</span>
                  <button 
                    onClick={() => setReadingSettings({ ...readingSettings, fontSize: Math.min(30, readingSettings.fontSize + 1) })}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-card shadow-sm active:scale-90 transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {/* 行高 */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">行间距</span>
                <div className="flex items-center gap-6 bg-muted p-1 rounded-2xl">
                  <button 
                    onClick={() => setReadingSettings({ ...readingSettings, lineHeight: Math.max(1.2, readingSettings.lineHeight - 0.1) })}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-card shadow-sm active:scale-90 transition-all"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="text-lg font-bold w-12 text-center tabular-nums">{readingSettings.lineHeight.toFixed(1)}</span>
                  <button 
                    onClick={() => setReadingSettings({ ...readingSettings, lineHeight: Math.min(2.5, readingSettings.lineHeight + 0.1) })}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-card shadow-sm active:scale-90 transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setSettingsOpen(false)}
              className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all"
            >
              完成设置
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
