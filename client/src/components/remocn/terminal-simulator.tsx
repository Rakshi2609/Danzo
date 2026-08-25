import React, { useState, useEffect } from "react";
import { Check, Copy, Terminal as TerminalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TerminalLineType = "command" | "log" | "success" | "error" | "info" | "warning" | "output";

export interface TerminalLine {
  text: string;
  type?: TerminalLineType;
  delay?: number;
  pause?: number;
}

export interface TerminalSimulatorProps {
  lines?: TerminalLine[];
  prompt?: string;
  title?: string;
  background?: string;
  chromeColor?: string;
  fontSize?: number;
  className?: string;
}

const DEFAULT_LINES: TerminalLine[] = [
  { text: "npm run build", type: "command" },
  { text: "Compiled successfully", type: "success", delay: 14 },
];

export function TerminalSimulator({
  lines = DEFAULT_LINES,
  prompt = "$",
  title = "danzo-workspace ~/build",
  className,
}: TerminalSimulatorProps) {
  const [copied, setCopied] = useState(false);
  const [visibleLinesCount, setVisibleLinesCount] = useState<number>(0);
  const [charIndex, setCharIndex] = useState<number>(0);

  useEffect(() => {
    setVisibleLinesCount(0);
    setCharIndex(0);

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    lines.forEach((line, idx) => {
      const lineDelay = (line.delay ?? idx * 12) * 50;
      const t = setTimeout(() => {
        setVisibleLinesCount((prev) => Math.max(prev, idx + 1));
      }, lineDelay);
      timeouts.push(t);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [lines]);

  const copyToClipboard = () => {
    const textToCopy = lines
      .map((l) => (l.type === "command" ? `${prompt} ${l.text}` : l.text))
      .join("\n");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border shadow-2xl overflow-hidden font-mono text-xs sm:text-sm text-left transition-all duration-300",
        "bg-neutral-950 text-neutral-100 border-neutral-800 shadow-black/50",
        "dark:bg-black dark:border-neutral-800 dark:text-neutral-100",
        className
      )}
    >
      {/* Terminal Window Header */}
      <div className="h-10 px-4 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 border border-red-600/40"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-600/40"></span>
            <span className="w-3 h-3 rounded-full bg-green-500/80 border border-green-600/40"></span>
          </div>
          <div className="h-3.5 w-px bg-neutral-800 mx-1.5"></div>
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-semibold">
            <TerminalIcon className="w-3.5 h-3.5 text-neutral-400" />
            <span className="truncate max-w-[200px] sm:max-w-xs">{title}</span>
          </div>
        </div>

        {/* Copy command button */}
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Copy output"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal Body */}
      <div className="p-4 sm:p-6 space-y-2 min-h-[160px] max-h-[360px] overflow-y-auto bg-neutral-950">
        {lines.slice(0, visibleLinesCount).map((line, idx) => {
          const isCommand = line.type === "command";
          const isSuccess = line.type === "success";
          const isError = line.type === "error";

          return (
            <div key={idx} className="flex items-start gap-2.5 leading-relaxed font-mono">
              {isCommand ? (
                <span className="text-emerald-400 select-none font-bold">{prompt}</span>
              ) : (
                <span className="text-neutral-600 select-none">›</span>
              )}
              <span
                className={cn(
                  "flex-1 tracking-tight",
                  isCommand && "text-white font-semibold",
                  isSuccess && "text-emerald-400 font-bold",
                  isError && "text-rose-400 font-bold",
                  !isCommand && !isSuccess && !isError && "text-neutral-300"
                )}
              >
                {line.text}
              </span>
            </div>
          );
        })}

        {/* Live typing active cursor */}
        <div className="flex items-center gap-2.5 pt-1">
          <span className="text-emerald-400 select-none font-bold">{prompt}</span>
          <span className="inline-block w-2 h-4 bg-emerald-400 animate-pulse"></span>
        </div>
      </div>
    </div>
  );
}

export default TerminalSimulator;
