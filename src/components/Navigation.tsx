"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const pathname = usePathname();
  
  // Only show navigation on Home and Settings
  const isVisible = pathname === "/" || pathname === "/settings";

  if (!isVisible) return null;

  const navItems = [
    {
      label: "课程列表",
      href: "/",
      icon: BookOpen,
    },
    {
      label: "设置",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)] bg-background/80 backdrop-blur-md border-t border-border">
      <div className="container-tight flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 transition-colors p-2",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={26} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={cn("text-[10px] font-medium", isActive ? "font-bold" : "")}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
