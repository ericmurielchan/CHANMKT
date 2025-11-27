
import React from 'react';
import { TaskCard, CardStatus, User, TaskCategory, UserRole } from '../types';
import { Archive, Edit2, CheckSquare, Clock, Calendar, MoreHorizontal, Plus, Paperclip, MessageSquare } from 'lucide-react';

interface KanbanProps {
  cards: TaskCard[];
  users: User[];
  currentUser: User;
  onUpdateCard: (card: TaskCard) => void;
  onAddCard: (status: string) => void;
  onCardClick?: (card: TaskCard) => void; 
}

const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Urgente': return 'bg-red-50 text-red-700 border-red-100';
      case 'Alta': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Média': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      default: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
};

const getPriorityBorderColor = (p: string) => {
    switch (p) {
      case 'Urgente': return 'border-l-red-500';
      case 'Alta': return 'border-l-orange-500';
      case 'Média': return 'border-l-yellow-500';
      default: return 'border-l-emerald-500';
    }
};

const getCategoryColor = (c: TaskCategory) => {
    switch (c) {
      case 'Design': return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'Redação': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Vídeo': return 'text-pink-600 bg-pink-50 border-pink-100';
      case 'Web': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'Tráfego': return 'text-green-600 bg-green-50 border-green-100';
      case 'Financeiro': return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'Administrativo': return 'text-slate-600 bg-slate-100 border-slate-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
};

export const Kanban: React.FC<KanbanProps> = ({ cards, users, currentUser, onUpdateCard, onAddCard, onCardClick }) => {
  const isClient = currentUser.role === UserRole.CLIENTE;
  const columns = [CardStatus.BACKLOG, CardStatus.TO_DO, CardStatus.DOING, CardStatus.REVIEW, CardStatus.DONE];

  const getTotalLoggedTime = (card: TaskCard) => {
    return card.timeLogs?.reduce((acc, curr) => acc + curr.hours, 0) || 0;
  };

  return (
    <div className="flex h-full overflow-x-auto pb-4 gap-6 custom-scroll px-2">
      {columns.map(status => (
        <div key={status} className="flex-shrink-0 w-80 flex flex-col h-full max-h-full">
          {/* Column Header */}
          <div className="flex justify-between items-center mb-4 px-1 sticky top-0 bg-[#f4f4f4] z-10 py-2">
             <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700 text-sm uppercase tracking-wider">{status}</span>
                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{cards.filter(c => c.status === status).length}</span>
             </div>
             {!isClient && (
                <button 
                  onClick={() => onAddCard(status)} 
                  className="text-gray-400 hover:text-chan-pink hover:bg-pink-50 p-1.5 rounded-lg transition-colors"
                  title="Adicionar Tarefa"
                >
                   <Plus size={18}/>
                </button>
             )}
          </div>

          {/* Cards Container */}
          <div className="flex-1 overflow-y-auto custom-scroll space-y-4 pr-1 pb-2">
             {cards.filter(c => c.status === status).map(card => {
                const totalHours = getTotalLoggedTime(card);
                const progress = card.estimatedHours ? Math.min((totalHours / card.estimatedHours) * 100, 100) : 0;
                const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && card.status !== CardStatus.DONE;

                return (
                <div 
                  key={card.id}
                  onClick={() => onCardClick ? onCardClick(card) : null}
                  className={`bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 cursor-pointer transition-all duration-300 group relative flex flex-col ${getPriorityBorderColor(card.priority)} border-l-[4px]`}
                >
                   {/* Cover Preview */}
                   {card.coverImage && (
                      <div className="h-32 w-full bg-cover bg-center rounded-tr-xl mb-0 border-b border-gray-100" style={{backgroundImage: `url(${card.coverImage})`}}></div>
                   )}
                   {!card.coverImage && card.coverColor && (
                      <div className="h-2 w-full opacity-80" style={{backgroundColor: card.coverColor}}></div>
                   )}

                   <div className="p-4 flex flex-col gap-3">
                       {/* Tags & Meta */}
                       <div className="flex flex-wrap gap-2 items-start">
                          {card.category && (
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getCategoryColor(card.category)}`}>
                                {card.category}
                             </span>
                          )}
                          {/* Custom Labels */}
                          {card.labels?.map(l => (
                             <span key={l.id} className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white shadow-sm" style={{backgroundColor: l.color}}>
                                {l.text}
                             </span>
                          ))}
                       </div>

                       {/* Title */}
                       <h4 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-3">
                          {card.title}
                       </h4>
                       
                       {/* Progress Bar (Internal) */}
                       {!isClient && card.estimatedHours > 0 && (
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden" title={`${totalHours.toFixed(1)}h / ${card.estimatedHours}h`}>
                            <div className={`h-full transition-all duration-500 ${progress > 100 ? 'bg-red-400' : 'bg-chan-pink'}`} style={{width: `${progress}%`}}></div>
                          </div>
                       )}

                       {/* Footer Info */}
                       <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-1">
                          {/* Avatars */}
                          <div className="flex -space-x-2">
                             {card.assigneeIds.map(uid => {
                                const u = users.find(us => us.id === uid);
                                return u ? (
                                   <img 
                                      key={uid} 
                                      src={u.avatar} 
                                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm object-cover" 
                                      title={u.name}
                                   />
                                ) : null;
                             })}
                             {card.assigneeIds.length === 0 && <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[10px] bg-gray-50"><Plus size={10}/></div>}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                             {card.attachments.length > 0 && <Paperclip size={14} className="hover:text-chan-pink transition-colors"/>}
                             {card.comments.length > 0 && (
                                <div className="flex items-center gap-1 hover:text-chan-pink transition-colors">
                                   <MessageSquare size={14}/> {card.comments.length}
                                </div>
                             )}
                             {card.dueDate && (
                                <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded' : ''}`}>
                                   <Calendar size={14}/> {new Date(card.dueDate).toLocaleDateString().slice(0,5)}
                                </div>
                             )}
                          </div>
                       </div>
                   </div>
                </div>
             )})}
             
             {/* Empty State */}
             {cards.filter(c => c.status === status).length === 0 && (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 h-24 opacity-60">
                   <span className="text-xs font-medium">Vazio</span>
                </div>
             )}
          </div>
          
          {/* Footer Add Button */}
          {!isClient && (
             <button 
                onClick={() => onAddCard(status)} 
                className="mt-2 py-2.5 rounded-xl text-gray-500 bg-gray-100 hover:bg-white hover:shadow-sm text-sm font-bold flex items-center justify-center gap-2 transition-all group"
             >
                <Plus size={16} className="group-hover:scale-110 transition-transform"/> Adicionar
             </button>
          )}
        </div>
      ))}
    </div>
  );
};
