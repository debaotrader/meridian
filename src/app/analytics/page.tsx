import { AnalyticsDashboard } from '@/components/panels/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-surface-0 p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary tracking-tight">Analytics</h1>
        <p className="text-sm text-text-muted mt-1">Agent performance and collaboration metrics</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
