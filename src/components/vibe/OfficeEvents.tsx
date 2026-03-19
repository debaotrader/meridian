'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Agent } from './types';

/**
 * Random Office Events — ambient events that make the office feel alive.
 * Like "The Sims" event popups: funny, shareable, personality-driven.
 * Events appear as a ticker/toast at the top of the office floor.
 */

export interface OfficeEvent {
  id: string;
  icon: string;
  text: string;
  category: 'social' | 'funny' | 'milestone' | 'chaos' | 'wholesome';
  timestamp: number;
}

// Event templates — {agent} and {agent2} replaced with real agent names
const EVENT_TEMPLATES: { icon: string; text: string; category: OfficeEvent['category']; needsTwo?: boolean }[] = [
  // Social events
  { icon: '💬', text: '{agent} iniciou um debate acalorado sobre tabs vs espaços', category: 'social' },
  { icon: '🤝', text: '{agent} e {agent2} estão em pair programming', category: 'social', needsTwo: true },
  { icon: '☕', text: '{agent} está fazendo café para todo mundo', category: 'social' },
  { icon: '🎵', text: '{agent} está tocando lo-fi no volume máximo na sala', category: 'social' },
  { icon: '💬', text: '{agent} e {agent2} estão sussurrando no bebedouro', category: 'social', needsTwo: true },
  { icon: '📱', text: '{agent} está mostrando um meme para {agent2}', category: 'social', needsTwo: true },
  { icon: '🎲', text: '{agent} desafiou {agent2} para um code golf', category: 'social', needsTwo: true },

  // Funny events
  { icon: '🐟', text: 'Alguém esquentou peixe no microondas', category: 'funny' },
  { icon: '😴', text: '{agent} dormiu no teclado... zzz', category: 'funny' },
  { icon: '🪑', text: '{agent} está girando na cadeira de escritório de novo', category: 'funny' },
  { icon: '🖨️', text: 'A impressora travou. {agent} está negociando com ela.', category: 'funny' },
  { icon: '🐛', text: '{agent} encontrou um bug e chamou de Gerald', category: 'funny' },
  { icon: '🧃', text: '{agent} roubou o suco de {agent2} da geladeira', category: 'funny', needsTwo: true },
  { icon: '🎮', text: '{agent} jogou Snake escondido durante o standup', category: 'funny' },
  { icon: '📎', text: '"Parece que você está escrevendo código. Precisa de ajuda?" — {agent}', category: 'funny' },
  { icon: '🍕', text: '{agent} pediu pizza para o escritório. Debate sobre abacaxi em andamento.', category: 'funny' },
  { icon: '🔊', text: '{agent} esqueceu de mutar e todo mundo ouviu o gato', category: 'funny' },
  { icon: '💾', text: '{agent} salvou o arquivo 47 vezes... só para garantir', category: 'funny' },
  { icon: '🌙', text: '{agent} escreveu "// TODO: corrigir depois" às 3h da manhã', category: 'funny' },
  { icon: '🎧', text: '{agent} está ouvindo a mesma música no loop por 3 horas', category: 'funny' },

  // Milestone events
  { icon: '✨', text: '{agent}\'s código compilou na primeira tentativa!', category: 'milestone' },
  { icon: '🏆', text: '{agent} fechou 10 issues hoje — novo recorde!', category: 'milestone' },
  { icon: '🎯', text: '{agent} atingiu uma sequência de 7 dias de commits 🔥', category: 'milestone' },
  { icon: '⚡', text: '{agent} fez deploy em produção com zero erros', category: 'milestone' },
  { icon: '📈', text: '{agent} bateu seu recorde pessoal de tarefas concluídas', category: 'milestone' },
  { icon: '🥇', text: '{agent} ganhou o badge "Primeiro a Responder"', category: 'milestone' },

  // Chaos events
  { icon: '🔥', text: 'Um bug selvagem apareceu em produção! {agent} está nisso.', category: 'chaos' },
  { icon: '⚠️', text: '{agent} fez push para main sem testes. {agent2} está em pânico.', category: 'chaos', needsTwo: true },
  { icon: '💥', text: 'npm install quebrou tudo. Clássico.', category: 'chaos' },
  { icon: '🌪️', text: 'Tornado de merge conflict! {agent} e {agent2} estão resolvendo.', category: 'chaos', needsTwo: true },
  { icon: '🚨', text: 'As dependências estão 47 versões atrás. {agent} é corajoso o suficiente para atualizar.', category: 'chaos' },
  { icon: '☢️', text: '{agent} deletou acidentalmente o arquivo .env', category: 'chaos' },

  // Wholesome events
  { icon: '🌱', text: '{agent} regou a plantinha do escritório', category: 'wholesome' },
  { icon: '⭐', text: '{agent} deixou um code review muito bom para {agent2}', category: 'wholesome', needsTwo: true },
  { icon: '🎂', text: 'É o aniversário de trabalho de {agent}! 🎉', category: 'wholesome' },
  { icon: '🤗', text: '{agent} ajudou {agent2} a debugar um problema difícil', category: 'wholesome', needsTwo: true },
  { icon: '📝', text: '{agent} escreveu documentação sem ninguém pedir', category: 'wholesome' },
  { icon: '🧡', text: '{agent} agradeceu {agent2} pelo ótimo review do PR', category: 'wholesome', needsTwo: true },
  { icon: '🌈', text: 'As vibes do escritório estão impecáveis hoje', category: 'wholesome' },
  { icon: '🎁', text: '{agent} compartilhou um snippet útil com a equipe', category: 'wholesome' },
];

// Deterministic-ish pick using timestamp + index for variety
function pickRandom<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function generateEvent(agents: Agent[], seed: number): OfficeEvent | null {
  if (agents.length === 0) return null;

  // Pick a template
  const available = agents.length >= 2
    ? EVENT_TEMPLATES
    : EVENT_TEMPLATES.filter(t => !t.needsTwo);

  const template = pickRandom(available, seed);

  // Pick agents
  const agent1 = pickRandom(agents, seed * 31);
  let agent2 = agent1;
  if (template.needsTwo && agents.length >= 2) {
    const others = agents.filter(a => a.id !== agent1.id);
    agent2 = pickRandom(others, seed * 37);
  }

  const text = template.text
    .replace('{agent}', agent1.name)
    .replace('{agent2}', agent2.name);

  return {
    id: `evt-${seed}-${Date.now()}`,
    icon: template.icon,
    text,
    category: template.category,
    timestamp: Date.now(),
  };
}

// Category colors for the left accent
const CATEGORY_COLORS: Record<OfficeEvent['category'], string> = {
  social: '#6366f1',    // indigo
  funny: '#f59e0b',     // amber
  milestone: '#10b981', // emerald
  chaos: '#ef4444',     // red
  wholesome: '#ec4899', // pink
};

const CATEGORY_BG: Record<OfficeEvent['category'], string> = {
  social: 'rgba(99,102,241,0.08)',
  funny: 'rgba(245,158,11,0.08)',
  milestone: 'rgba(16,185,129,0.08)',
  chaos: 'rgba(239,68,68,0.08)',
  wholesome: 'rgba(236,72,153,0.08)',
};

interface OfficeEventsProps {
  agents: Agent[];
  /** Interval between events in ms (default: 45000 = 45s) */
  intervalMs?: number;
  /** Max events shown in the log (default: 3) */
  maxVisible?: number;
  /** Theme-aware colors */
  theme?: {
    text?: string;
    textDim?: string;
    bgSecondary?: string;
    border?: string;
  };
}

export function OfficeEvents({
  agents,
  intervalMs = 45000,
  maxVisible = 3,
  theme = {},
}: OfficeEventsProps) {
  const [events, setEvents] = useState<OfficeEvent[]>([]);
  const [entering, setEntering] = useState<string | null>(null);
  const [exiting, setExiting] = useState<string | null>(null);
  const seedRef = useRef(Math.floor(Math.random() * 10000));
  const agentsRef = useRef(agents);
  const startedRef = useRef(false);
  const textColor = theme.text || '#e2e8f0';
  const dimColor = theme.textDim || '#64748b';

  // Keep agents ref fresh without restarting timers
  useEffect(() => { agentsRef.current = agents; }, [agents]);

  // Generate events periodically — stable effect that doesn't depend on agent reference
  useEffect(() => {
    if (agents.length === 0 || startedRef.current) return;
    startedRef.current = true;

    const addEvent = () => {
      const currentAgents = agentsRef.current;
      if (currentAgents.length === 0) return;
      seedRef.current++;
      const evt = generateEvent(currentAgents, seedRef.current);
      if (evt) {
        setEntering(evt.id);
        setEvents(prev => {
          const updated = [evt, ...prev];
          if (updated.length > maxVisible) {
            const exitId = updated[maxVisible]?.id;
            if (exitId) setExiting(exitId);
            setTimeout(() => {
              setExiting(null);
              setEvents(p => p.slice(0, maxVisible));
            }, 300);
          }
          return updated.slice(0, maxVisible + 1);
        });
        setTimeout(() => setEntering(null), 400);
      }
    };

    // Generate first event quickly (2-5s after load)
    const firstTimer = setTimeout(addEvent, 2000 + Math.random() * 3000);

    // Then regular interval
    const interval = setInterval(addEvent, intervalMs);

    return () => {
      clearTimeout(firstTimer);
      clearInterval(interval);
      startedRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agents.length > 0, intervalMs, maxVisible]);

  if (events.length === 0) return null;

  return (
    <div
      data-tour="office-events"
      style={{
        background: theme.bgSecondary || 'rgba(15,23,42,0.6)',
        border: `2px solid ${theme.border || '#1e293b'}`,
        borderRadius: 12,
        padding: '8px 10px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        overflow: 'hidden',
        animation: 'eventContainerIn 0.4s ease-out',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        paddingBottom: 2,
      }}>
        <span style={{ fontSize: 10 }}>📡</span>
        <span style={{
          fontFamily: '"Press Start 2P", monospace',
          fontSize: 7,
          color: dimColor,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}>
          Office Feed
        </span>
        <div style={{
          flex: 1,
          height: 1,
          background: theme.border || 'rgba(100,116,139,0.2)',
        }} />
      </div>

      {/* Event items */}
      {events.slice(0, maxVisible).map((evt) => {
        const isEntering = entering === evt.id;
        const isExiting = exiting === evt.id;

        return (
          <div
            key={evt.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '5px 8px',
              background: CATEGORY_BG[evt.category],
              borderLeft: `2px solid ${CATEGORY_COLORS[evt.category]}`,
              borderRadius: 4,
              opacity: isExiting ? 0 : 1,
              transform: isEntering ? 'translateY(0)' : isExiting ? 'translateY(-8px)' : 'none',
              animation: isEntering ? 'eventSlideIn 0.4s ease-out' : isExiting ? 'eventFadeOut 0.3s ease-in forwards' : 'none',
              transition: 'opacity 0.3s, transform 0.3s',
            }}
          >
            <span style={{ fontSize: 13, flexShrink: 0, lineHeight: 1 }}>{evt.icon}</span>
            <span style={{
              fontSize: 10,
              color: textColor,
              lineHeight: 1.3,
              flex: 1,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
            }}>
              {evt.text}
            </span>
            <span style={{
              fontSize: 8,
              color: dimColor,
              flexShrink: 0,
              fontFamily: 'monospace',
            }}>
              {formatTimeAgo(evt.timestamp)}
            </span>
          </div>
        );
      })}

      <style jsx>{`
        @keyframes eventContainerIn {
          0% {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            max-height: 300px;
          }
        }
        @keyframes eventSlideIn {
          0% {
            opacity: 0;
            transform: translateX(-20px);
            max-height: 0;
          }
          100% {
            opacity: 1;
            transform: translateX(0);
            max-height: 60px;
          }
        }
        @keyframes eventFadeOut {
          0% {
            opacity: 1;
            transform: translateY(0);
            max-height: 60px;
          }
          100% {
            opacity: 0;
            transform: translateY(-8px);
            max-height: 0;
          }
        }
      `}</style>
    </div>
  );
}

function formatTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  return `${Math.floor(diff / 3600000)}h`;
}

/**
 * Hook to track office event history for the event log.
 * Returns the last N events for display in settings/stats.
 */
export function useOfficeEventHistory(maxHistory: number = 20) {
  const [history, setHistory] = useState<OfficeEvent[]>([]);

  const addEvent = useCallback((event: OfficeEvent) => {
    setHistory(prev => [event, ...prev].slice(0, maxHistory));
  }, [maxHistory]);

  return { history, addEvent };
}
