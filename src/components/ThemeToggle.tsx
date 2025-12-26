"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useMount } from "ahooks";
import { useStore } from "@/store/useStore";
import { ThemeMode } from "@/types";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { themeMode, setThemeMode } = useStore();
  const [mounted, setMounted] = useState(false);

  // 使用 ahooks 的 useMount 确保只在客户端挂载后执行
  useMount(() => {
    setMounted(true);
  });

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    if (themeMode === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    } else {
      root.classList.toggle('dark', themeMode === 'dark');
    }
  }, [themeMode, mounted]);

  // 监听系统主题变化
  useEffect(() => {
    if (!mounted || themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, mounted]);

  if (!mounted) return null;

  const options: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
    { mode: 'light', icon: Sun, label: '浅色' },
    { mode: 'dark', icon: Moon, label: '深色' },
    { mode: 'system', icon: Monitor, label: '跟随系统' },
  ];

  return (
    <div className="flex items-center bg-muted/50 rounded-xl p-1">
      {options.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => setThemeMode(mode)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
            themeMode === mode
              ? "bg-card shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
          title={label}
        >
          <Icon size={16} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
