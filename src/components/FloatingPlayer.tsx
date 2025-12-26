"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Play, Pause, X, List,  
  Loader2, FileText
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";
import { DEFAULT_COVER } from "@/lib/assets";

export function FloatingPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    playlist, currentResourceId, currentCourseId,
    isPlaying, setIsPlaying, 
    playbackRate, setPlaybackRate,
    currentTime, setCurrentTime,
    duration, setDuration,
    isLoading, setIsLoading,
    removeFromPlaylist, clearPlaylist,
    markAsLearned, updateProgress,
    setCurrentResource,
    subscription
  } = useStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSavedTimeRef = useRef<number>(0);
  const lastUrlRef = useRef<string>("");
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const currentResource = playlist.find(p => p.id === currentResourceId);
  const course = subscription?.courses.find(c => c.id === currentCourseId);
  
  // Decide bottom position based on whether Nav is visible
  const hasNav = pathname === "/" || pathname === "/settings";

  // ... (getAudioUrl and other callbacks remain same, skipping repeat code for brevity implies using existing, but I must provide full functional replacement for the modified block or context. 
  // Since I am providing a large chunk replacement, I'll include the necessary logic.)

  const getAudioUrl = useCallback(() => {
    if (!currentResource || !subscription || !course) return "";
    const lastSlash = subscription.url.lastIndexOf('/');
    const baseUrl = subscription.url.substring(0, lastSlash + 1);
    const fullUrl = `${baseUrl}${encodeURIComponent(course.title)}/${currentResource.audio_file}`;
    return fullUrl;
  }, [currentResource, subscription, course]);

  const skip = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  }, []);

  const playPrev = useCallback(() => {
    const idx = playlist.findIndex(p => p.id === currentResourceId);
    if (idx > 0 && currentCourseId) {
      setCurrentResource(currentCourseId, playlist[idx - 1].id, playlist);
    }
  }, [playlist, currentResourceId, currentCourseId, setCurrentResource]);

  const playNext = useCallback(() => {
    const idx = playlist.findIndex(p => p.id === currentResourceId);
    if (idx < playlist.length - 1 && currentCourseId) {
      setCurrentResource(currentCourseId, playlist[idx + 1].id, playlist);
    }
  }, [playlist, currentResourceId, currentCourseId, setCurrentResource]);

  const togglePlay = useCallback(() => setIsPlaying(!isPlaying), [isPlaying, setIsPlaying]);

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      const currentIntTime = Math.floor(audio.currentTime);
      if (
        currentResourceId && currentCourseId && 
        currentIntTime > 0 && currentIntTime % 5 === 0 &&
        currentIntTime !== lastSavedTimeRef.current
      ) {
        updateProgress(currentCourseId, currentResourceId, audio.currentTime);
        lastSavedTimeRef.current = currentIntTime;
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      if (currentResource?.currentTime) audio.currentTime = currentResource.currentTime;
      // 重新应用倍速设置
      audio.playbackRate = playbackRate;
    };

    const handleEndedByAudio = () => {
      if (currentCourseId && currentResourceId) markAsLearned(currentCourseId, currentResourceId);
      playNext();
    };

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);
    const handleError = () => { setIsLoading(false); setIsPlaying(false); };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEndedByAudio);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEndedByAudio);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("error", handleError);
    };
  }, [currentResourceId, currentCourseId, currentResource?.currentTime, markAsLearned, playNext, setCurrentTime, setDuration, setIsLoading, setIsPlaying, updateProgress, playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const url = getAudioUrl();
    if (lastUrlRef.current !== url && url) {
      lastUrlRef.current = url;
      audio.src = url;
      audio.load();
      setIsLoading(true);
    }

    if (isPlaying) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
    
    audio.playbackRate = playbackRate;
    
    
    if (typeof window !== 'undefined' && 'mediaSession' in navigator && currentResource) {
      // 默认使用生成的精美封面
      let artwork: { src: string; sizes?: string; type?: string }[] = [
        { src: DEFAULT_COVER, sizes: '512x512', type: 'image/svg+xml' }
      ];

      if (course?.cover && subscription?.url) {
        try {
          let coverUrl = course.cover;
          if (!coverUrl.startsWith("http")) {
            const lastSlash = subscription.url.lastIndexOf('/');
            const baseUrl = subscription.url.substring(0, lastSlash + 1);
            coverUrl = new URL(coverUrl, baseUrl).href; 
          }
          // 如果成功解析出真实封面，则覆盖默认封面
          artwork = [{ src: coverUrl, sizes: '512x512', type: 'image/jpeg' }];
        } catch (e) {
          console.error("Failed to parse cover url", e);
        }
      }

      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentResource.title,
        artist: course?.title || "耳读",
        album: course?.title || "耳读",
        artwork,
      });

      // 关键：同步播放状态
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('seekbackward', () => skip(-15));
      navigator.mediaSession.setActionHandler('seekforward', () => skip(15));
      navigator.mediaSession.setActionHandler('previoustrack', playPrev);
      navigator.mediaSession.setActionHandler('nexttrack', playNext);
    }
  }, [isPlaying, currentResourceId, playbackRate, getAudioUrl, course?.title, course?.cover, subscription?.url, currentResource, playNext, playPrev, setIsPlaying, setIsLoading, skip]);

  // 专门处理倍速变化的 useEffect
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = playbackRate;
    }
  }, [playbackRate]);



  const handleSeek = (e: React.MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? (e as TouchEvent).changedTouches[0]?.clientX : (e as MouseEvent).clientX;
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = percent * duration;
    
    if (audioRef.current) audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      handleSeek(moveEvent);
    };
    
    const handleEnd = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('touchend', handleEnd);
  };

  const handleRateChange = () => {
    const rates = [1, 1.25, 1.5, 1.75, 2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIdx]);
  };

  if (playlist.length === 0) return null;

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <div 
        className={cn(
          "fixed left-0 right-0 z-40 transition-all duration-300 ease-in-out",
          hasNav ? "bottom-[calc(86px+env(safe-area-inset-bottom))]" : "bottom-[calc(1rem+env(safe-area-inset-bottom))]"
        )}
      >
        <div className="container-tight relative">
          <div className="bg-card shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-border/50 rounded-2xl overflow-hidden backdrop-blur-md">
            <div className="flex items-center p-3 gap-3">
              {/* Course Title / Current Info */}
              <div 
                className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer"
                onClick={() => setDrawerOpen(true)}
              >
                <h4 className="font-bold text-sm truncate pr-2">{currentResource?.title}</h4>
                <p className="text-[10px] text-muted-foreground truncate">{course?.title}</p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1">
                 {/* Play/Pause */}
                <button 
                  onClick={togglePlay}
                  className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : isPlaying ? (
                    <Pause size={20} fill="currentColor" />
                  ) : (
                    <Play size={20} className="ml-0.5" fill="currentColor" />
                  )}
                </button>

                {/* Playback Rate */}
                <button 
                  onClick={handleRateChange}
                  className="px-2 py-1 text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  {playbackRate}x
                </button>

                {/* Playlist Toggle */}
                <button 
                  onClick={() => setDrawerOpen(true)}
                  className="p-2.5 text-muted-foreground hover:text-foreground rounded-full active:bg-muted transition-colors"
                >
                  <List size={22} />
                </button>

                 {/* Close */}
                 <button 
                  onClick={() => clearPlaylist()}
                  className="p-2.5 text-muted-foreground/50 hover:text-red-500 rounded-full active:bg-muted transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Progress Section */}
            <div className="px-3 pb-3">
              <div className="flex items-center gap-3">
                {/* Current Time */}
                <span className="text-[10px] text-muted-foreground tabular-nums text-right shrink-0">
                  {Math.floor(currentTime/60)}:{Math.floor(currentTime%60).toString().padStart(2,'0')}
                </span>
                
                {/* Progress Bar with Slider */}
                <div 
                  ref={progressBarRef}
                  className="flex-1 h-5 flex items-center cursor-pointer group"
                  onClick={handleSeek}
                >
                  <div className="relative w-full h-1 bg-muted/60 rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                    {/* Draggable Thumb */}
                    <div 
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full shadow-md cursor-grab active:cursor-grabbing transition-transform",
                        isDragging ? "scale-125" : "group-hover:scale-110"
                      )}
                      style={{ left: `calc(${progressPercent}% - 8px)` }}
                      onMouseDown={handleDragStart}
                      onTouchStart={handleDragStart}
                    />
                  </div>
                </div>
                
                {/* Total Duration */}
                <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                  {Math.floor(duration/60)}:{Math.floor(duration%60).toString().padStart(2,'0')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Drawer Layer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="relative bg-card rounded-t-3xl shadow-2xl max-h-[75vh] flex flex-col animate-slide-up w-full max-w-lg mx-auto">
             {/* Header */}
             <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between shrink-0">
                <div>
                   <h3 className="font-bold text-lg">播放列表</h3>
                   <p className="text-xs text-muted-foreground mt-0.5">共 {playlist.length} 首</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { clearPlaylist(); setDrawerOpen(false); }}
                      className="px-3 py-1.5 bg-muted rounded-full text-xs hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      清空
                    </button>
                </div>
             </div>

             {/* List */}
             <div className="overflow-y-auto p-2 min-h-0">
                {playlist.map((item, idx) => (
                  <div 
                    key={`${item.id}-${idx}`}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-xl mb-1 transition-all",
                      item.id === currentResourceId 
                        ? "bg-primary/5 text-primary" 
                        : "hover:bg-muted/50 text-foreground/80"
                    )}
                  >
                    <div 
                      className="flex-1 min-w-0 mr-3 cursor-pointer flex items-center gap-3"
                      onClick={() => {
                        if (currentCourseId) {
                          setCurrentResource(currentCourseId, item.id, playlist);
                        }
                      }}
                    >
                      {item.id === currentResourceId ? (
                         <div className="relative w-4 h-4 flex items-center justify-center">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                            <div className="w-1.5 h-1.5 bg-primary rounded-full relative z-10" />
                         </div>
                      ) : (
                         <span className="text-xs text-muted-foreground w-4 text-center">{idx + 1}</span>
                      )}
                      
                      <p className={cn(
                        "text-sm truncate", 
                        item.id === currentResourceId ? "font-bold" : "font-medium"
                      )}>
                        {item.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (currentCourseId) {
                            router.push(`/episode/${item.id}?courseId=${currentCourseId}`);
                            setDrawerOpen(false);
                          }
                        }}
                        className="p-2 text-muted-foreground/40 hover:text-primary transition-colors"
                        title="查看文章"
                      >
                        <FileText size={16} />
                      </button>

                      <button 
                        onClick={(e) => { e.stopPropagation(); removeFromPlaylist(item.id); }}
                        className="p-2 text-muted-foreground/30 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
             </div>

             {/* Close Button */}
             <div className="p-4 border-t border-border/50 shrink-0">
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="w-full py-3 rounded-2xl bg-muted/50 hover:bg-muted font-bold text-sm transition-colors"
                >
                  关闭
                </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
