import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type CheckListItem = {
  text: string;
  checked?: boolean;
};

export interface CheckListProps {
  items: (string | CheckListItem)[];
  width?: number | string;
  fontSize?: number;
  color?: string;
  boxColor?: string;
  tickColor?: string;
  delay?: number;
  itemGap?: number;
  closeGap?: number;
  rowGap?: number;
  strokeWidth?: number;
  perStep?: number;
  weight?: number;
  seed?: string;
  step?: number;
  className?: string;
  interactive?: boolean;
}

export function CheckList({
  items,
  width = 820,
  fontSize = 20,
  color,
  boxColor,
  tickColor = "#6f7f35",
  delay = 0,
  itemGap = 14,
  closeGap = 8,
  rowGap = 12,
  strokeWidth = 2.5,
  perStep = 1.4,
  className,
  interactive = true,
}: CheckListProps) {
  const normalized = items.map((item) =>
    typeof item === "string"
      ? { text: item, checked: true }
      : { text: item.text, checked: item.checked ?? true }
  );

  const [taskList, setTaskList] = useState(normalized);

  useEffect(() => {
    setTaskList(
      items.map((item) =>
        typeof item === "string"
          ? { text: item, checked: true }
          : { text: item.text, checked: item.checked ?? true }
      )
    );
  }, [items]);

  const toggleItem = (idx: number) => {
    if (!interactive) return;
    setTaskList((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], checked: !next[idx].checked };
      return next;
    });
  };

  const boxSize = Math.round(fontSize * 0.9);

  return (
    <div
      style={{
        maxWidth: typeof width === "number" ? `${width}px` : width,
        gap: `${rowGap}px`,
      }}
      className={cn(
        "flex flex-col w-full mx-auto font-sans transition-colors duration-300",
        className
      )}
    >
      {taskList.map((item, index) => {
        const isChecked = item.checked;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.4,
              delay: (delay + index * itemGap) * 0.04 * (perStep || 1),
              ease: [0.16, 1, 0.3, 1],
            }}
            onClick={() => toggleItem(index)}
            className={cn(
              "group flex items-center gap-4 sm:gap-6 p-3.5 sm:p-5 rounded-2xl border transition-all duration-200 select-none",
              interactive ? "cursor-pointer" : "cursor-default",
              "border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/60 dark:bg-neutral-900/40 hover:bg-neutral-100/80 dark:hover:bg-neutral-900/80 hover:border-neutral-400 dark:hover:border-neutral-600"
            )}
          >
            {/* Hand-drawn style SVG Checkbox */}
            <div
              style={{ width: boxSize, height: boxSize }}
              className="relative flex-shrink-0 flex items-center justify-center"
            >
              <svg
                width={boxSize}
                height={boxSize}
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="overflow-visible"
              >
                {/* Outer Box */}
                <path
                  d="M 4 4 L 32 4 L 32 32 L 4 32 Z"
                  stroke={boxColor || (isChecked ? "currentColor" : "#888888")}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={cn(
                    "transition-colors duration-300",
                    !boxColor && "text-neutral-900 dark:text-neutral-100"
                  )}
                />

                {/* Animated Tick */}
                <motion.path
                  d="M 7 18 L 15 27 L 31 7"
                  stroke={tickColor}
                  strokeWidth={strokeWidth + 1}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={false}
                  animate={{
                    pathLength: isChecked ? 1 : 0,
                    opacity: isChecked ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeInOut",
                  }}
                />
              </svg>
            </div>

            {/* Label with Strike-through animation */}
            <div className="relative flex-1 min-w-0">
              <span
                style={{
                  fontSize: `clamp(18px, 2.5vw, ${fontSize}px)`,
                  color: color,
                }}
                className={cn(
                  "font-bold tracking-tight block leading-tight transition-all duration-300 font-sans",
                  !color &&
                    (isChecked
                      ? "text-neutral-500 dark:text-neutral-400"
                      : "text-neutral-950 dark:text-white")
                )}
              >
                {item.text}
              </span>

              {/* Hand-drawn style strike line */}
              {isChecked && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  style={{
                    backgroundColor: tickColor,
                    height: `${Math.max(2, strokeWidth - 1)}px`,
                    transformOrigin: "left center",
                  }}
                  className="absolute top-1/2 left-0 right-4 -translate-y-1/2 opacity-75 rounded-full pointer-events-none"
                />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default CheckList;
