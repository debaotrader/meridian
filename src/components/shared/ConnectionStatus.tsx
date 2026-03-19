'use client';

import { useGateway } from '@/lib/gateway/use-gateway';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const { state } = useGateway();
  const { status, error } = state;

  const label =
    status === 'connected'
      ? 'Connected'
      : status === 'reconnecting'
        ? 'Reconnecting…'
        : 'Disconnected';

  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      title={error ?? label}
      aria-label={`Gateway: ${label}`}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          status === 'connected' && 'bg-status-success',
          status === 'reconnecting' && 'bg-status-warning animate-pulse',
          status === 'disconnected' && 'bg-status-error',
        )}
      />
      <span className="text-2xs text-text-muted truncate">{label}</span>
    </div>
  );
}

export default ConnectionStatus;
