
import React, { useState } from 'react';
import { TaskCard, Client, User, PurchaseItem, UserRole } from '../types';
import { ChevronLeft, ChevronRight, X, Calendar as CalIcon } from 'lucide-react';

interface CalendarViewProps {
  cards: TaskCard[];
  clients: Client[];
  users: User[];
  currentUser: User;
  purchases: PurchaseItem[];
  onEventClick: (card: TaskCard) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ cards, clients, currentUser, purchases, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty slots for days before start of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const getDayItems = (date: Date) => {
     const items: any[] = [];
     
     // 1. Tasks
     cards.forEach(card => {
        if (!card.dueDate) return;
        if (isSameDay(new Date(card.dueDate), date)) {
           items.push({ type: 'TASK', data: card });
        }
     });

     // 2. Financial (If authorized)
     if ([UserRole.ADMIN, UserRole.FINANCEIRO].includes(currentUser?.role || UserRole.COLABORADOR)) {
        clients.forEach(c => {
           if (c.paymentDay === date.getDate()) {
              items.push({ type: 'RECEIVABLE', data: c });
           }
        });
        purchases.forEach(p => {
           if (isSameDay(new Date(p.date), date)) items.push({ type: 'PAYABLE', data: p });
        });
     }

     return items;
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold capitalize text-gray-800 flex items-center gap-2">
            <CalIcon className="text-chan-pink"/> {monthName}
         </h2>
         <div className="flex gap-2">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 border rounded hover:bg-gray-50 bg-white shadow-sm"><ChevronLeft size={20}/></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 border rounded hover:bg-gray-50 text-sm font-bold bg-white shadow-sm">Hoje</button>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 border rounded hover:bg-gray-50 bg-white shadow-sm"><ChevronRight size={20}/></button>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
         <div className="grid grid-cols-7 border-b bg-gray-50">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
               <div key={d} className="p-4 text-center font-bold text-gray-500 text-sm uppercase tracking-wider">{d}</div>
            ))}
         </div>
         <div className="grid grid-cols-7 flex-1 auto-rows-fr">
            {days.map((day, idx) => {
               if (!day) return <div key={`empty-${idx}`} className="bg-gray-50/30 border-b border-r min-h-[100px]"></div>;
               
               const items = getDayItems(day);
               const isToday = isSameDay(day, new Date());

               return (
                  <div 
                    key={day.toISOString()} 
                    className={`border-b border-r p-2 min-h-[100px] hover:bg-gray-50 transition-colors cursor-pointer relative group ${isToday ? 'bg-pink-50/10' : ''}`}
                    onClick={() => items.length > 0 && setSelectedDay(day)}
                  >
                     <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-chan-pink text-white shadow-sm' : 'text-gray-700'}`}>
                           {day.getDate()}
                        </span>
                        {items.length > 0 && <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 rounded-full">{items.length}</span>}
                     </div>
                     
                     <div className="space-y-1">
                        {items.slice(0, 3).map((item, i) => (
                           <div 
                              key={i} 
                              onClick={(e) => {
                                 if(item.type === 'TASK') {
                                    e.stopPropagation();
                                    onEventClick(item.data);
                                 }
                              }}
                              className={`text-[10px] px-1.5 py-0.5 rounded truncate font-bold cursor-pointer transition-transform hover:scale-105 ${
                                 item.type === 'TASK' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                                 item.type === 'RECEIVABLE' ? 'bg-green-100 text-green-700 border border-green-200' : 
                                 'bg-red-100 text-red-700 border border-red-200'
                              }`}
                           >
                              {item.type === 'TASK' ? item.data.title : item.data.name}
                           </div>
                        ))}
                        {items.length > 3 && (
                           <div className="text-[10px] text-gray-400 font-bold pl-1">+ {items.length - 3} mais</div>
                        )}
                     </div>
                  </div>
               );
            })}
         </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedDay(null)}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                     <CalIcon size={20} className="text-chan-pink"/>
                     {selectedDay.toLocaleDateString()}
                  </h3>
                  <button onClick={() => setSelectedDay(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
               </div>
               <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scroll pr-1">
                  {getDayItems(selectedDay).length === 0 ? (
                     <p className="text-center text-gray-400 py-4 italic">Nenhum evento neste dia.</p>
                  ) : (
                     getDayItems(selectedDay).map((item, i) => (
                        <div 
                           key={i} 
                           onClick={() => {
                              if(item.type === 'TASK') {
                                 onEventClick(item.data);
                                 setSelectedDay(null);
                              }
                           }}
                           className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer hover:shadow-md transition-all ${
                              item.type === 'TASK' ? 'bg-blue-50 border-blue-100 hover:bg-blue-100' : 
                              item.type === 'RECEIVABLE' ? 'bg-green-50 border-green-100 hover:bg-green-100' : 
                              'bg-red-50 border-red-100 hover:bg-red-100'
                           }`}
                        >
                           <div>
                              <p className="font-bold text-sm text-gray-800">{item.type === 'TASK' ? item.data.title : item.data.name}</p>
                              <p className="text-xs text-gray-500 uppercase font-bold">{item.type === 'TASK' ? 'Tarefa' : item.type === 'RECEIVABLE' ? 'Recebível' : 'Conta a Pagar'}</p>
                           </div>
                           {item.type === 'TASK' && <span className="text-xs px-2 py-1 bg-white rounded border font-medium">{item.data.status}</span>}
                        </div>
                     ))
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
