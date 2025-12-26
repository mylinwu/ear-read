"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightContent?: ReactNode;
  className?: string;
}

export function Header({ title, onBack, rightContent, className }: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-40 glass border-b border-border", className)}>
      <div className="container-tight flex items-center justify-between h-16">
        <div className="flex items-center gap-3 overflow-hidden">
          <button 
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors shrink-0"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold truncate pr-2">{title}</h1>
        </div>
        
        {rightContent && (
          <div className="shrink-0 flex items-center gap-2">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
}
