import React, { useState, useEffect } from "react";
import { Check, Copy, Terminal as TerminalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TerminalLine {
  text: string;
  type?: "command" | "success" | "error" | "info" | "warning" | "output";
  delay?: number;
}

export interface TerminalSimulatorProps {
  lines?: TerminalLine[];
  className?: string;
  title?: string;
}

export function TerminalSimulator({
  lines = [
    { text: "git clone https://github.com/danzo-app/danzo.git", type: "command" },
    { text: "cd danzo && npm install", type: "command", delay: 10 },
    { text: "npm run dev", type: "command", delay: 20 },
    { text: "✓ MongoDB & Firebase Admin connected", type: "success", delay: 30 },
    { text: "✓ Vite ready on http://localhost:5173", type: "success", delay: 40 },
  ],
  className,
  title = "bash - danzo-workspace",
}: TerminalSimulatorProps) {
  const [copied, setCopied] = useState(false);
  const [visibleLinesCount, setVisibleLinesCount] = useState<number>(0);

  useEffect(() => {
    setVisibleLinesCount(0);
    const timers: NodeJS.Timeout[] = [];

    lines.forEach((line, index) => {
      const delayMs = (line.delay ?? index * 10) * 40;
      const timer = setTimeout(() => {
        setVisibleLinesCount((prev) => Math.max(prev, index + 1));
      }, delayMs);
      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [lines]);

  const copyToClipboard = () => {
    const textToCopy = lines
      .filter((l) => l.type === "command")
      .map((l) => l.text)
      .join(" && ");
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "rounded-2xl border shadow-2xl overflow-hidden font-mono text-xs sm:text-sm text-left transition-all duration-300",
        "bg-neutral-950 text-neutral-100 border-neutral-800 shadow-black/40",
        "dark:bg-black dark:border-neutral-800 dark:text-neutral-100",
        className
      )}
    >
      {/* Terminal Title Bar */}
      <div className="h-10 px-4 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-neutral-700 hover:bg-red-500/80 transition-colors"></span>
            <span className="w-3 h-3 rounded-full bg-neutral-700 hover:bg-yellow-500/80 transition-colors"></span>
            <span className="w-3 h-3 rounded-full bg-neutral-700 hover:bg-green-500/80 transition-colors"></span>
          </div>
          <div className="h-3 w-px bg-neutral-800 mx-1"></div>
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-semibold">
            <TerminalIcon className="w-3.5 h-3.5 text-neutral-400" />
            <span>{title}</span>
          </div>
        </div>

        {/* Copy command button */}
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Copy commands"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Terminal Content */}
      <div className="p-4 sm:p-6 space-y-2 min-h-[160px] max-h-[380px] overflow-y-auto bg-neutral-950/95">
        {lines.slice(0, visibleLinesCount).map((line, idx) => {
          const isCommand = line.type === "command";
          const isSuccess = line.type === "success";
          const isError = line.type === "error";

          return (
            <div key={idx} className="flex items-start gap-2.5 leading-relaxed">
              {isCommand ? (
                <span className="text-neutral-500 select-none font-bold">$</span>
              ) : (
                <span className="text-neutral-600 select-none">›</span>
              )}
              <span
                className={cn(
                  "flex-1 font-mono tracking-tight",
                  isCommand && "text-white font-medium",
                  isSuccess && "text-emerald-400 font-semibold",
                  isError && "text-rose-400 font-semibold",
                  !isCommand && !isSuccess && !isError && "text-neutral-300"
                )}
              >
                {line.text}
              </span>
            </div>
          );
        })}

        {/* Blinking Cursor */}
        <div className="flex items-center gap-2.5 pt-1">
          <span className="text-neutral-500 select-none font-bold">$</span>
          <span className="inline-block w-2 h-4 bg-white animate-pulse"></span>
        </div>
      </div>
    </div>
  );
}

export default TerminalSimulator;
