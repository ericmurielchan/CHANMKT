
import React, { useState } from 'react';
import { Client, User, PurchaseItem, TaskCard } from '../types';
import { DollarSign, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface FinanceViewProps {
  clients: Client[];
  users: User[];
  purchases: PurchaseItem[];
  financialRequests: TaskCard[];
  onUpdateClient: (c: Client) => void;
  onUpdatePurchase: (p: PurchaseItem) => void;
  onApproveRequest: (card: TaskCard) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ clients, users, purchases, financialRequests, onUpdateClient, onUpdatePurchase, onApproveRequest }) => {
  const [tab, setTab] = useState<'RECEIVABLES' | 'PAYABLES' | 'APPROVALS'>('RECEIVABLES');

  const handleRegisterPayment = (client: Client) => {
     if(window.confirm(`Registrar pagamento de ${client.name}? Isso desbloqueará o cliente se estiver bloqueado.`)) {
        onUpdateClient({
           ...client,
           paymentStatus: 'Em dia',
           lastPaymentDate: new Date().toISOString(),
           isBlocked: false // Auto unlock
        });
     }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-6">Financeiro</h2>
      
      <div className="flex gap-4 mb-6">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
            <p className="text-xs text-gray-500 uppercase font-bold">A Receber (Hoje)</p>
            <p className="text-2xl font-bold text-green-600">R$ 15.000</p>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
            <p className="text-xs text-gray-500 uppercase font-bold">A Pagar (Hoje)</p>
            <p className="text-2xl font-bold text-red-600">R$ 4.350</p>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1">
            <p className="text-xs text-gray-500 uppercase font-bold">Inadimplência</p>
            <p className="text-2xl font-bold text-orange-500">R$ 2.000</p>
         </div>
      </div>

      <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg self-start">
         <button onClick={() => setTab('RECEIVABLES')} className={`px-4 py-2 rounded font-bold text-sm ${tab === 'RECEIVABLES' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>A Receber</button>
         <button onClick={() => setTab('PAYABLES')} className={`px-4 py-2 rounded font-bold text-sm ${tab === 'PAYABLES' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}>A Pagar</button>
         <button onClick={() => setTab('APPROVALS')} className={`px-4 py-2 rounded font-bold text-sm ${tab === 'APPROVALS' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Aprovações</button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-y-auto custom-scroll">
         
         {tab === 'RECEIVABLES' && (
            <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                     <th className="p-3">Cliente</th>
                     <th className="p-3">Vencimento</th>
                     <th className="p-3">Valor</th>
                     <th className="p-3">Status</th>
                     <th className="p-3">Ação</th>
                  </tr>
               </thead>
               <tbody>
                  {clients.map(c => (
                     <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-bold">{c.name}</td>
                        <td className="p-3">Dia {c.paymentDay}</td>
                        <td className="p-3">R$ {c.contractValue}</td>
                        <td className="p-3">
                           {c.isBlocked ? (
                              <span className="text-red-600 font-bold flex items-center gap-1"><AlertCircle size={12}/> BLOQUEADO</span>
                           ) : (
                              <span className={`font-bold ${c.paymentStatus === 'Em dia' ? 'text-green-600' : 'text-red-500'}`}>{c.paymentStatus}</span>
                           )}
                        </td>
                        <td className="p-3">
                           <button onClick={() => handleRegisterPayment(c)} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded hover:bg-green-100 text-xs font-bold">
                              Registrar Pagamento
                           </button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         )}

         {tab === 'PAYABLES' && (
            <div>
               <h3 className="font-bold text-gray-700 mb-4">Folha de Pagamento & Compras</h3>
               <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                     <tr>
                        <th className="p-3">Beneficiário</th>
                        <th className="p-3">Tipo</th>
                        <th className="p-3">Valor</th>
                        <th className="p-3">Vencimento</th>
                        <th className="p-3">Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {users.filter(u => u.salary).map(u => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                           <td className="p-3">{u.name}</td>
                           <td className="p-3">Salário</td>
                           <td className="p-3">R$ {u.salary}</td>
                           <td className="p-3">Dia {u.paymentDate}</td>
                           <td className="p-3"><span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded font-bold text-xs">Pendente</span></td>
                        </tr>
                     ))}
                     {purchases.map(p => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                           <td className="p-3">{p.name}</td>
                           <td className="p-3">Compra</td>
                           <td className="p-3">R$ {p.price}</td>
                           <td className="p-3">{new Date(p.date).toLocaleDateString()}</td>
                           <td className="p-3"><span className={`px-2 py-1 rounded font-bold text-xs ${p.status === 'Pago' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>{p.status}</span></td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {tab === 'APPROVALS' && (
            <div>
               <h3 className="font-bold text-gray-700 mb-4">Solicitações Financeiras Pendentes</h3>
               {financialRequests.length === 0 ? <p className="text-gray-400 italic">Nenhuma solicitação pendente.</p> : (
                  <div className="space-y-3">
                     {financialRequests.map(req => (
                        <div key={req.id} className="p-4 border rounded-xl flex justify-between items-center bg-gray-50">
                           <div>
                              <p className="font-bold text-gray-800">{req.title}</p>
                              <p className="text-xs text-gray-500">{req.financialType} • Solicitado por {req.createdBy?.name}</p>
                              <p className="text-sm mt-1">{req.description}</p>
                           </div>
                           <div className="flex gap-2">
                              <button onClick={() => onApproveRequest(req)} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600">Aprovar</button>
                              <button className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200">Rejeitar</button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         )}

      </div>
    </div>
  );
};
