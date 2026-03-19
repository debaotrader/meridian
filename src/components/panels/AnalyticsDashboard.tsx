'use client';
import dynamic from 'next/dynamic';
import { MetricsPanel } from './MetricsPanel';

// Lazy-load chart-heavy components to keep /analytics within 200kb budget
const TokenLineChart = dynamic(() => import('./TokenLineChart').then(m => ({ default: m.TokenLineChart })), { ssr: false });
const CostPieChart = dynamic(() => import('./CostPieChart').then(m => ({ default: m.CostPieChart })), { ssr: false });
const ActivityHeatmap = dynamic(() => import('./ActivityHeatmap').then(m => ({ default: m.ActivityHeatmap })), { ssr: false });
const NetworkGraph = dynamic(() => import('./NetworkGraph').then(m => ({ default: m.NetworkGraph })), { ssr: false });
const EventTimeline = dynamic(() => import('./EventTimeline').then(m => ({ default: m.EventTimeline })), { ssr: false });
const SubAgentPanel = dynamic(() => import('./SubAgentPanel').then(m => ({ default: m.SubAgentPanel })), { ssr: false });

export function AnalyticsDashboard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Row 1: Metrics summary full width */}
      <div className="lg:col-span-3 bg-surface-1 border border-border-default rounded-lg p-4">
        <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">
          Live Metrics
        </h2>
        <MetricsPanel />
      </div>

      {/* Row 2: Token chart (2 cols) + Pie chart (1 col) */}
      <div className="lg:col-span-2 bg-surface-1 border border-border-default rounded-lg p-4">
        <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">
          Token Usage Over Time
        </h2>
        <TokenLineChart />
      </div>

      <div className="bg-surface-1 border border-border-default rounded-lg p-4">
        <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">
          Cost Distribution
        </h2>
        <CostPieChart />
      </div>

      {/* Row 3: Network + Heatmap */}
      <div className="bg-surface-1 border border-border-default rounded-lg p-4">
        <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">
          Agent Network
        </h2>
        <NetworkGraph />
      </div>

      <div className="bg-surface-1 border border-border-default rounded-lg p-4">
        <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">
          Activity Heatmap
        </h2>
        <ActivityHeatmap />
      </div>

      <div className="bg-surface-1 border border-border-default rounded-lg p-4">
        <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">
          Sub-Agents
        </h2>
        <SubAgentPanel />
      </div>

      {/* Row 4: Event timeline full width */}
      <div className="lg:col-span-3 bg-surface-1 border border-border-default rounded-lg p-4">
        <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">
          Event Timeline
        </h2>
        <EventTimeline />
      </div>
    </div>
  );
}
