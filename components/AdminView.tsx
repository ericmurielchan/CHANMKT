
import React, { useState } from 'react';
import { User, Supplier, UserRole } from '../types';
import { Users, Truck, Settings, Lock, Edit3, Trash2, Plus } from 'lucide-react';

interface AdminViewProps {
  users: User[];
  suppliers: Supplier[];
  onAddUser: (u: User) => void;
  onUpdateUser: (u: User) => void;
  onAddSupplier: (s: Supplier) => void;
  onUpdateSupplier: (s: Supplier) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ users, suppliers, onAddUser, onUpdateUser, onAddSupplier, onUpdateSupplier }) => {
  const [tab, setTab] = useState<'USERS' | 'SUPPLIERS' | 'SETTINGS'>('USERS');
  
  // Simple form state for creating users
  const [newUser, setNewUser] = useState<Partial<User>>({ role: UserRole.COLABORADOR, isActive: true });

  return (
    <div className="p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Administrativo</h2>
      
      <div className="flex gap-2 mb-6 border-b">
         {['USERS', 'SUPPLIERS', 'SETTINGS'].map(t => (
            <button 
               key={t}
               onClick={() => setTab(t as any)}
               className={`px-6 py-3 font-bold text-sm border-b-2 transition-colors ${tab === t ? 'border-chan-pink text-chan-pink' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
               {t === 'USERS' ? 'Usuários & Acesso' : t === 'SUPPLIERS' ? 'Fornecedores' : 'Configurações'}
            </button>
         ))}
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-y-auto custom-scroll">
         
         {tab === 'USERS' && (
            <div className="space-y-8">
               {/* Create User */}
               <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-4">Novo Usuário Interno</h3>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                     <input placeholder="Nome" className="border rounded p-2" onChange={e => setNewUser({...newUser, name: e.target.value})} />
                     <input placeholder="Username" className="border rounded p-2" onChange={e => setNewUser({...newUser, username: e.target.value})} />
                     <input placeholder="Senha" type="password" className="border rounded p-2" onChange={e => setNewUser({...newUser, password: e.target.value})} />
                     <select className="border rounded p-2 bg-white" onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
                        {Object.values(UserRole).filter(r => r !== UserRole.CLIENTE).map(r => <option key={r} value={r}>{r}</option>)}
                     </select>
                  </div>
                  <button 
                     onClick={() => {
                        if(newUser.name && newUser.username) {
                           onAddUser({
                              id: Date.now().toString(),
                              avatar: `https://ui-avatars.com/api/?name=${newUser.name}`,
                              ...newUser
                           } as User);
                           alert('Usuário criado');
                        }
                     }}
                     className="bg-gray-800 text-white px-4 py-2 rounded font-bold text-sm"
                  >
                     + Criar Usuário
                  </button>
               </div>

               {/* User List */}
               <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-500 font-bold uppercase text-xs">
                     <tr>
                        <th className="p-3">Nome</th>
                        <th className="p-3">Cargo/Role</th>
                        <th className="p-3">Login</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Ações</th>
                     </tr>
                  </thead>
                  <tbody>
                     {users.filter(u => u.role !== UserRole.CLIENTE).map(u => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                           <td className="p-3 flex items-center gap-2">
                              <img src={u.avatar} className="w-8 h-8 rounded-full"/> {u.name}
                           </td>
                           <td className="p-3"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-bold">{u.role}</span></td>
                           <td className="p-3 text-gray-500">@{u.username}</td>
                           <td className="p-3">
                              <button onClick={() => onUpdateUser({...u, isActive: !u.isActive})} className={`px-2 py-1 rounded text-xs font-bold ${u.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                 {u.isActive ? 'ATIVO' : 'BLOQUEADO'}
                              </button>
                           </td>
                           <td className="p-3 text-right">
                              <button className="text-gray-400 hover:text-gray-600"><Edit3 size={16}/></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {tab === 'SUPPLIERS' && (
            <div>
               <div className="flex justify-end mb-4">
                  <button className="bg-chan-pink text-white px-4 py-2 rounded font-bold text-sm flex items-center gap-2"><Plus size={16}/> Novo Fornecedor</button>
               </div>
               <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-500 font-bold uppercase text-xs">
                     <tr>
                        <th className="p-3">Fornecedor</th>
                        <th className="p-3">Serviço</th>
                        <th className="p-3">Contato</th>
                        <th className="p-3">Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {suppliers.map(s => (
                        <tr key={s.id} className="border-b hover:bg-gray-50">
                           <td className="p-3 font-bold">{s.name}</td>
                           <td className="p-3">{s.serviceType}</td>
                           <td className="p-3">{s.phone}</td>
                           <td className="p-3"><span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold">{s.status}</span></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {tab === 'SETTINGS' && (
            <div className="text-center text-gray-400 py-12">
               <Settings size={48} className="mx-auto mb-4 opacity-20"/>
               <p>Configurações de Serviços, Produtos e Formatos em breve.</p>
            </div>
         )}

      </div>
    </div>
  );
};
