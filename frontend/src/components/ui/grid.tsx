"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GridProps {
  className?: string;
  size?: number;
}

export const Grid = ({ className, size = 60 }: GridProps) => {
  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full bg-transparent",
        className
      )}
      style={{
        backgroundImage: `
          linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
};

