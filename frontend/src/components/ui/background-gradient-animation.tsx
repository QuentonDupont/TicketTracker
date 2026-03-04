"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const BackgroundGradientAnimation = ({
  children,
  className,
  containerClassName,
  animate = true,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  animate?: boolean;
}) => {
  return (
    <div className={cn("relative h-full w-full", containerClassName)}>
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-blue-400/20",
            animate && "animate-pulse",
            className
          )}
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/10 to-transparent",
            animate && "animate-pulse",
            className
          )}
          style={{
            animationDelay: "1s",
            animationDuration: "4s",
          }}
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-tl from-blue-600/10 via-transparent to-blue-400/10",
            animate && "animate-pulse",
            className
          )}
          style={{
            animationDelay: "2s",
            animationDuration: "5s",
          }}
        />
      </div>
      {children}
    </div>
  );
};

