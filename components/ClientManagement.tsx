
import React, { useState } from 'react';
import { Client, User, UserRole } from '../types';
import { Search, Plus, Filter, MoreVertical, X, CheckCircle, AlertCircle, Copy, ExternalLink, Lock, Users, Wallet, Eye } from 'lucide-react';
import { ClientOnboarding } from './ClientOnboarding';

interface ClientManagementProps {
  clients: Client[];
  users: User[]; // for Head/CS assignment
  currentUser: User;
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onAddUser: (user: User) => void;
}

export const ClientManagementView: React.FC<ClientManagementProps> = ({ clients, users, currentUser, onAddClient, onUpdateClient, onAddUser }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED' | 'DEFAULTER'>('ALL');
  
  // New user form state inside drawer
  const [newUser, setNewUser] = useState({ name: '', username: '', password: '' });

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.cnpj?.includes(search);
    const matchesFilter = 
      filter === 'ALL' ? true :
      filter === 'ACTIVE' ? c.isActive && !c.isBlocked :
      filter === 'BLOCKED' ? c.isBlocked :
      filter === 'DEFAULTER' ? c.paymentStatus === 'Inadimplente' || c.paymentStatus === 'Atrasado' : true;
    return matchesSearch && matchesFilter;
  });

  if (showOnboarding) {
    return (
      <div className="p-6">
        <button onClick={() => setShowOnboarding(false)} className="mb-4 text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1">← Voltar</button>
        <ClientOnboarding currentUser={currentUser} users={users} onSaveClient={(c) => { onAddClient(c); setShowOnboarding(false); }} />
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Clientes</h2>
           <p className="text-sm text-gray-500">Gerencie sua base, contratos e acessos.</p>
        </div>
        <button onClick={() => setShowOnboarding(true)} className="bg-chan-pink text-white px-4 py-2 rounded-lg font-bold hover:bg-pink-700 flex items-center gap-2 shadow-lg shadow-pink-200 transition-all">
           <Plus size={18}/> Novo Cliente
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 justify-between items-center">
         <div className="flex gap-2">
            {['ALL', 'ACTIVE', 'DEFAULTER', 'BLOCKED'].map(f => (
               <button 
                 key={f}
                 onClick={() => setFilter(f as any)}
                 className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${filter === f ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
               >
                 {f === 'ALL' ? 'Todos' : f === 'ACTIVE' ? 'Ativos' : f === 'DEFAULTER' ? 'Inadimplentes' : 'Bloqueados'}
               </button>
            ))}
         </div>
         <div className="relative">
            <input 
               value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder="Buscar por nome ou CNPJ..."
               className="pl-10 pr-4 py-2 border rounded-lg text-sm w-72 focus:ring-chan-pink focus:border-chan-pink"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400"/>
         </div>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
         <div className="overflow-y-auto flex-1 custom-scroll">
            <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs sticky top-0 z-10">
                  <tr>
                     <th className="p-4 border-b">Empresa</th>
                     <th className="p-4 border-b">Valor</th>
                     <th className="p-4 border-b">Vencimento</th>
                     <th className="p-4 border-b">Head / CS</th>
                     <th className="p-4 border-b">Situação</th>
                     <th className="p-4 border-b text-right">Ação</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {filteredClients.map(client => (
                     <tr key={client.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setSelectedClient(client)}>
                        <td className="p-4">
                           <div className="flex items-center gap-3">
                              <img src={client.logo} className="w-10 h-10 rounded-full border border-gray-100 bg-white object-cover"/>
                              <div>
                                 <p className="font-bold text-gray-800">{client.name}</p>
                                 <p className="text-xs text-gray-400">{client.cnpj || 'Sem CNPJ'}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-4 font-mono text-gray-700">R$ {client.contractValue.toLocaleString()}</td>
                        <td className="p-4 text-gray-600">Dia {client.paymentDay}</td>
                        <td className="p-4">
                           <div className="flex -space-x-2">
                              {client.assignedHeadId && <img title="Head" src={users.find(u=>u.id===client.assignedHeadId)?.avatar} className="w-6 h-6 rounded-full border-2 border-white"/>}
                              {client.assignedCsId && <img title="CS" src={users.find(u=>u.id===client.assignedCsId)?.avatar} className="w-6 h-6 rounded-full border-2 border-white"/>}
                              {!client.assignedHeadId && !client.assignedCsId && <span className="text-xs text-gray-400 italic">Não atribuído</span>}
                           </div>
                        </td>
                        <td className="p-4">
                           {client.isBlocked ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                                 <Lock size={12}/> BLOQUEADO
                              </span>
                           ) : (
                              <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                 client.paymentStatus === 'Em dia' ? 'bg-green-50 text-green-700 border-green-200' :
                                 'bg-orange-50 text-orange-700 border-orange-200'
                              }`}>
                                 {client.paymentStatus}
                              </span>
                           )}
                        </td>
                        <td className="p-4 text-right">
                           <button className="text-gray-400 hover:text-chan-pink p-2"><Eye size={18}/></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Detailed Drawer */}
      {selectedClient && (
         <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm" onClick={() => setSelectedClient(null)}>
            <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slide-left" onClick={e => e.stopPropagation()}>
               {/* Drawer Header */}
               <div className="p-6 border-b flex justify-between items-start bg-gray-50">
                  <div className="flex items-center gap-4">
                     <img src={selectedClient.logo} className="w-16 h-16 rounded-full border-4 border-white shadow-sm bg-white"/>
                     <div>
                        <h2 className="text-xl font-bold text-gray-800">{selectedClient.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                           <span className={`w-2 h-2 rounded-full ${selectedClient.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                           <span className="text-xs text-gray-500 font-medium uppercase">{selectedClient.isActive ? 'Ativo' : 'Inativo'}</span>
                           {selectedClient.isBlocked && <span className="text-xs text-red-500 font-bold ml-2 flex items-center gap-1"><AlertCircle size={12}/> Bloqueio Automático (+15 dias)</span>}
                        </div>
                     </div>
                  </div>
                  <button onClick={() => setSelectedClient(null)}><X size={24} className="text-gray-400 hover:text-gray-600"/></button>
               </div>

               {/* Drawer Content */}
               <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scroll">
                  
                  {/* General Info */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Wallet size={20} className="text-chan-pink"/> Dados Cadastrais & Financeiros</h3>
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-bold text-gray-500">Status:</span>
                           <button 
                              onClick={() => onUpdateClient({...selectedClient, isActive: !selectedClient.isActive})} 
                              className={`w-10 h-5 rounded-full relative transition-colors ${selectedClient.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                           >
                              <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${selectedClient.isActive ? 'left-6' : 'left-1'}`}></div>
                           </button>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                        <div>
                           <p className="text-xs text-gray-400 uppercase font-bold">CNPJ</p>
                           <p className="font-medium">{selectedClient.cnpj || '-'}</p>
                        </div>
                        <div>
                           <p className="text-xs text-gray-400 uppercase font-bold">Contrato</p>
                           <p className="font-medium">R$ {selectedClient.contractValue}</p>
                        </div>
                        <div>
                           <p className="text-xs text-gray-400 uppercase font-bold">Vencimento</p>
                           <p className="font-medium">Dia {selectedClient.paymentDay}</p>
                        </div>
                        <div>
                           <p className="text-xs text-gray-400 uppercase font-bold">Recorrência</p>
                           <p className="font-medium">{selectedClient.isRecurrent ? 'Mensal' : 'Pontual'}</p>
                        </div>
                        <div className="col-span-2">
                           <p className="text-xs text-gray-400 uppercase font-bold mb-1">Responsável Financeiro</p>
                           <input 
                              className="w-full border rounded p-1 mb-1" 
                              placeholder="Nome" 
                              value={selectedClient.financialContactName || ''} 
                              onChange={e => onUpdateClient({...selectedClient, financialContactName: e.target.value})}
                           />
                           <input 
                              className="w-full border rounded p-1" 
                              placeholder="Email" 
                              value={selectedClient.financialEmail || ''} 
                              onChange={e => onUpdateClient({...selectedClient, financialEmail: e.target.value})}
                           />
                        </div>
                     </div>
                  </div>

                  {/* Team Assignment */}
                  <div>
                     <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4"><Users size={20} className="text-chan-orange"/> Time Responsável</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Head</label>
                           <select 
                              className="w-full border rounded p-2 text-sm bg-white"
                              value={selectedClient.assignedHeadId || ''}
                              onChange={e => onUpdateClient({...selectedClient, assignedHeadId: e.target.value})}
                           >
                              <option value="">Selecione...</option>
                              {users.filter(u => u.role === UserRole.HEAD).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Customer Success (CS)</label>
                           <select 
                              className="w-full border rounded p-2 text-sm bg-white"
                              value={selectedClient.assignedCsId || ''}
                              onChange={e => onUpdateClient({...selectedClient, assignedCsId: e.target.value})}
                           >
                              <option value="">Selecione...</option>
                              {users.filter(u => u.role === UserRole.CS || u.role === UserRole.GERENTE).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                           </select>
                        </div>
                     </div>
                  </div>

                  {/* Links & Files */}
                  <div>
                     <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4"><ExternalLink size={20} className="text-blue-500"/> Links Úteis</h3>
                     <div className="space-y-2">
                        {['driveLink', 'contractLink', 'diagnosticLink'].map((key) => (
                           <div key={key} className="flex gap-2 items-center">
                              <span className="text-xs font-bold uppercase w-24 text-gray-500">{(key as string).replace('Link', '')}</span>
                              <input 
                                 className="flex-1 border rounded p-2 text-sm" 
                                 placeholder="https://..."
                                 value={(selectedClient as any)[key] || ''}
                                 onChange={e => onUpdateClient({...selectedClient, [key]: e.target.value})}
                              />
                              {(selectedClient as any)[key] && (
                                 <a href={(selectedClient as any)[key]} target="_blank" className="p-2 bg-blue-50 text-blue-500 rounded hover:bg-blue-100"><ExternalLink size={16}/></a>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Users */}
                  <div className="pt-6 border-t">
                     <h3 className="text-lg font-bold text-gray-800 mb-4">Usuários de Acesso</h3>
                     <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Novo Usuário</p>
                        <div className="flex gap-2 mb-2">
                           <input className="flex-1 border rounded p-2 text-sm" placeholder="Nome" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}/>
                           <input className="flex-1 border rounded p-2 text-sm" placeholder="Login" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})}/>
                        </div>
                        <div className="flex gap-2">
                           <input className="flex-1 border rounded p-2 text-sm" placeholder="Senha" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}/>
                           <button 
                              onClick={() => {
                                 onAddUser({
                                    id: Date.now().toString(),
                                    name: newUser.name,
                                    username: newUser.username,
                                    password: newUser.password,
                                    role: UserRole.CLIENTE,
                                    clientId: selectedClient.id,
                                    avatar: `https://ui-avatars.com/api/?name=${newUser.name}`,
                                    isActive: true
                                 });
                                 setNewUser({name:'', username:'', password:''});
                                 alert('Usuário criado');
                              }}
                              className="bg-green-500 text-white px-4 rounded font-bold text-xs"
                           >
                              Criar
                           </button>
                        </div>
                     </div>
                     
                     <div className="space-y-2">
                        {users.filter(u => u.clientId === selectedClient.id).map(u => (
                           <div key={u.id} className="flex justify-between items-center p-3 bg-white border rounded shadow-sm">
                              <div className="flex items-center gap-3">
                                 <img src={u.avatar} className="w-8 h-8 rounded-full"/>
                                 <div>
                                    <p className="text-sm font-bold">{u.name}</p>
                                    <p className="text-xs text-gray-500">@{u.username}</p>
                                 </div>
                              </div>
                              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{u.password}</span>
                           </div>
                        ))}
                     </div>
                  </div>

               </div>
            </div>
         </div>
      )}
    </div>
  );
};
