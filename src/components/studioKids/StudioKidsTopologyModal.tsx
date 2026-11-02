import React from 'react';
import { StudioKidsSkillMeta } from '../../pipeline/studioKids/types';
import {
  X,
  ArrowUp,
  ArrowDown,
  Plus,
  RotateCcw,
  Sliders,
  Trash2,
  Layers,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

interface StudioKidsTopologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  gateOrder: string[];
  onMoveGate: (gateId: string, direction: 'UP' | 'DOWN') => void;
  skillsCatalog: StudioKidsSkillMeta[];
  skillOrderPerGate: Record<string, string[]>;
  onMoveSkill: (skillId: string, direction: 'UP' | 'DOWN') => void;
  onOpenAddPhase: (defaultGateId?: string) => void;
  onDeleteCustomSkill: (skillId: string) => void;
  onResetToCanonical: () => void;
  onSelectSkill: (gateId: string, skillId: string) => void;
}

const GATE_TITLES: Record<string, string> = {
  GATE_0: 'Gate 0: Ingestão, Baseline e Preflight Intake',
  GATE_1: 'Gate 1: Roteiro, Pedagogia e Bíblia Visual 3D',
  GATE_2: 'Gate 2: Engenharia de Áudio e Cue-Sheet (Suno 120BPM)',
  GATE_3: 'Gate 3: Geração de Shots Atômicos e Curadoria',
  GATE_4: 'Gate 4: Acabamento, Perfis e Release Multiplataforma',
};

export const StudioKidsTopologyModal: React.FC<StudioKidsTopologyModalProps> = ({
  isOpen,
  onClose,
  gateOrder,
  onMoveGate,
  skillsCatalog,
  skillOrderPerGate,
  onMoveSkill,
  onOpenAddPhase,
  onDeleteCustomSkill,
  onResetToCanonical,
  onSelectSkill,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Gerenciador de Topologia e Ordem do Pipeline (Poc 2)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 uppercase font-bold">
                  SDUI Dinâmico
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Movimente a ordem de execução dos Gates e Skills ou inclua novas fases padronizadas no fluxo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetToCanonical}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              title="Restaurar os 5 Gates canônicos e suas 15 skills"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body: Gates & Skills List */}
        <div className="overflow-y-auto py-4 space-y-5 pr-1 flex-1 custom-scrollbar">
          {gateOrder.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-200">Nenhuma Fase ou Gate Cadastrado</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Este ambiente exclusivo está limpo. Comece incluindo as fases do seu pipeline para organizar a ordem de execução da produtora.
              </p>
              <button
                type="button"
                onClick={() => onOpenAddPhase()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/50"
              >
                <Plus className="w-4 h-4" />
                <span>+ Incluir Primeira Fase</span>
              </button>
            </div>
          ) : (
            gateOrder.map((gateId, gIdx) => {
              const skillIds = skillOrderPerGate[gateId] || [];
              const isFirstGate = gIdx === 0;
              const isLastGate = gIdx === gateOrder.length - 1;

              return (
                <div
                  key={gateId}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 shadow-inner"
                >
                {/* Gate Header with Up/Down Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                      ETAPA {gIdx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-200">
                      {GATE_TITLES[gateId] || gateId}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500">
                      ({skillIds.length} skills)
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Botões Mover Gate */}
                    <button
                      type="button"
                      disabled={isFirstGate}
                      onClick={() => onMoveGate(gateId, 'UP')}
                      className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Mover este Gate para antes na ordem de execução"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={isLastGate}
                      onClick={() => onMoveGate(gateId, 'DOWN')}
                      className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                      title="Mover este Gate para depois na ordem de execução"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Botão Adicionar Skill neste Gate */}
                    <button
                      type="button"
                      onClick={() => onOpenAddPhase(gateId)}
                      className="ml-2 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nova Fase/Skill</span>
                    </button>
                  </div>
                </div>

                {/* Skills Inside Gate */}
                <div className="space-y-2">
                  {skillIds.map((sId, sIdx) => {
                    const skill = skillsCatalog.find((s) => s.id === sId);
                    if (!skill) return null;

                    const isFirstSkill = sIdx === 0;
                    const isLastSkill = sIdx === skillIds.length - 1;

                    return (
                      <div
                        key={skill.id}
                        className={`p-3 rounded-lg border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                          skill.isCustom
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-slate-900/80 border-slate-800'
                        }`}
                      >
                        {/* Info Padronizada: 4 Dimensões */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                              {skill.code || `${gIdx}.${sIdx + 1}`}
                            </span>
                            <span className="text-xs font-bold text-slate-100">
                              {skill.name}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              {skill.badge}
                            </span>
                            {skill.isCustom && (
                              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-600/40 px-2 py-0.5 rounded">
                                Customizada
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            <strong>Obrigações:</strong> {skill.description}
                          </p>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
                            <div>
                              <strong className="text-slate-400">Entrada:</strong> {skill.inputContract}
                            </div>
                            <div>
                              <strong className="text-slate-400">Saída:</strong> {skill.outputContract}
                            </div>
                            {skill.dependencies && skill.dependencies.length > 0 && (
                              <div className="flex items-center gap-1 text-amber-400">
                                <ShieldCheck className="w-3 h-3" />
                                <span>Pré-requisitos: {skill.dependencies.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Controles de Reordenação e Ação */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                          <button
                            type="button"
                            disabled={isFirstSkill}
                            onClick={() => onMoveSkill(skill.id, 'UP')}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                            title="Subir posição dentro do Gate"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isLastSkill}
                            onClick={() => onMoveSkill(skill.id, 'DOWN')}
                            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                            title="Descer posição dentro do Gate"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {skill.isCustom && (
                            <button
                              type="button"
                              onClick={() => onDeleteCustomSkill(skill.id)}
                              className="p-1 rounded bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 transition cursor-pointer"
                              title="Remover esta fase customizada"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              onSelectSkill(gateId, skill.id);
                              onClose();
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded bg-indigo-600/40 hover:bg-indigo-600 text-indigo-200 hover:text-white transition cursor-pointer"
                          >
                            Abrir Fase
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => onOpenAddPhase()}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-950/50"
          >
            <Plus className="w-4 h-4" />
            <span>+ Incluir Nova Fase no Pipeline</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
