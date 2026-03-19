'use client';
import { useTranslation } from "react-i18next";
import { Avatar } from "@/components/shared/Avatar";
import type { AgentVisualStatus } from "@/lib/office/types";
import { STATUS_COLORS } from "@/lib/office/constants";
import { useOfficeStore } from "@/lib/store/visual-office-store";

export function SubAgentPanel() {
  const { t } = useTranslation();
  const agents = useOfficeStore((s) => s.agents);
  const selectAgent = useOfficeStore((s) => s.selectAgent);

  const subAgents = Array.from(agents.values()).filter((a) => a.isSubAgent);

  if (subAgents.length === 0) {
    return (
      <div className="py-2 text-center text-xs text-text-tertiary dark:text-text-tertiary">
        {t("empty.noSubAgents")}
      </div>
    );
  }

  return (
    <div>
      {subAgents.map((sub) => {
        const parent = sub.parentAgentId ? agents.get(sub.parentAgentId) : null;
        const runtime = formatRuntime(sub.lastActiveAt, t);

        return (
          <button
            key={sub.id}
            onClick={() => selectAgent(sub.id)}
            className="flex w-full items-start gap-2 border-b border-border-subtle px-3 py-2 text-left transition-colors hover:bg-status-info/10 dark:border-border-default dark:hover:bg-status-info/10"
          >
            <Avatar agentId={sub.id} agentName={sub.name} size={24} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-xs font-medium text-text-primary dark:text-text-primary">
                  {sub.name}
                </span>
                <span
                  className="inline-flex items-center rounded px-1 py-0.5 text-[9px] font-medium text-white"
                  style={{
                    backgroundColor: STATUS_COLORS[sub.status as AgentVisualStatus],
                  }}
                >
                  {t(`agent.statusLabels.${sub.status}`)}
                </span>
              </div>
              {parent && (
                <span
                  role="link"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAgent(parent.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.stopPropagation();
                      selectAgent(parent.id);
                    }
                  }}
                  className="cursor-pointer text-[10px] text-status-info hover:underline"
                >
                  ← {parent.name}
                </span>
              )}
              {sub.speechBubble && (
                <div className="mt-0.5 truncate text-[10px] text-text-tertiary">
                  {sub.speechBubble.text.slice(0, 80)}
                </div>
              )}
              <div className="text-[10px] text-text-tertiary">{runtime}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function formatRuntime(
  startTs: number,
  t: (key: string, opts?: Record<string, number>) => string,
): string {
  const elapsed = Math.max(0, Math.floor((Date.now() - startTs) / 1000));
  if (elapsed < 60) {
    return t("time.running", { seconds: elapsed });
  }
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  return t("time.runningMinutes", { minutes, seconds });
}
