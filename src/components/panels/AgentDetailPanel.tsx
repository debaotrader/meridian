'use client';
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import { SvgAvatar } from "@/components/shared/SvgAvatar";
import { STATUS_COLORS } from "@/lib/office/constants";
import { useOfficeStore } from "@/lib/store/visual-office-store";

export function AgentDetailPanel() {
  const { t } = useTranslation("panels");
  const selectedId = useOfficeStore((s) => s.selectedAgentId);
  const agents = useOfficeStore((s) => s.agents);
  const selectAgent = useOfficeStore((s) => s.selectAgent);

  if (!selectedId) {
    return null;
  }
  const agent = agents.get(selectedId);
  if (!agent) {
    return null;
  }

  return (
    <div className="px-3 py-2">
      <div className="mb-2 flex items-center gap-2">
        <SvgAvatar agentId={agent.id} size={32} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-text-primary dark:text-text-primary">
            {agent.name}
          </div>
          <div className="flex items-center gap-1">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[agent.status] }}
            />
            <span className="text-xs text-text-secondary dark:text-text-tertiary">
              {t(`common:agent.statusLabels.${agent.status}`)}
            </span>
          </div>
        </div>
        <button
          onClick={() => selectAgent(null)}
          className="shrink-0 text-xs text-text-tertiary hover:text-text-secondary dark:hover:text-text-primary"
          title={t("agentDetail.deselect")} aria-label={t("agentDetail.deselect")}
        >
          ✕
        </button>
      </div>

      {agent.currentTool && (
        <div className="mb-2 rounded bg-orange-50 px-2 py-1.5 text-xs dark:bg-orange-950/50">
          <div className="text-orange-600 dark:text-orange-400">🔧 {agent.currentTool.name}</div>
        </div>
      )}

      {agent.speechBubble && (
        <div className="mb-2 rounded bg-white px-2 py-1.5 text-xs leading-relaxed text-text-secondary shadow-sm dark:bg-surface-2 dark:text-text-secondary">
          <Markdown>{agent.speechBubble.text}</Markdown>
        </div>
      )}

      {agent.toolCallHistory.length > 0 && (
        <div className="mt-2">
          <div className="mb-1 text-xs font-medium text-text-tertiary dark:text-text-secondary">
            {t("agentDetail.toolCallHistory")}
          </div>
          {agent.toolCallHistory.map((t, i) => (
            <div
              key={`${t.name}-${t.timestamp}-${i}`}
              className="flex items-center justify-between border-b border-border-subtle py-1 text-xs text-text-secondary dark:border-border-default dark:text-text-tertiary"
            >
              <span>{t.name}</span>
              <span className="text-text-tertiary">{new Date(t.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
