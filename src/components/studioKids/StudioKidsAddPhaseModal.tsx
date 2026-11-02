import React, { useState } from 'react';
import { StudioKidsSkillMeta } from '../../pipeline/studioKids/types';
import { Plus, X, AlertCircle, CheckCircle, ShieldCheck, Cpu, Wrench } from 'lucide-react';

interface StudioKidsAddPhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  gateOrder: string[];
  skillsCatalog: StudioKidsSkillMeta[];
  initialGateId?: string;
  onAddPhase: (payload: {
    name: string;
    description: string;
    badge: string;
    gateId: string;
    inputContract: string;
    outputContract: string;
    obligations: string[];
    dependencies: string[];
    skillId?: string;
  }) => void;
  onOpenSkillManager?: () => void;
}

export const StudioKidsAddPhaseModal: React.FC<StudioKidsAddPhaseModalProps> = ({
  isOpen,
  onClose,
  gateOrder,
  skillsCatalog,
  initialGateId,
  onAddPhase,
  onOpenSkillManager,
}) => {
  const [gateId, setGateId] = useState(initialGateId || gateOrder[0] || 'GATE_0');
  const [customGateName, setCustomGateName] = useState('');
  const [selectedSkillId, setSelectedSkillId] = useState<string>(() => {
    return skillsCatalog[0]?.id || '';
  });

  const selectedSkill = skillsCatalog.find((s) => s.id === selectedSkillId) || skillsCatalog[0];

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('Gemini 3.1 Pro');
  const [inputContract, setInputContract] = useState('Dados canônicos e contratos anteriores');
  const [outputContract, setOutputContract] = useState('JSON estruturado de validação e entrega');
  const [obligationsText, setObligationsText] = useState(
    'Validar consistência dos dados recebidos\nGerar entregas estruturadas conforme requisitos\nRegistrar laudo de prontidão'
  );
  const [selectedDependencies, setSelectedDependencies] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Sync defaults when selecting a skill
  const handleSelectSkill = (skillId: string) => {
    setSelectedSkillId(skillId);
    const found = skillsCatalog.find((s) => s.id === skillId);
    if (found) {
      setBadge(found.badge || (found.suggestedModel === 'gemini-3.1-pro-preview' ? 'Gemini 3.1 Pro' : found.name));
      if (!name || name === selectedSkill?.name) {
        setName(found.name);
      }
      if (!description || description === selectedSkill?.description) {
        setDescription(found.description);
      }
      if (found.inputContract) {
        setInputContract(found.inputContract);
      }
      if (found.outputContract) {
        setOutputContract(found.outputContract);
      }
      if (found.obligations && found.obligations.length > 0) {
        setObligationsText(found.obligations.join('\n'));
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O Nome da Fase é obrigatório.');
      return;
    }
    if (!description.trim()) {
      setError('A Descrição e lista de obrigações (o que precisa ser feito) é obrigatória.');
      return;
    }

    const obligations = obligationsText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const finalGateId = (gateOrder.length === 0 || gateId === '__NEW__')
      ? (customGateName.trim() || 'GATE_0')
      : gateId;

    onAddPhase({
      name: name.trim(),
      description: description.trim(),
      badge: badge.trim() || selectedSkill?.badge || 'Custom Skill',
      gateId: finalGateId,
      inputContract: inputContract.trim() || 'Contrato de entrada customizado',
      outputContract: outputContract.trim() || 'JSON de saída customizado',
      obligations: obligations.length > 0 ? obligations : [description.trim()],
      dependencies: selectedDependencies,
      skillId: selectedSkillId || undefined,
    });

    onClose();
  };

  const toggleDependency = (depId: string) => {
    setSelectedDependencies((prev) =>
      prev.includes(depId) ? prev.filter((id) => id !== depId) : [...prev, depId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Incluir Nova Fase no Pipeline</h2>
              <p className="text-xs text-slate-400">
                Padronização com 4 dimensões: Skill, Obrigações, Entrada e Saída.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 space-y-4 py-4 flex-1 custom-scrollbar">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-600/50 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* VÍNCULO OBRIGATÓRIO: SELEÇÃO DA SKILL EXECUTORA DO CATÁLOGO */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-700/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300">
                <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                <span>Vínculo de Execução: Skill do Catálogo</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {skillsCatalog.length} skills no catálogo
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              As skills são capacidades independentes. Selecione a skill que executará as responsabilidades desta fase:
            </p>

            {skillsCatalog.length === 0 ? (
              <div className="p-3 bg-amber-950/40 border border-amber-600/40 rounded-lg text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold">Nenhuma skill cadastrada ainda no catálogo.</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  As fases executam através de skills. Recomendamos cadastrar suas skills especialistas primeiro para vinculá-las aqui.
                </p>
                {onOpenSkillManager && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSkillManager();
                    }}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Cadastrar Primeira Skill Agora</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                <select
                  value={selectedSkillId}
                  onChange={(e) => handleSelectSkill(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-medium focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  {skillsCatalog.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code ? `[${s.code}] ` : ''}{s.name} — ({s.badge || s.suggestedModel || 'Gemini 3.1 Pro'})
                    </option>
                  ))}
                </select>

                {selectedSkill && (
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-[11px]">
                    <span className="bg-indigo-950/70 border border-indigo-800/50 px-2 py-0.5 rounded text-indigo-300 font-mono text-[10px]">
                      Modelo: {selectedSkill.suggestedModel || 'Gemini 3.1 Pro'}
                    </span>
                    {selectedSkill.reasoningMode && (
                      <span className="bg-purple-950/70 border border-purple-800/50 px-2 py-0.5 rounded text-purple-300 font-mono text-[10px]">
                        reasoning: {selectedSkill.reasoningMode}
                      </span>
                    )}
                    <span className="text-slate-400 truncate max-w-sm">
                      {selectedSkill.coreProfile || selectedSkill.description}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 1. Nome da Fase (Obrigatório) */}
          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1">
              Nome da Fase no Pipeline <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="Ex: Validação Pedagógica e Linguística para 4-6 Anos"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* 2. Descrição e Obrigações (Obrigatório) */}
          <div>
            <label className="text-xs font-semibold text-slate-200 block mb-1">
              Descrição e Obrigações (O que precisa ser feito nessa fase) <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError(null);
              }}
              placeholder="Descreva as responsabilidades, checagens e entregas detalhadas desta fase no processo de geração..."
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Lista de Obrigações / Entregas Linha por Linha */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Lista de Obrigações & Entregas (Uma por linha):
            </label>
            <textarea
              rows={3}
              value={obligationsText}
              onChange={(e) => setObligationsText(e.target.value)}
              placeholder="Checagem 1&#10;Checagem 2&#10;Entrega de documento"
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Gate de Destino */}
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">
                Gate ou Marco do Pipeline:
              </label>
              {gateOrder.length === 0 ? (
                <div>
                  <input
                    type="text"
                    required
                    value={customGateName}
                    onChange={(e) => setCustomGateName(e.target.value)}
                    placeholder="Ex: GATE_0 ou Fase 1 - Ingestão"
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-indigo-500/70 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Como ainda não há gates cadastrados, este será o primeiro marco do pipeline.
                  </p>
                </div>
              ) : (
                <div>
                  <select
                    value={gateId}
                    onChange={(e) => setGateId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {gateOrder.map((g) => (
                      <option key={g} value={g}>
                        {g}: {g === 'GATE_0' ? 'Ingestão e Preflight' : g === 'GATE_1' ? 'Roteiro e Bíblia 3D' : g === 'GATE_2' ? 'Áudio Suno 120BPM' : g === 'GATE_3' ? 'Shots & Curadoria' : g === 'GATE_4' ? 'Finishing & Release' : g}
                      </option>
                    ))}
                    <option value="__NEW__">+ Criar Novo Gate...</option>
                  </select>
                  {gateId === '__NEW__' && (
                    <input
                      type="text"
                      required
                      value={customGateName}
                      onChange={(e) => setCustomGateName(e.target.value)}
                      placeholder="Nome/Código do novo Gate (Ex: GATE_5 ou Pós-Produção)"
                      className="w-full mt-2 px-3 py-2 text-xs bg-slate-950 border border-indigo-500 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Badge de Execução */}
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">
                Identificação do Executor:
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ex: Gemini 3.1 Pro / Inspector COPPA"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 3. Definição da Entrada (Input) */}
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">
                Definição de Entrada (Input recebido):
              </label>
              <input
                type="text"
                value={inputContract}
                onChange={(e) => setInputContract(e.target.value)}
                placeholder="Ex: Letra bruta + Tema do episódio aprovado"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 4. Definição da Saída (Output) */}
            <div>
              <label className="text-xs font-semibold text-slate-200 block mb-1">
                Definição de Saída (Output entregue):
              </label>
              <input
                type="text"
                value={outputContract}
                onChange={(e) => setOutputContract(e.target.value)}
                placeholder="Ex: JSON estruturado com laudo e aprovação"
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Pré-requisitos / Dependências de Pipeline */}
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <label className="text-xs font-semibold text-slate-200">
                Pré-requisitos Obrigatórios (Guarda de Integridade do Pipeline):
              </label>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Selecione quais fases devem estar <strong>aprovadas</strong> antes que esta nova fase possa ser executada:
            </p>
            <div className="max-h-36 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-lg space-y-1 custom-scrollbar">
              {skillsCatalog.map((s) => {
                const isChecked = selectedDependencies.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-900 cursor-pointer text-xs text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDependency(s.id)}
                      className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-900"
                    />
                    <span className="font-mono text-emerald-400 text-[11px]">{s.code}</span>
                    <span className="truncate">{s.name}</span>
                    <span className="text-[10px] text-slate-500 ml-auto">{s.gateId}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Incluir Fase no Pipeline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
