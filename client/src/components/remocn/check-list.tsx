import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type CheckListItem =
  | string
  | {
      text: string;
      checked?: boolean;
      tag?: string;
      priority?: string;
      due?: string;
      assignee?: string;
      assigneeName?: string;
    };

export interface CheckListProps {
  items: CheckListItem[];
  width?: number | string;
  fontSize?: number | string;
  itemGap?: number;
  closeGap?: number;
  perStep?: number;
  strokeWidth?: number;
  color?: string;
  tickColor?: string;
  step?: number;
  className?: string;
  interactive?: boolean;
  onItemToggle?: (index: number, checked: boolean) => void;
}

export function CheckList({
  items,
  width = "100%",
  fontSize,
  itemGap = 16,
  closeGap = 8,
  perStep = 1.6,
  strokeWidth = 2.5,
  color,
  tickColor = "#10b981",
  step = 3,
  className,
  interactive = true,
  onItemToggle,
}: CheckListProps) {
  // Normalize items to structured objects
  const [internalItems, setInternalItems] = useState(() =>
    items.map((item, idx) => {
      if (typeof item === "string") {
        return { text: item, checked: idx < step };
      }
      return {
        ...item,
        checked: item.checked !== undefined ? item.checked : idx < step,
      };
    })
  );

  useEffect(() => {
    setInternalItems(
      items.map((item, idx) => {
        if (typeof item === "string") {
          return { text: item, checked: idx < step };
        }
        return {
          ...item,
          checked: item.checked !== undefined ? item.checked : idx < step,
        };
      })
    );
  }, [items, step]);

  const handleToggle = (index: number) => {
    if (!interactive) return;
    setInternalItems((prev) => {
      const next = [...prev];
      const newChecked = !next[index].checked;
      next[index] = { ...next[index], checked: newChecked };
      if (onItemToggle) {
        onItemToggle(index, newChecked);
      }
      return next;
    });
  };

  return (
    <div
      style={{
        maxWidth: typeof width === "number" ? `${width}px` : width,
        gap: `${itemGap}px`,
      }}
      className={cn("flex flex-col w-full text-left font-sans", className)}
    >
      {internalItems.map((item, index) => {
        const isChecked = item.checked;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.08 * (perStep || 1) }}
            onClick={() => handleToggle(index)}
            style={{
              fontSize: typeof fontSize === "number" ? `${fontSize}px` : fontSize,
              marginBottom: `${closeGap}px`,
            }}
            className={cn(
              "group relative flex items-start gap-4 p-4 rounded-xl border transition-all select-none",
              interactive ? "cursor-pointer" : "cursor-default",
              "border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 hover:border-black dark:hover:border-neutral-600 shadow-sm"
            )}
          >
            {/* Animated SVG Checkbox Box */}
            <div className="relative flex-shrink-0 mt-0.5">
              <div
                className={cn(
                  "w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-300",
                  isChecked
                    ? "bg-black dark:bg-white border-black dark:border-white"
                    : "border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 group-hover:border-black dark:group-hover:border-white"
                )}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <motion.path
                    d="M4 12.5L9.5 18L20 6"
                    stroke={isChecked ? (tickColor === "#10b981" || !tickColor ? (item.checked ? "#ffffff" : "currentColor") : tickColor) : "transparent"}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: isChecked ? 1 : 0 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                  />
                </svg>
              </div>
            </div>

            {/* Text & Metadata */}
            <div className="flex-1 min-w-0">
              <div
                style={{ color: color }}
                className={cn(
                  "font-semibold leading-snug transition-all duration-300",
                  isChecked
                    ? "text-neutral-500 dark:text-neutral-400 line-through"
                    : "text-neutral-950 dark:text-white"
                )}
              >
                {item.text}
              </div>

              {/* Optional sub-tags if present */}
              {(item.tag || item.due || item.priority) && (
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                  {item.tag && (
                    <span className="font-bold text-neutral-600 dark:text-neutral-400">
                      {item.tag}
                    </span>
                  )}
                  {item.due && (
                    <>
                      <span className="text-neutral-300 dark:text-neutral-700">•</span>
                      <span className="font-medium text-neutral-500 dark:text-neutral-400">
                        {item.due}
                      </span>
                    </>
                  )}
                  {item.priority && (
                    <span className="ml-auto font-bold px-2 py-0.5 rounded text-[10px] border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-200">
                      {item.priority}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Assignee Avatar if provided */}
            {item.assignee && (
              <img
                src={item.assignee}
                alt={item.assigneeName || "Assignee"}
                title={item.assigneeName}
                className="w-7 h-7 rounded-full object-cover border border-neutral-300 dark:border-neutral-700 flex-shrink-0"
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

export default CheckList;
