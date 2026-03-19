'use client';

import { useEffect, useState } from 'react';
import { apiPath } from '@/lib/api-path';

export default function DemoBanner() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    fetch(apiPath('/api/demo'))
      .then(r => r.json())
      .then(data => setIsDemo(data.demo))
      .catch(() => {});
  }, []);

  if (!isDemo) return null;

  return (
    <div className="bg-gradient-to-r from-status-info via-agent-shuri to-status-info text-white text-center py-2 px-4 text-sm font-medium z-50 relative">
      <span className="mr-2">🎮</span>
      <span>Live Demo — AI agents are working in real-time. This is a read-only simulation.</span>
      <a
        href="https://github.com/crshdn/mission-control"
        target="_blank"
        rel="noopener noreferrer"
        className="ml-3 underline hover:text-mc-accent-cyan transition-colors"
      >
        Get Mission Control →
      </a>
    </div>
  );
}
