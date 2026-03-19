'use client';
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { AgentStream } from "@/lib/office/types";
import { STATUS_COLORS } from "@/lib/office/constants";
import { useOfficeStore } from "@/lib/store/visual-office-store";

const STREAM_ICONS: Record<AgentStream, string> = {
  lifecycle: "●",
  tool: "🔧",
  assistant: "💬",
  error: "⚠",
};

const MAX_DISPLAY = 50;

export function EventTimeline() {
  const { t } = useTranslation("panels");
  const eventHistory = useOfficeStore((s) => s.eventHistory);
  const selectAgent = useOfficeStore((s) => s.selectAgent);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const prevLenRef = useRef(0);

  const displayEvents = eventHistory.slice(-MAX_DISPLAY);

  useEffect(() => {
    if (autoScroll && scrollRef.current && eventHistory.length > prevLenRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevLenRef.current = eventHistory.length;
  }, [eventHistory.length, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) {
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 30;
    setAutoScroll(atBottom);
  };

  return (
    <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
      {!autoScroll && eventHistory.length > 0 && (
        <div className="sticky top-0 z-10 flex justify-end bg-white/80 px-2 py-0.5 backdrop-blur-sm dark:bg-surface-0/80">
          <button
            onClick={() => {
              setAutoScroll(true);
              if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
              }
            }}
            className="rounded bg-status-info px-1.5 py-0.5 text-[10px] text-white"
          >
            {t("eventTimeline.newEvents")}
          </button>
        </div>
      )}
      {displayEvents.map((evt, i) => (
        <button
          key={`${evt.timestamp}-${evt.agentId}-${i}`}
          onClick={() => selectAgent(evt.agentId)}
          className="flex w-full items-start gap-1.5 border-b border-border-subtle px-3 py-1 text-left text-xs hover:bg-surface-1 dark:border-border-default dark:hover:bg-surface-2"
        >
          <span className="mt-0.5 shrink-0 text-text-tertiary">
            {new Date(evt.timestamp).toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
          <span className="shrink-0">{STREAM_ICONS[evt.stream] ?? "·"}</span>
          <span
            className="shrink-0 font-medium"
            style={{
              color: STATUS_COLORS[evt.stream === "error" ? "error" : "thinking"],
            }}
          >
            {evt.agentName}
          </span>
          <span className="min-w-0 truncate text-text-secondary dark:text-text-tertiary">{evt.summary}</span>
        </button>
      ))}
      {displayEvents.length === 0 && (
        <div className="py-3 text-center text-xs text-text-tertiary dark:text-text-secondary">
          {t("common:empty.noEvents")}
        </div>
      )}
    </div>
  );
}
