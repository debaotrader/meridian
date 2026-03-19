'use client';
import { useTranslation } from "react-i18next";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_PALETTE, CHART_COLORS } from "@/lib/office/chart-colors";
import { useOfficeStore } from "@/lib/store/visual-office-store";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function CostPieChart() {
  const { t } = useTranslation();
  const agentCosts = useOfficeStore((s) => s.agentCosts);
  const agents = useOfficeStore((s) => s.agents);

  const entries = Object.entries(agentCosts).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);

  if (entries.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-sm text-text-muted">
        {t("empty.noCostData")}
      </div>
    );
  }

  const data = entries.map(([agentId, value], i) => ({
    name: agents.get(agentId)?.name ?? agentId,
    agentId,
    value,
    color: CHART_PALETTE[i % CHART_PALETTE.length],
  }));

  return (
    <div className="relative h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const item = payload[0]?.payload as { name: string; value: number };
              const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
              return (
                <div style={{ background: CHART_COLORS.tooltip.bg, border: `1px solid ${CHART_COLORS.tooltip.border}`, borderRadius: 6, padding: '6px 10px', fontSize: 11 }}>
                  <div style={{ color: CHART_COLORS.tooltip.text }}>{item.name}</div>
                  <div style={{ color: CHART_COLORS.tooltip.muted }}>{formatTokens(item.value)} ({pct}%)</div>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-sm font-semibold text-text-primary">
          {formatTokens(total)}
        </span>
      </div>
    </div>
  );
}
