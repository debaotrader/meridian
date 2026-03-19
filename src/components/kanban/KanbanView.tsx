'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, LayoutPanelTop, X } from 'lucide-react';
import { MissionQueue } from './MissionQueue';
import { PlanningTab } from './PlanningTab';
import { LiveFeed } from './LiveFeed';

interface KanbanViewProps {
  workspaceId?: string;
  taskId?: string;
  highlightTaskId?: string;
  highlightAgentId?: string;
}

/**
 * KanbanView — Phase 3 composed layout
 *
 * Desktop: CSS Grid [1fr_380px] — MissionQueue | PlanningTab panel
 * Mobile: single column, LiveFeed collapsible at bottom
 * LiveFeed: collapsible panel at the bottom, max-h-[300px]
 */
export function KanbanView({ workspaceId, taskId, highlightTaskId, highlightAgentId }: KanbanViewProps) {
  const [showPlanning, setShowPlanning] = useState(false);
  const [liveFeedOpen, setLiveFeedOpen] = useState(true);

  return (
    <div className="flex flex-col h-full bg-surface-0 overflow-hidden">
      {/* Main area: queue + optional planning panel */}
      <div
        className={`flex-1 overflow-hidden ${
          showPlanning
            ? 'grid grid-cols-1 lg:grid-cols-[1fr_380px]'
            : 'flex flex-col'
        }`}
      >
        {/* Left: Mission Queue */}
        <div className="flex flex-col overflow-hidden min-w-0">
          {/* Planning toggle button */}
          <div className="flex items-center justify-end px-3 py-1 border-b border-border-subtle bg-surface-1">
            <button
              onClick={() => setShowPlanning((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded border border-border-default bg-surface-2 text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors"
              aria-label={showPlanning ? 'Ocultar painel de planejamento' : 'Mostrar painel de planejamento'}
            >
              {showPlanning ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  Close Planning
                </>
              ) : (
                <>
                  <LayoutPanelTop className="w-3.5 h-3.5" />
                  Painel de planejamento
                </>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            <MissionQueue workspaceId={workspaceId} highlightTaskId={highlightTaskId} highlightAgentId={highlightAgentId} />
          </div>
        </div>

        {/* Right: Painel de planejamento (togglable) */}
        {showPlanning && (
          <aside className="hidden lg:flex flex-col border-l border-border-default bg-surface-1 overflow-hidden animate-slide-in-right">
            <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary uppercase tracking-wider font-display">
                Planning
              </span>
              <button
                onClick={() => setShowPlanning(false)}
                className="p-1 rounded hover:bg-surface-3 text-text-tertiary hover:text-text-secondary transition-colors"
                aria-label="Fechar painel de planejamento"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {taskId ? (
                <PlanningTab taskId={taskId} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-text-secondary text-sm">
                    Open a task to start planning
                  </p>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Bottom: Live Feed (collapsible) */}
      <div
        className={`border-t border-border-default bg-surface-1 transition-all duration-300 ease-in-out ${
          liveFeedOpen ? 'max-h-[300px]' : 'max-h-[44px]'
        } flex flex-col`}
      >
        {/* Collapse toggle header */}
        <button
          onClick={() => setLiveFeedOpen((v) => !v)}
          className="flex items-center justify-between px-4 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors shrink-0 w-full"
          aria-label={liveFeedOpen ? 'Recolher feed ao vivo' : 'Expandir feed ao vivo'}
        >
          <span className="font-medium uppercase tracking-wider font-display">Feed ao vivo</span>
          {liveFeedOpen ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>

        {/* Feed content */}
        {liveFeedOpen && (
          <div className="flex-1 overflow-hidden min-h-0">
            <LiveFeed mobileMode />
          </div>
        )}
      </div>
    </div>
  );
}
