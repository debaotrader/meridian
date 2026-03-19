/* eslint-disable */
// View model types — unused by components, kept for completeness
// @ts-ignore

export interface DashboardSummaryVM {
  connectedChannels: number;
  errorChannels: number;
  enabledSkills: number;
  providerUsage: string;
}

export interface ChannelCardVM {
  id: string;
  name: string;
  type: string;
  statusLabel: string;
  statusColor: string;
  icon: string;
  configured: boolean;
  linked: boolean;
  running: boolean;
  lastConnectedAt: number | null;
}

export interface SkillCardVM {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  icon: string;
  source: string;
  hasMissing: boolean;
  hasInstallOptions: boolean;
  configChecksPassed: boolean;
}

export interface CronTaskCardVM {
  id: string;
  name: string;
  schedule: string;
  scheduleLabel: string;
  enabled: boolean;
  lastRunAt: number | null;
  nextRunAt: number | null;
  lastRunStatus: string | null;
  message: string;
  statusLabel: string;
}
