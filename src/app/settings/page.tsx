/**
 * Settings Page
 * Configure Mission Control paths, URLs, and preferences
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Settings, Save, RotateCcw, Home, FolderOpen, Link as LinkIcon } from 'lucide-react';
import { getConfig, updateConfig, resetConfig, type MissionControlConfig } from '@/lib/config';

export default function SettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<MissionControlConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setConfig(getConfig());
  }, []);

  const handleSave = async () => {
    if (!config) return;

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      updateConfig(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Restaurar todas as configurações para o padrão? Essa ação não pode ser desfeita.')) {
      resetConfig();
      setConfig(getConfig());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleChange = <K extends keyof MissionControlConfig>(field: K, value: MissionControlConfig[K]) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-mc-bg flex items-center justify-center">
        <div className="text-mc-text-secondary">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mc-bg">
      {/* Header */}
      <div className="border-b border-mc-border bg-mc-bg-secondary">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-mc-bg-tertiary rounded text-mc-text-secondary"
              title="Voltar ao painel"
            >
              ← Voltar
            </button>
            <Settings className="w-6 h-6 text-mc-accent" />
            <h1 className="text-2xl font-bold text-mc-text">Configurações</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-mc-border rounded hover:bg-mc-bg-tertiary text-mc-text-secondary flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar padrões
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-[#00FF94] text-[#0a0a0a] font-medium rounded hover:bg-[#00FF94]/90 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Success Message */}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded text-green-400">
            ✓ Configurações salvas com sucesso
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400">
            ✗ {error}
          </div>
        )}

        {/* Caminhos do workspace */}
        <section className="mb-8 p-6 bg-mc-bg-secondary border border-mc-border rounded-md">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="w-5 h-5 text-[#6b6b6b]" />
            <h2 className="text-xl font-semibold text-mc-text">Caminhos do workspace</h2>
          </div>
          <p className="text-sm text-mc-text-secondary mb-4">
            Configure onde o sistema armazena projetos e entregas.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mc-text mb-2">
                Caminho base do workspace
              </label>
              <input
                type="text"
                value={config.workspaceBasePath}
                onChange={(e) => handleChange('workspaceBasePath', e.target.value)}
                placeholder="~/Documents/Shared"
                className="w-full px-4 py-2 bg-mc-bg border border-mc-border rounded text-mc-text focus:border-mc-accent focus:outline-none"
              />
              <p className="text-xs text-mc-text-secondary mt-1">
                Diretório base para todos os arquivos. Use ~ para o diretório home.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-mc-text mb-2">
                Caminho dos projetos
              </label>
              <input
                type="text"
                value={config.projectsPath}
                onChange={(e) => handleChange('projectsPath', e.target.value)}
                placeholder="~/Documents/Shared/projects"
                className="w-full px-4 py-2 bg-mc-bg border border-mc-border rounded text-mc-text focus:border-mc-accent focus:outline-none"
              />
              <p className="text-xs text-mc-text-secondary mt-1">
                Diretório onde as pastas de projeto são criadas. Cada projeto tem sua própria pasta.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-mc-text mb-2">
                Nome padrão do projeto
              </label>
              <input
                type="text"
                value={config.defaultProjectName}
                onChange={(e) => handleChange('defaultProjectName', e.target.value)}
                placeholder="meridian"
                className="w-full px-4 py-2 bg-mc-bg border border-mc-border rounded text-mc-text focus:border-mc-accent focus:outline-none"
              />
              <p className="text-xs text-mc-text-secondary mt-1">
                Nome padrão para novos projetos. Pode ser alterado por projeto.
              </p>
            </div>
          </div>
        </section>

        {/* Configuração de API */}
        <section className="mb-8 p-6 bg-mc-bg-secondary border border-mc-border rounded-md">
          <div className="flex items-center gap-2 mb-4">
            <LinkIcon className="w-5 h-5 text-[#6b6b6b]" />
            <h2 className="text-xl font-semibold text-mc-text">Configuração de API</h2>
          </div>
          <p className="text-sm text-mc-text-secondary mb-4">
            Configure a URL da API para orquestração de agentes.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-mc-text mb-2">
                URL do painel
              </label>
              <input
                type="text"
                value={config.missionControlUrl}
                onChange={(e) => handleChange('missionControlUrl', e.target.value)}
                placeholder="http://localhost:4000"
                className="w-full px-4 py-2 bg-mc-bg border border-mc-border rounded text-mc-text focus:border-mc-accent focus:outline-none"
              />
              <p className="text-xs text-mc-text-secondary mt-1">
                URL onde o sistema está rodando. Detectado automaticamente por padrão. Altere para acesso remoto.
              </p>
            </div>
          </div>
        </section>

        {/* UX do Kanban */}
        <section className="mb-8 p-6 bg-mc-bg-secondary border border-mc-border rounded-md">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-[#6b6b6b]" />
            <h2 className="text-xl font-semibold text-mc-text">UX do Kanban</h2>
          </div>
          <p className="text-sm text-mc-text-secondary mb-4">
            Ajuste a densidade do quadro e o comportamento das colunas.
          </p>

          <label className="flex items-start gap-3 p-3 bg-mc-bg border border-mc-border rounded cursor-pointer">
            <input
              type="checkbox"
              checked={config.kanbanCompactEmptyColumns}
              onChange={(e) => handleChange('kanbanCompactEmptyColumns', e.target.checked)}
              className="mt-1 h-4 w-4 accent-[var(--mc-accent)]"
            />
            <div>
              <div className="text-sm font-medium text-mc-text">Colunas vazias compactas</div>
              <div className="text-xs text-mc-text-secondary mt-1">
                Quando ativado, colunas Kanban vazias encolhem para o tamanho do cabeçalho, enquanto colunas com tarefas mantêm largura dinâmica.
              </div>
            </div>
          </label>
        </section>

        {/* Variáveis de ambiente Note */}
        <section className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">
            📝 Variáveis de ambiente
          </h3>
          <p className="text-sm text-blue-300 mb-3">
            Algumas configurações também podem ser definidas via variáveis de ambiente em <code className="px-2 py-1 bg-mc-bg rounded">.env.local</code>:
          </p>
          <ul className="text-sm text-blue-300 space-y-1 ml-4 list-disc">
            <li><code>MISSION_CONTROL_URL</code> - API URL override</li>
            <li><code>WORKSPACE_BASE_PATH</code> - Base workspace directory</li>
            <li><code>PROJECTS_PATH</code> - Projects directory</li>
            <li><code>OPENCLAW_GATEWAY_URL</code> - Gateway WebSocket URL</li>
            <li><code>OPENCLAW_GATEWAY_TOKEN</code> - Gateway auth token</li>
          </ul>
          <p className="text-xs text-blue-400 mt-3">
            Variáveis de ambiente têm precedência sobre configurações da interface para operações server-side.
          </p>
        </section>
      </div>
    </div>
  );
}
