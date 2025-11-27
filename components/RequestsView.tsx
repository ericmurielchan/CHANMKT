
import React from 'react';
import { TaskCard, User } from '../types';
import { MessageSquare, Clock, User as UserIcon, Plus } from 'lucide-react';

interface RequestsViewProps {
  cards: TaskCard[];
  onRequestOpen: (card: TaskCard) => void;
  onNewRequest: () => void;
}

export const RequestsView: React.FC<RequestsViewProps> = ({ cards, onRequestOpen, onNewRequest }) => {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Solicitações</h2>
           <p className="text-sm text-gray-500">Acompanhe as demandas enviadas pelos clientes.</p>
        </div>
        <button onClick={onNewRequest} className="bg-chan-pink text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-pink-700 transition-shadow shadow-lg shadow-pink-200">
           <Plus size={18}/> Nova Solicitação
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-y-auto custom-scroll">
         {/* Inbox / Feed Style */}
         {cards.map(card => {
            const isNew = (Date.now() - new Date(card.history?.[0]?.timestamp || card.dueDate).getTime()) < 86400000;
            const statusColor = card.requestStatus === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                card.requestStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                card.requestStatus === 'NEGOTIATION' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700';

            return (
               <div 
                  key={card.id} 
                  onClick={() => onRequestOpen(card)}
                  className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
               >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${statusColor.split(' ')[0].replace('100', '500')}`}></div>
                  {isNew && <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NOVA</div>}
                  
                  <div className="flex justify-between items-start mb-3 pl-2">
                     <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">#{card.id} • {card.category}</span>
                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-chan-pink transition-colors">{card.title}</h3>
                     </div>
                     <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${statusColor}`}>
                        {card.requestStatus || 'PENDENTE'}
                     </span>
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2 pl-2 mb-4">{card.description}</p>

                  <div className="flex items-center justify-between pl-2 border-t pt-3">
                     <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Clock size={14}/> {new Date(card.dueDate).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><MessageSquare size={14}/> {card.comments.length}</span>
                     </div>
                     {card.createdBy && (
                        <div className="flex items-center gap-2">
                           <span className="text-xs text-gray-500">por <b>{card.createdBy.name}</b></span>
                           <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                              {card.createdBy.name.charAt(0)}
                           </div>
                        </div>
                     )}
                  </div>
               </div>
            )
         })}
      </div>
    </div>
  );
};
