import React from 'react';
import { Sparkles, Settings, Wrench, Sliders, Plus, BarChart3 } from 'lucide-react';

export interface StudioKidsNavigationBarProps {
  gateCount: number;
  skillCount: number;
  readinessPct: number;
  onOpenSettings: () => void;
  onOpenSkills: () => void;
  onOpenTopology: () => void;
  onOpenAddPhase: () => void;
  onToggleMetrics: () => void;
}

export const StudioKidsNavigationBar: React.FC<StudioKidsNavigationBarProps> = ({
  gateCount,
  skillCount,
  readinessPct,
  onOpenSettings,
  onOpenSkills,
  onOpenTopology,
  onOpenAddPhase,
  onToggleMetrics,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            Produtora Kids — POC 2
          </span>
          <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Ambiente Exclusivo
          </span>
        </div>

        <span className="hidden xl:inline-flex items-center px-2 py-0.5 text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700 rounded">
          {gateCount} GATES • {skillCount} SKILLS NO CATÁLOGO
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Parâmetros & Integrações</span>
        </button>

        <button
          type="button"
          onClick={onOpenSkills}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-200 border border-indigo-700/50 transition-all cursor-pointer"
        >
          <Wrench className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Manutenção de Skills</span>
        </button>

        <button
          type="button"
          onClick={onOpenTopology}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 transition-all cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Ordem & Fases</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddPhase}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">+ Nova Fase</span>
        </button>

        <button
          type="button"
          onClick={onToggleMetrics}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all cursor-pointer"
        >
          <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Métricas ({readinessPct}%)</span>
        </button>
      </div>
    </header>
  );
};
