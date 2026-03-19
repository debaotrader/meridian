'use client';
import { useTranslation } from "react-i18next";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import type { TokenSnapshot } from "@/lib/office/types";
import { CHART_COLORS, CHART_PALETTE } from "@/lib/office/chart-colors";
import { useOfficeStore } from "@/lib/store/visual-office-store";

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function TokenLineChart() {
  const { t } = useTranslation("panels");
  const tokenHistory = useOfficeStore((s) => s.tokenHistory);

  if (tokenHistory.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-text-muted">
        {t("common:empty.waitingUsageData")}
      </div>
    );
  }

  const topAgentIds = getTopAgentIds(tokenHistory, 5);
  const chartData = tokenHistory.map((snap) => {
    const point: Record<string, number | string> = {
      timestamp: snap.timestamp,
      time: formatTime(snap.timestamp),
      total: snap.total,
    };
    for (const aid of topAgentIds) {
      point[aid] = snap.byAgent[aid] ?? 0;
    }
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: CHART_COLORS.axis }} axisLine={{ stroke: CHART_COLORS.grid }} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: CHART_COLORS.axis }} axisLine={{ stroke: CHART_COLORS.grid }} tickLine={false} tickFormatter={formatTokens} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0]?.payload as Record<string, unknown>;
            if (!p) return null;
            const total = p.total as number;
            return (
              <div style={{ background: CHART_COLORS.tooltip.bg, border: `1px solid ${CHART_COLORS.tooltip.border}`, borderRadius: 6, padding: '6px 10px', fontSize: 11 }}>
                <div style={{ color: CHART_COLORS.tooltip.muted, marginBottom: 4 }}>{label}</div>
                <div style={{ color: CHART_COLORS.tooltip.text }}>{t("tokenChart.total")} {formatTokens(total)}</div>
                {topAgentIds.map((aid, i) => (
                  <div key={aid} style={{ color: CHART_PALETTE[i % CHART_PALETTE.length] }}>
                    {aid.slice(0, 12)}: {formatTokens((p[aid] as number) ?? 0)}
                  </div>
                ))}
              </div>
            );
          }}
        />
        <Line type="monotone" dataKey="total" stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} name={t("tokenChart.totalLine")} />
        {topAgentIds.map((aid, i) => (
          <Line key={aid} type="monotone" dataKey={aid} stroke={CHART_PALETTE[(i + 1) % CHART_PALETTE.length]} strokeWidth={1} strokeDasharray="4 2" dot={false} name={aid} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function getTopAgentIds(history: TokenSnapshot[], limit: number): string[] {
  const sums: Record<string, number> = {};
  for (const snap of history) {
    for (const [aid, v] of Object.entries(snap.byAgent)) {
      sums[aid] = (sums[aid] ?? 0) + v;
    }
  }
  return Object.entries(sums)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => id);
}
