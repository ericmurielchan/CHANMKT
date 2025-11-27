

import React, { useState, useEffect } from 'react';
import { TaskCard, TaskCategory, User, Client, UserRole } from '../types';
import { ArrowRight, CheckCircle, Paperclip, Calendar, Type, Layout, Video, PenTool, Hash, Monitor, PieChart, FileText, X, Image, Smartphone, MonitorPlay, Printer, Box, DollarSign, Briefcase, User as UserIcon, CreditCard, Coffee, Truck, AlertCircle } from 'lucide-react';

interface RequestWizardProps {
  currentUser: User;
  clients: Client[];
  onClose: () => void;
  onSave: (cardData: Partial<TaskCard>) => void;
  mode?: 'REQUEST' | 'TASK'; 
}

const CATEGORIES: { id: TaskCategory; label: string; icon: any }[] = [
  { id: 'Design', label: 'Design & Criação', icon: Layout },
  { id: 'Redação', label: 'Redação / Copy', icon: PenTool },
  { id: 'Vídeo', label: 'Edição de Vídeo', icon: Video },
  { id: 'Social Media', label: 'Social Media', icon: Hash },
  { id: 'Web', label: 'Web / Landing Page', icon: Monitor },
  { id: 'Tráfego', label: 'Tráfego Pago', icon: PieChart },
  { id: 'Planejamento', label: 'Planejamento', icon: FileText },
  { id: 'Financeiro', label: 'Solicitação Financeira', icon: DollarSign },
  { id: 'Administrativo', label: 'Administrativo', icon: Briefcase },
  { id: 'Geral', label: 'Outra Demanda', icon: Type },
];

const FINANCIAL_TYPES = [
  { id: 'Compra', label: 'Compra de Insumo/Equipamento', icon: CreditCard },
  { id: 'Reembolso', label: 'Reembolso de Despesa', icon: DollarSign },
  { id: 'Transporte', label: 'Auxílio Transporte / Combustível', icon: Truck },
  { id: 'Alimentação', label: 'Vale / Alimentação', icon: Coffee },
  { id: 'Outros', label: 'Outros', icon: Type },
];

const FORMATS = [
  { id: 'Quadrado', label: 'Quadrado (1:1)', icon: Box },
  { id: 'Feed', label: 'Feed (4:5)', icon: Image },
  { id: 'Story', label: 'Story (9:16)', icon: Smartphone },
  { id: 'Reel', label: 'Reel (9:16)', icon: Video },
  { id: 'YouTube', label: 'YouTube (16:9)', icon: MonitorPlay },
  { id: 'TV', label: 'TV / Monitor', icon: Monitor },
  { id: 'Outdoor', label: 'Outdoor', icon: Layout },
  { id: 'A4', label: 'Impresso / A4', icon: Printer },
  { id: 'Personalizado', label: 'Personalizado', icon: PenTool },
];

export const RequestWizard: React.FC<RequestWizardProps> = ({ currentUser, clients, onClose, onSave, mode = 'REQUEST' }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<TaskCard>>({
    title: '',
    description: '',
    category: 'Geral',
    priority: 'Média',
    attachments: [],
    dueDate: '',
    format: '',
    financialType: undefined,
    clientId: currentUser.role === UserRole.CLIENTE ? currentUser.clientId : ''
  });
  const [refLink, setRefLink] = useState('');
  const [customFormat, setCustomFormat] = useState('');
  
  // Validation Errors State
  const [errors, setErrors] = useState<{[key: string]: boolean}>({});

  const isTaskMode = mode === 'TASK';
  const titleText = isTaskMode ? "Nova Tarefa" : "Nova Solicitação";
  const finishButtonText = isTaskMode ? "Criar Tarefa" : "Enviar Solicitação";

  const availableClients = currentUser.role === UserRole.HEAD 
    ? clients.filter(c => c.assignedHeadId === currentUser.id)
    : clients;

  const validateStep = (currentStep: number) => {
    const newErrors: {[key: string]: boolean} = {};
    let isValid = true;

    if (currentStep === 1) {
       if (currentUser.role !== UserRole.CLIENTE && !formData.clientId && formData.category !== 'Financeiro' && formData.category !== 'Administrativo') {
          newErrors.clientId = true;
          isValid = false;
       }
    }

    if (currentStep === 2) {
      const isInternalCategory = formData.category === 'Financeiro' || formData.category === 'Administrativo';
      if (!isInternalCategory && !formData.format && !customFormat && !formData.financialType) {
         // If generic category and no format selected
         if(!formData.format) {
            newErrors.format = true; 
            isValid = false;
         }
      }
      if (formData.format === 'Personalizado' && !customFormat) {
         newErrors.customFormat = true;
         isValid = false;
      }
    }

    if (currentStep === 3) {
       if (!formData.title?.trim()) { newErrors.title = true; isValid = false; }
       if (!formData.description?.trim()) { newErrors.description = true; isValid = false; }
    }

    if (currentStep === 5) {
       if (!formData.dueDate) { newErrors.dueDate = true; isValid = false; }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;

    const isInternalCategory = formData.category === 'Financeiro' || formData.category === 'Administrativo';
    const isPlanning = formData.category === 'Planejamento';
    
    // Skip format step for Planning
    if (step === 1 && isPlanning) {
       setStep(3); // Jump to Details
       return;
    }

    setStep(step + 1);
  };

  const handleFinish = () => {
    if (!validateStep(step)) return;
    
    const finalFormat = formData.format === 'Personalizado' ? customFormat : formData.format;

    // Combine link into description
    const finalData: Partial<TaskCard> = {
      ...formData,
      format: finalFormat,
      description: refLink ? `${formData.description}\n\nReferência: ${refLink}` : formData.description,
      // If Planning, set planning status
      planningStatus: formData.category === 'Planejamento' ? 'WAITING_APPROVAL' : undefined
    };
    
    onSave(finalData);
  };

  const isFinancial = formData.category === 'Financeiro';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        
        {/* Header */}
        <div className="bg-gray-50 p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{titleText}</h2>
            <p className="text-sm text-gray-500">Passo {step} de 5</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-1">
          <div 
            className="bg-chan-pink h-1 transition-all duration-300" 
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto flex-1 custom-scroll">
          
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              
              {/* Client Selection for Non-Clients */}
              {currentUser.role !== UserRole.CLIENTE && (
                <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Cliente / Contexto <span className="text-red-500">*</span></label>
                   <select 
                      className={`w-full border rounded-lg p-3 focus:ring-chan-pink focus:border-chan-pink bg-white ${errors.clientId ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                      value={formData.clientId}
                      onChange={e => { setFormData({...formData, clientId: e.target.value}); setErrors({...errors, clientId: false}); }}
                   >
                      <option value="">Selecione...</option>
                      <option value="INTERNAL">Interno / Agência</option>
                      {availableClients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                   </select>
                   {errors.clientId && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle size={12}/> Campo obrigatório</p>}
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold mb-4 text-center">Qual o tipo da demanda?</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setFormData({ ...formData, category: cat.id });
                      }}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all hover:shadow-md ${
                        formData.category === cat.id 
                          ? 'border-chan-pink bg-pink-50 text-chan-pink' 
                          : 'border-gray-100 hover:border-chan-pink/50 text-gray-600'
                      }`}
                    >
                      <cat.icon size={28} />
                      <span className="text-xs font-bold text-center">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              {isFinancial ? (
                <>
                  <h3 className="text-lg font-bold mb-4 text-center">Tipo de Solicitação Financeira</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {FINANCIAL_TYPES.map(ft => (
                        <button
                          key={ft.id}
                          onClick={() => setFormData({ ...formData, financialType: ft.id as any })}
                          className={`p-4 rounded-lg border flex items-center gap-3 transition-colors ${
                            formData.financialType === ft.id
                            ? 'border-chan-pink bg-pink-50 text-chan-pink font-bold'
                            : 'border-gray-200 hover:border-chan-pink/50 text-gray-600'
                          }`}
                        >
                          <ft.icon size={24} />
                          <span className="text-sm">{ft.label}</span>
                        </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold mb-4 text-center">Qual o formato de entrega? <span className="text-red-500">*</span></h3>
                  <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 p-2 rounded-lg ${errors.format ? 'border border-red-500 bg-red-50/20' : ''}`}>
                    {FORMATS.map(fmt => (
                        <button
                          key={fmt.id}
                          onClick={() => { setFormData({ ...formData, format: fmt.id }); setErrors({...errors, format: false}); }}
                          className={`p-3 rounded-lg border flex items-center gap-3 transition-colors ${
                            formData.format === fmt.id
                            ? 'border-chan-pink bg-pink-50 text-chan-pink font-bold'
                            : 'border-gray-200 hover:border-chan-pink/50 text-gray-600'
                          }`}
                        >
                          <fmt.icon size={20} />
                          <span className="text-sm">{fmt.label}</span>
                        </button>
                    ))}
                  </div>
                  {errors.format && <p className="text-red-500 text-xs text-center mb-4">Selecione um formato acima.</p>}
                  
                  {formData.format === 'Personalizado' && (
                    <div className="mt-4 animate-fade-in">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Descreva o formato <span className="text-red-500">*</span></label>
                      <input 
                        autoFocus
                        className={`w-full border rounded-lg p-3 focus:ring-chan-pink focus:border-chan-pink ${errors.customFormat ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Ex: Banner 300x600px, PDF interativo..."
                        value={customFormat}
                        onChange={e => { setCustomFormat(e.target.value); setErrors({...errors, customFormat: false}); }}
                      />
                      {errors.customFormat && <p className="text-red-500 text-xs mt-1">Descreva o formato personalizado.</p>}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-lg font-bold mb-2">Detalhes</h3>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título (O que é?) <span className="text-red-500">*</span></label>
                <input 
                  autoFocus
                  className={`w-full border rounded-lg p-3 focus:ring-chan-pink focus:border-chan-pink ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder={isFinancial ? "Ex: Reembolso Uber Reunião" : "Ex: Post para dia das Mães..."}
                  value={formData.title}
                  onChange={e => { setFormData({ ...formData, title: e.target.value }); setErrors({...errors, title: false}); }}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">Campo obrigatório.</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{isFinancial ? "Justificativa / Detalhes" : "Descrição Detalhada (Briefing)"} <span className="text-red-500">*</span></label>
                <textarea 
                  className={`w-full border rounded-lg p-3 h-32 focus:ring-chan-pink focus:border-chan-pink ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Descreva..."
                  value={formData.description}
                  onChange={e => { setFormData({ ...formData, description: e.target.value }); setErrors({...errors, description: false}); }}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">Campo obrigatório.</p>}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold mb-2">{isFinancial ? "Comprovantes" : "Referências e Materiais"}</h3>
              <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                 <Paperclip className="text-blue-500 mt-1" />
                 <div>
                    <h4 className="font-bold text-blue-700 text-sm">{isFinancial ? "Anexe o Comprovante/NF" : "Tem algum exemplo?"}</h4>
                    <p className="text-xs text-blue-600">{isFinancial ? "Cole o link do Drive com a nota fiscal ou recibo." : "Cole links de referência, pasta do Drive com imagens ou exemplos."}</p>
                 </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Link (Drive/Web)</label>
                <input 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-chan-pink focus:border-chan-pink"
                  placeholder="https://..."
                  value={refLink}
                  onChange={e => setRefLink(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-lg font-bold mb-2">Prazo e Prioridade</h3>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{isFinancial ? "Data do Pagamento/Necessidade" : "Data de Entrega"} <span className="text-red-500">*</span></label>
                <input 
                  type="date"
                  className={`w-full border rounded-lg p-3 focus:ring-chan-pink focus:border-chan-pink ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.dueDate}
                  onChange={e => { setFormData({ ...formData, dueDate: e.target.value }); setErrors({...errors, dueDate: false}); }}
                />
                {errors.dueDate && <p className="text-red-500 text-xs mt-1">Defina uma data.</p>}
                {!isTaskMode && !isFinancial && <p className="text-xs text-gray-400 mt-1">Negociável conforme disponibilidade da agência.</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nível de Urgência</label>
                <div className="flex gap-2">
                  {['Baixa', 'Média', 'Alta', 'Urgente'].map(p => (
                    <button
                      key={p}
                      onClick={() => setFormData({ ...formData, priority: p as any })}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${
                        formData.priority === p 
                          ? 'bg-chan-pink text-white border-chan-pink' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          {step > 1 ? (
            <button 
              onClick={() => setStep(step - 1)}
              className="text-gray-500 font-bold hover:text-gray-800 px-4 py-2"
            >
              Voltar
            </button>
          ) : <div></div>}

          {step < 5 ? (
            <button 
              onClick={handleNext}
              className="bg-chan-pink text-white px-6 py-2 rounded-lg font-bold hover:bg-pink-700 flex items-center gap-2"
            >
              Próximo <ArrowRight size={18} />
            </button>
          ) : (
            <button 
              onClick={handleFinish}
              className="bg-green-500 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-600 flex items-center gap-2 shadow-lg shadow-green-200"
            >
              <CheckCircle size={18} /> {finishButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};