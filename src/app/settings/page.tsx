"use client";

import { useEffect, useState } from "react";
import {
  ChevronRight,
  Database,
  Globe,
  Trash2,
  Clock,
  Code2,
  MonitorCheck,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

function DevDebugInfo() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const checks = [
    { name: "IndexedDB (Dexie)", supported: "indexedDB" in window },
    {
      name: "Web Audio API",
      supported: "AudioContext" in window || "webkitAudioContext" in window,
    },
    { name: "Media Session API", supported: "mediaSession" in navigator },
    { name: "LocalStorage", supported: "localStorage" in window },
  ];

  return (
    <section className="bg-card border border-amber-500/20 rounded-2xl overflow-hidden mt-8">
      <div className="p-4 bg-amber-500/5 border-b border-amber-500/10 flex items-center gap-2 text-amber-600 dark:text-amber-500">
        <Code2 size={18} />
        <span className="font-semibold text-sm">开发模式调试信息</span>
      </div>
      <div className="p-4 space-y-3">
        {checks.map((check) => (
          <div
            key={check.name}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-muted-foreground">{check.name}</span>
            <div
              className={`flex items-center gap-1.5 ${
                check.supported
                  ? "text-green-600 dark:text-green-500"
                  : "text-red-500"
              }`}
            >
              <MonitorCheck size={14} />
              <span>{check.supported ? "兼容" : "不兼容"}</span>
            </div>
          </div>
        ))}
        <div className="pt-3 border-t border-border mt-3">
          <div className="text-xs text-muted-foreground font-mono break-all bg-muted p-2 rounded">
            {window.navigator.userAgent}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function SettingsPage() {
  const { subscription, clearSubscription, clearPlaylist } = useStore();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClearCache = () => {
    if (confirm("确定要清除所有缓存吗？这将清除订阅数据和播放进度。")) {
      clearSubscription();
      clearPlaylist();
      localStorage.removeItem("ear-read-storage");
      window.location.reload();
    }
  };

  const lastUpdateStr = subscription?.lastUpdatedAt
    ? formatDistanceToNow(new Date(subscription.lastUpdatedAt), {
        addSuffix: true,
        locale: zhCN,
      })
    : "从未刷新";

  return (
    <div className="pt-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">设置</h1>
        <p className="text-muted-foreground">管理您的订阅与应用偏好</p>
      </div>

      <div className="space-y-4">
        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 transition-transform">
                <Globe size={24} />
              </div>
              <div className="text-left">
                <div className="font-semibold">订阅管理</div>
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Clock size={12} />
                  上次刷新: {lastUpdateStr}
                </div>
              </div>
            </div>
            <ChevronRight className="text-muted-foreground" size={20} />
          </button>
        </section>

        <section className="bg-card border border-border rounded-2xl overflow-hidden">
          <button
            onClick={handleClearCache}
            className="w-full flex items-center justify-between p-4 hover:bg-red-500/5 transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-500/10 text-red-500 rounded-xl group-hover:scale-110 transition-transform">
                <Trash2 size={24} />
              </div>
              <div className="text-left">
                <div className="font-semibold">清除缓存</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  重置应用状态并清空所有数据
                </div>
              </div>
            </div>
          </button>
        </section>

        {process.env.NODE_ENV === "development" && <DevDebugInfo />}

        <div className="p-4 text-center">
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Database size={12} />
            当前版本: 1.0.0 (Web)
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
