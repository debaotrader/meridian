'use client';

import { useEffect, useState } from 'react';

interface OnboardingModalProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export function OnboardingModal({ isVisible, onDismiss }: OnboardingModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Small delay for smoother appearance
      const timer = setTimeout(() => setShow(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        opacity: show ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
      onClick={onDismiss}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: 'white',
          transform: show ? 'scale(1)' : 'scale(0.9)',
          transition: 'transform 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '8px',
            textAlign: 'center',
          }}
        >
          👋 Bem-vindo ao OpenClawfice!
        </div>

        <div
          style={{
            fontSize: '16px',
            opacity: 0.9,
            marginBottom: '32px',
            textAlign: 'center',
          }}
        >
          Seus agentes IA são NPCs em pixel art agora
        </div>

        {/* Steps */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Como Começar:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  flexShrink: 0,
                }}
              >
                1
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  Peça a um agente que faça algo
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  No seu OpenClaw CLI, diga a um agente para concluir uma tarefa
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  flexShrink: 0,
                }}
              >
                2
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  Veja-os aparecer e ganhar XP ⚡
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Agentes se movem entre salas, sobem de nível e competem
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  flexShrink: 0,
                }}
              >
                3
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  Explore os recursos do escritório 🎮
                </div>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  Veja as estatísticas (📊), Bebedouro, missões e ranking
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '24px',
            justifyContent: 'center',
          }}
        >
          {['📊 Estatísticas', '🏆 Ranking', '💬 Bebedouro', '⚔️ Missões', '⚡ Sistema XP'].map((feature) => (
            <div
              key={feature}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '20px',
                padding: '6px 12px',
                fontSize: '13px',
                fontWeight: '500',
              }}
            >
              {feature}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button
            onClick={onDismiss}
            style={{
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '8px',
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
          >
            Entendi! Vamos lá 🚀
          </button>

          <a
            href="https://docs.openclaw.ai/getting-started"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              textAlign: 'center',
              textDecoration: 'none',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            📖 Ler o Guia Completo
          </a>
        </div>

        {/* Tip */}
        <div
          style={{
            marginTop: '20px',
            fontSize: '12px',
            textAlign: 'center',
            opacity: 0.7,
          }}
        >
          💡 Dica: Pressione <kbd style={{ 
            background: 'rgba(255, 255, 255, 0.2)', 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>Ctrl+K</kbd> para a paleta de comandos
        </div>
      </div>
    </div>
  );
}
