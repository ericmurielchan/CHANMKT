

import React, { useState } from 'react';
import { User, Client, UserRole } from '../types';
import { CheckCircle, Circle, ArrowRight, Save } from 'lucide-react';

interface OnboardingProps {
  currentUser: User;
  onSaveClient: (client: Client) => void;
  users: User[]; // to assign heads
}

export const ClientOnboarding: React.FC<OnboardingProps> = ({ currentUser, onSaveClient, users }) => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    contractValue: 0,
    isRecurrent: true,
    onboardingStep: 0,
    socialMediaAccess: '',
    driveLink: '',
    paymentDay: 5, // default
  });

  const steps = [
    { title: "Dados do Contrato", roles: [UserRole.ADMIN] },
    { title: "Briefing & Resumo", roles: [UserRole.ADMIN, UserRole.GERENTE, UserRole.HEAD] },
    { title: "Materiais & Drive", roles: [UserRole.ADMIN, UserRole.GERENTE, UserRole.HEAD] },
    { title: "Acessos & Plataformas", roles: [UserRole.ADMIN, UserRole.GERENTE] },
    { title: "Atribuição de Equipe", roles: [UserRole.ADMIN, UserRole.GERENTE] }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handleFinish = () => {
    const newClient: Client = {
      id: Date.now().toString(),
      logo: `https://ui-avatars.com/api/?name=${formData.name}&background=ea4d75&color=fff`,
      ...formData as Client,
      onboardingStep: 5,
      isActive: true, // IMPORTANT: Starts active
      paymentStatus: 'Em dia' // IMPORTANT: Starts clean
    };
    onSaveClient(newClient);
    alert('Cliente cadastrado com sucesso! Ele agora está ativo no sistema.');
  };

  const canAccessStep = (stepIndex: number) => {
    return steps[stepIndex].roles.includes(currentUser.role);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Stepper Header */}
      <div className="bg-gray-50 p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Novo Cliente: Onboarding</h2>
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
          {steps.map((s, idx) => (
            <div key={idx} className="flex flex-col items-center bg-gray-50 px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step >= idx ? 'bg-chan-pink text-white' : 'bg-gray-300 text-gray-500'
              }`}>
                {idx + 1}
              </div>
              <span className={`text-xs mt-2 font-medium ${step >= idx ? 'text-chan-pink' : 'text-gray-400'}`}>{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Body */}
      <div className="p-8 min-h-[400px]">
        {!canAccessStep(step) ? (
           <div className="flex flex-col items-center justify-center h-full text-gray-400">
             <Circle size={48} className="mb-4"/>
             <p>Você não tem permissão para visualizar ou editar esta etapa.</p>
             <button onClick={handleNext} className="mt-4 text-chan-pink hover:underline">Pular etapa</button>
           </div>
        ) : (
          <>
            {step === 0 && (
              <div className="space-y-4 animate-fade-in">
                <label className="block">
                  <span className="text-gray-700 font-semibold">Nome da Empresa</span>
                  <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-chan-pink focus:ring focus:ring-chan-pink focus:ring-opacity-50 p-2 border" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-gray-700 font-semibold">Valor do Contrato (R$)</span>
                    <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-chan-pink p-2 border"
                      value={formData.contractValue} onChange={e => setFormData({...formData, contractValue: Number(e.target.value)})} />
                  </label>
                   <label className="block">
                    <span className="text-gray-700 font-semibold">Dia de Vencimento</span>
                    <input type="number" min="1" max="31" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-chan-pink p-2 border"
                      value={formData.paymentDay} onChange={e => setFormData({...formData, paymentDay: Number(e.target.value)})} />
                  </label>
                </div>
                 <label className="block flex items-center mt-6">
                     <input type="checkbox" className="rounded text-chan-pink mr-2 w-5 h-5"
                      checked={formData.isRecurrent} onChange={e => setFormData({...formData, isRecurrent: e.target.checked})} />
                     <span className="text-gray-700">Contrato Recorrente (Mensal)?</span>
                  </label>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                 <label className="block">
                  <span className="text-gray-700 font-semibold">Resumo do Cliente (Público para equipe)</span>
                  <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-chan-pink p-2 border h-32" 
                    placeholder="Objetivos, tom de voz, público alvo..."
                  />
                </label>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                 <label className="block">
                  <span className="text-gray-700 font-semibold">Link da Pasta no Drive</span>
                  <input type="url" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-chan-pink p-2 border" 
                    value={formData.driveLink} onChange={e => setFormData({...formData, driveLink: e.target.value})} placeholder="https://drive.google.com/..." />
                </label>
              </div>
            )}

             {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                 <label className="block">
                  <span className="text-gray-700 font-semibold">Credenciais (Redes Sociais/Ferramentas)</span>
                  <textarea className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-chan-pink p-2 border h-32" 
                    value={formData.socialMediaAccess} onChange={e => setFormData({...formData, socialMediaAccess: e.target.value})} placeholder="Instagram: user/pass..." />
                </label>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-fade-in">
                 <label className="block">
                  <span className="text-gray-700 font-semibold">Atribuir Head Responsável</span>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-chan-pink p-2 border"
                    value={formData.assignedHeadId || ''} onChange={e => setFormData({...formData, assignedHeadId: e.target.value})}
                  >
                    <option value="">Selecione um Head</option>
                    {users.filter(u => u.role === UserRole.HEAD).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-6 border-t flex justify-between">
        <button 
          onClick={() => setStep(Math.max(0, step - 1))} 
          className={`px-6 py-2 rounded text-gray-600 hover:bg-gray-200 ${step === 0 ? 'invisible' : ''}`}
        >
          Voltar
        </button>
        
        {step < steps.length - 1 ? (
          <button 
            onClick={handleNext}
            className="px-6 py-2 rounded bg-gradient-to-r from-chan-pink to-chan-orange text-white hover:opacity-90 flex items-center gap-2"
          >
            Próximo <ArrowRight size={16}/>
          </button>
        ) : (
          <button 
             onClick={handleFinish}
             className="px-6 py-2 rounded bg-green-500 text-white hover:bg-green-600 flex items-center gap-2 shadow-lg shadow-green-200"
          >
            <Save size={16}/> Finalizar Cadastro
          </button>
        )}
      </div>
    </div>
  );
};