
import React, { useState, useRef, useEffect } from 'react';
import { TaskCard, User, Comment, ChecklistItem, TaskCategory, CardStatus, UserRole, HistoryLog, CardLabel } from '../types';
import { 
  X, Save, MoreHorizontal, CheckSquare, MessageSquare, User as UserIcon, 
  Clock, Image, Plus, Upload, CheckCircle, Archive, Play, Pause, Square, 
  Calendar, Box, Paperclip, AlertTriangle, File, Trash2, Tag, Palette
} from 'lucide-react';

interface TaskModalProps {
  card: TaskCard;
  users: User[];
  currentUser: User;
  onClose: () => void;
  onUpdate: (card: TaskCard, logAction?: string) => void;
}

const CATEGORIES: TaskCategory[] = ['Geral', 'Design', 'Redação', 'Vídeo', 'Social Media', 'Tráfego', 'Web', 'Planejamento', 'Financeiro', 'Administrativo'];
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#64748b'];

export const TaskModal: React.FC<TaskModalProps> = ({ card, users, currentUser, onClose, onUpdate }) => {
  const [editingTitle, setEditingTitle] = useState(card.title);
  const [editingDescription, setEditingDescription] = useState(card.description);
  const [newComment, setNewComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [timerDisplay, setTimerDisplay] = useState(0);
  
  // Label State
  const [showLabelInput, setShowLabelInput] = useState(false);
  const [newLabelText, setNewLabelText] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(COLORS[4]);

  // Cover State controls
  const [showCoverControls, setShowCoverControls] = useState(false);
  
  const isClient = currentUser.role === UserRole.CLIENTE;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Sync state when card prop changes (e.g. external update)
  useEffect(() => {
    setEditingTitle(card.title);
    setEditingDescription(card.description);
  }, [card.id]);

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (card.timerStartedAt && !card.isPaused) {
      interval = setInterval(() => {
        const currentSessionHours = (Date.now() - card.timerStartedAt!) / (1000 * 60 * 60);
        const previousHours = card.timeLogs?.reduce((acc, curr) => acc + curr.hours, 0) || 0;
        setTimerDisplay(previousHours + currentSessionHours);
      }, 1000);
    } else {
        const previousHours = card.timeLogs?.reduce((acc, curr) => acc + curr.hours, 0) || 0;
        setTimerDisplay(previousHours);
    }
    return () => clearInterval(interval);
  }, [card.timerStartedAt, card.isPaused, card.timeLogs]);

  const handleUpdate = (updates: Partial<TaskCard>, action: string) => {
    onUpdate({ ...card, ...updates }, action);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text: newComment,
      createdAt: new Date().toISOString()
    };
    handleUpdate({ comments: [...card.comments, comment] }, `comentou: "${newComment.substring(0, 20)}..."`);
    setNewComment('');
  };

  const handleTimer = (action: 'START' | 'PAUSE' | 'STOP') => {
    if (action === 'START') {
      handleUpdate({ timerStartedAt: Date.now(), isPaused: false }, 'iniciou o cronômetro');
    } else {
      const elapsed = (Date.now() - (card.timerStartedAt || Date.now())) / 3600000;
      const newLog = { id: Date.now().toString(), userId: currentUser.id, userName: currentUser.name, hours: elapsed, date: new Date().toISOString() };
      handleUpdate({ 
        timerStartedAt: undefined, 
        isPaused: action === 'PAUSE',
        timeLogs: [...card.timeLogs, newLog] 
      }, action === 'PAUSE' ? `pausou o trabalho após ${elapsed.toFixed(2)}h` : `finalizou sessão de ${elapsed.toFixed(2)}h`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const mockUrl = `file://${file.name}`; 
      handleUpdate({ attachments: [...card.attachments, mockUrl] }, `anexou arquivo: ${file.name}`);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mocking image upload by creating a fake local URL or Base64
      const reader = new FileReader();
      reader.onloadend = () => {
         handleUpdate({ coverImage: reader.result as string, coverColor: undefined }, 'alterou a imagem de capa');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorSelect = (color: string) => {
     handleUpdate({ coverColor: color, coverImage: undefined }, 'alterou a cor da capa');
     setShowCoverControls(false);
  };

  // Label Handlers
  const handleAddLabel = () => {
     if (!newLabelText.trim()) return;
     const newLabel: CardLabel = {
        id: Date.now().toString(),
        text: newLabelText,
        color: newLabelColor
     };
     const currentLabels = card.labels || [];
     handleUpdate({ labels: [...currentLabels, newLabel] }, `adicionou etiqueta "${newLabelText}"`);
     setNewLabelText('');
     setShowLabelInput(false);
  };

  const handleRemoveLabel = (id: string) => {
     const currentLabels = card.labels || [];
     const labelToRemove = currentLabels.find(l => l.id === id);
     handleUpdate({ labels: currentLabels.filter(l => l.id !== id) }, `removeu etiqueta "${labelToRemove?.text}"`);
  };

  // Checklist Handlers
  const toggleChecklist = (item: ChecklistItem) => {
     const newStatus = !item.isCompleted;
     handleUpdate({
        checklist: card.checklist.map(i => i.id === item.id ? { ...i, isCompleted: newStatus } : i)
     }, `${newStatus ? 'concluiu' : 'reabriu'} item do checklist: "${item.text}"`);
  };

  const deleteChecklistItem = (item: ChecklistItem) => {
     handleUpdate({
        checklist: card.checklist.filter(i => i.id !== item.id)
     }, `removeu item do checklist: "${item.text}"`);
  };

  const updateChecklistDate = (item: ChecklistItem, date: string) => {
     handleUpdate({
        checklist: card.checklist.map(i => i.id === item.id ? { ...i, dueDate: date } : i)
     }, `definiu data para item "${item.text}": ${date}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in" onClick={e => e.stopPropagation()}>
        
        {/* Header with Cover */}
        <div className="relative shrink-0 group/cover">
          <div className={`h-36 w-full bg-cover bg-center transition-colors relative ${!card.coverImage && !card.coverColor ? 'bg-gray-100' : ''}`} 
               style={{
                 backgroundImage: card.coverImage ? `url(${card.coverImage})` : undefined,
                 backgroundColor: card.coverColor
               }}>
            
            {/* Close Button */}
            <button onClick={onClose} className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-sm transition-colors z-10">
              <X size={20}/>
            </button>

            {/* Admin Cover Controls */}
            {!isClient && (
               <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover/cover:opacity-100 transition-opacity">
                  <button 
                     onClick={() => setShowCoverControls(!showCoverControls)} 
                     className="bg-white/90 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-white flex items-center gap-2"
                  >
                     <Palette size={14}/> Capa
                  </button>
                  {showCoverControls && (
                     <div className="absolute bottom-10 right-0 bg-white p-3 rounded-xl shadow-xl border border-gray-100 w-64 animate-fade-in z-20">
                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Cores</p>
                        <div className="flex flex-wrap gap-2 mb-4">
                           {COLORS.map(c => (
                              <button 
                                 key={c} 
                                 onClick={() => handleColorSelect(c)}
                                 className="w-6 h-6 rounded-full border border-black/10 hover:scale-110 transition-transform" 
                                 style={{backgroundColor: c}} 
                              />
                           ))}
                           <button onClick={() => handleColorSelect('')} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs text-gray-500 hover:bg-gray-50"><X size={12}/></button>
                        </div>
                        <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Imagem</p>
                        <button onClick={() => coverInputRef.current?.click()} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                           <Image size={14}/> Fazer Upload
                        </button>
                        <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
                     </div>
                  )}
               </div>
            )}
          </div>
          
          <div className="px-8 pt-6 pb-4 border-b bg-white">
            {/* Tags / Labels Row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
               <span className="px-2 py-1 rounded bg-gray-100 text-xs font-bold uppercase text-gray-500 tracking-wider border border-gray-200">
                 {card.category}
               </span>
               <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-white ${
                 card.priority === 'Urgente' ? 'bg-red-500' : card.priority === 'Alta' ? 'bg-orange-500' : 'bg-blue-500'
               }`}>
                 {card.priority}
               </span>
               
               {/* Custom Labels */}
               {card.labels?.map(label => (
                  <span 
                     key={label.id} 
                     className="px-2 py-1 rounded text-xs font-bold text-white flex items-center gap-1 shadow-sm"
                     style={{ backgroundColor: label.color }}
                  >
                     {label.text}
                     {!isClient && (
                        <button onClick={() => handleRemoveLabel(label.id)} className="hover:text-black/50 ml-1 rounded-full p-0.5"><X size={10}/></button>
                     )}
                  </span>
               ))}

               {!isClient && !showLabelInput && (
                  <button onClick={() => setShowLabelInput(true)} className="px-2 py-1 rounded bg-gray-50 border border-dashed border-gray-300 hover:bg-gray-100 text-xs font-bold text-gray-400 flex items-center gap-1 transition-colors">
                     <Plus size={12}/> Tag
                  </button>
               )}
            </div>

            {/* Label Creator Input */}
            {showLabelInput && (
               <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2 animate-fade-in w-full md:w-auto">
                  <Tag size={16} className="text-gray-400"/>
                  <input 
                     autoFocus
                     className="border rounded px-2 py-1 text-sm flex-1 focus:ring-chan-pink focus:border-chan-pink outline-none"
                     placeholder="Nome da etiqueta..."
                     value={newLabelText}
                     onChange={e => setNewLabelText(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleAddLabel()}
                  />
                  <div className="flex gap-1">
                     {COLORS.slice(0, 5).map(c => (
                        <button 
                           key={c}
                           onClick={() => setNewLabelColor(c)}
                           className={`w-5 h-5 rounded-full border-2 transition-transform ${newLabelColor === c ? 'border-gray-600 scale-110' : 'border-transparent'}`}
                           style={{ backgroundColor: c }}
                        />
                     ))}
                  </div>
                  <button onClick={handleAddLabel} className="bg-chan-pink text-white px-3 py-1 rounded text-xs font-bold hover:bg-pink-700">OK</button>
                  <button onClick={() => setShowLabelInput(false)} className="text-gray-400 hover:text-gray-600"><X size={16}/></button>
               </div>
            )}
            
            <div className="flex gap-2 items-center">
               <input 
                 value={editingTitle} 
                 onChange={e => setEditingTitle(e.target.value)}
                 onBlur={() => editingTitle !== card.title && handleUpdate({title: editingTitle}, `alterou o título para "${editingTitle}"`)}
                 readOnly={isClient}
                 className="text-2xl font-bold w-full border-none focus:ring-0 p-0 text-gray-800 placeholder-gray-400 bg-transparent"
               />
            </div>
            <p className="text-xs text-gray-400 mt-1">Criado por {card.createdBy?.name} em {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scroll">
            
            {/* Description */}
            <div className="group">
               <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                     <MoreHorizontal size={16}/> Descrição
                  </div>
                  {!isClient && (
                     <div className="flex items-center gap-2">
                        <button 
                           onClick={() => fileInputRef.current?.click()} 
                           className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-bold flex items-center gap-1 hover:bg-gray-200 transition-colors"
                           title="Anexar arquivo"
                        >
                           <Paperclip size={12}/> Anexar
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                     </div>
                  )}
               </div>
               <textarea 
                 value={editingDescription}
                 onChange={e => setEditingDescription(e.target.value)}
                 onBlur={() => editingDescription !== card.description && handleUpdate({description: editingDescription}, 'atualizou a descrição')}
                 readOnly={isClient}
                 className="w-full min-h-[120px] p-3 rounded-lg border border-gray-200 text-sm text-gray-600 focus:border-chan-pink focus:ring-chan-pink resize-y bg-gray-50/50"
                 placeholder="Adicione detalhes..."
               />
               
               {/* Attachments List */}
               {card.attachments && card.attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                     {card.attachments.map((att, idx) => (
                        <div key={idx} className="bg-gray-100 px-3 py-2 rounded-lg flex items-center gap-2 text-xs border border-gray-200">
                           <File size={14} className="text-gray-500"/>
                           <span className="truncate max-w-[150px]">{att.split('/').pop()}</span>
                           {!isClient && (
                              <button 
                                 onClick={() => handleUpdate({attachments: card.attachments.filter((_, i) => i !== idx)}, `removeu anexo: ${att.split('/').pop()}`)} 
                                 className="text-gray-400 hover:text-red-500 ml-1"
                              >
                                 <X size={12}/>
                              </button>
                           )}
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Checklist */}
            <div>
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-gray-700"><CheckSquare size={16}/> Checklist</div>
                  {!isClient && (
                    <div className="flex gap-2">
                       <input 
                         className="border rounded px-2 py-1 text-xs" 
                         placeholder="Novo item..." 
                         value={newChecklistItem} 
                         onChange={e => setNewChecklistItem(e.target.value)}
                         onKeyDown={e => e.key === 'Enter' && newChecklistItem && (handleUpdate({checklist: [...card.checklist, {id: Date.now().toString(), text: newChecklistItem, isCompleted: false}]}, `adicionou ao checklist: "${newChecklistItem}"`), setNewChecklistItem(''))}
                       />
                       <button onClick={() => newChecklistItem && (handleUpdate({checklist: [...card.checklist, {id: Date.now().toString(), text: newChecklistItem, isCompleted: false}]}, `adicionou ao checklist: "${newChecklistItem}"`), setNewChecklistItem(''))} className="bg-gray-100 p-1 rounded hover:bg-gray-200"><Plus size={16}/></button>
                    </div>
                  )}
               </div>
               <div className="space-y-2">
                  {card.checklist.map(item => (
                     <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded group">
                        <input 
                          type="checkbox" 
                          checked={item.isCompleted} 
                          disabled={isClient}
                          onChange={() => toggleChecklist(item)}
                          className="w-4 h-4 text-chan-pink rounded border-gray-300 focus:ring-chan-pink cursor-pointer"
                        />
                        <span className={`text-sm flex-1 ${item.isCompleted ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.text}</span>
                        {!isClient && <input type="date" className="text-xs border-none bg-transparent text-gray-400 hover:bg-gray-100 rounded px-1" value={item.dueDate || ''} onChange={e => updateChecklistDate(item, e.target.value)} />}
                        {!isClient && <button onClick={() => deleteChecklistItem(item)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"><X size={14}/></button>}
                     </div>
                  ))}
               </div>
            </div>

            {/* Comments & History */}
            <div>
               <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-700"><MessageSquare size={16}/> Comentários & Histórico</div>
               <div className="bg-gray-50 rounded-xl p-4 space-y-4 max-h-96 overflow-y-auto custom-scroll mb-4">
                  {/* Unified History + Comments view, sorted by time */}
                  {(() => {
                     const historyItems = card.history || [];
                     const commentItems = card.comments || [];
                     // Combine and sort
                     const mixed = [
                        ...historyItems.map(h => ({ ...h, _type: 'history' })),
                        ...commentItems.map(c => ({ ...c, _type: 'comment', action: c.text, timestamp: c.createdAt }))
                     ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

                     if (mixed.length === 0) return <p className="text-xs text-gray-400 text-center italic">Nenhuma atividade registrada.</p>;

                     return mixed.map((item: any, idx) => (
                        <div key={idx} className={`flex gap-3 ${item._type === 'history' ? 'opacity-70' : ''}`}>
                           <div className="flex flex-col items-center">
                              {item._type === 'comment' 
                                 ? <img src={item.userAvatar} className="w-8 h-8 rounded-full border border-gray-200"/>
                                 : <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500 font-bold">{item.userName.charAt(0)}</div>
                              }
                           </div>
                           <div className={`flex-1 ${item._type === 'comment' ? 'bg-white p-3 rounded-lg border border-gray-100 shadow-sm' : 'pt-1'}`}>
                              <div className="flex justify-between items-baseline mb-1">
                                 <span className="text-xs font-bold text-gray-900">{item.userName}</span>
                                 <span className="text-[10px] text-gray-400 ml-2">{new Date(item.timestamp).toLocaleString()}</span>
                              </div>
                              <p className={`text-sm ${item._type === 'history' ? 'text-gray-500 italic text-xs' : 'text-gray-700 whitespace-pre-wrap'}`}>
                                 {item.action}
                              </p>
                           </div>
                        </div>
                     ));
                  })()}
               </div>
               
               <form onSubmit={handleAddComment} className="flex gap-2">
                  <img src={currentUser.avatar} className="w-8 h-8 rounded-full"/>
                  <div className="flex-1 relative">
                     <textarea 
                        className="w-full border border-gray-300 rounded-lg p-2 pr-10 text-sm focus:border-chan-pink focus:ring-chan-pink"
                        placeholder="Escreva um comentário... (@ para mencionar)"
                        rows={2}
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAddComment(e)}
                     />
                     <button type="submit" className="absolute right-2 bottom-2 text-chan-pink hover:text-pink-700"><Play size={16} className="rotate-0"/></button>
                  </div>
               </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-gray-50 border-l border-gray-100 p-6 space-y-6 overflow-y-auto custom-scroll">
             
             {/* Status */}
             <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Status</label>
                <select 
                  disabled={isClient}
                  value={card.status} 
                  onChange={e => handleUpdate({status: e.target.value}, `alterou o status para "${e.target.value}"`)}
                  className="w-full text-sm border-gray-300 rounded-lg p-2 bg-white"
                >
                   {Object.values(CardStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>

             {/* Assignees */}
             {!isClient && (
               <div>
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Responsáveis</label>
                  <div className="flex flex-wrap gap-2">
                     {users.filter(u => u.role !== UserRole.CLIENTE).map(u => (
                        <button 
                           key={u.id}
                           onClick={() => {
                              const ids = card.assigneeIds.includes(u.id) 
                                 ? card.assigneeIds.filter(id => id !== u.id) 
                                 : [...card.assigneeIds, u.id];
                              handleUpdate({assigneeIds: ids}, card.assigneeIds.includes(u.id) ? `removeu ${u.name} dos responsáveis` : `atribuiu a ${u.name}`);
                           }}
                           className={`w-8 h-8 rounded-full border-2 overflow-hidden transition-all ${card.assigneeIds.includes(u.id) ? 'border-chan-pink ring-2 ring-pink-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                           title={u.name}
                        >
                           <img src={u.avatar} className="w-full h-full object-cover"/>
                        </button>
                     ))}
                  </div>
               </div>
             )}

             {/* Time Tracker */}
             {!isClient && (
               <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <label className="text-xs font-bold text-gray-400 uppercase block mb-2 flex items-center gap-1"><Clock size={12}/> Tempo Gasto</label>
                  <div className="text-2xl font-mono font-bold text-gray-800 mb-2 text-center">{timerDisplay.toFixed(2)}h</div>
                  <div className="flex gap-2 justify-center">
                     {!card.timerStartedAt ? (
                        <button onClick={() => handleTimer('START')} className="flex-1 bg-green-500 text-white py-1 rounded text-xs font-bold hover:bg-green-600 flex items-center justify-center gap-1"><Play size={12}/> Iniciar</button>
                     ) : (
                        <>
                           <button onClick={() => handleTimer('PAUSE')} className="flex-1 bg-yellow-500 text-white py-1 rounded text-xs font-bold hover:bg-yellow-600 flex items-center justify-center gap-1"><Pause size={12}/> Pausa</button>
                           <button onClick={() => handleTimer('STOP')} className="flex-1 bg-red-500 text-white py-1 rounded text-xs font-bold hover:bg-red-600 flex items-center justify-center gap-1"><Square size={12}/> Parar</button>
                        </>
                     )}
                  </div>
               </div>
             )}

             {/* Dates */}
             <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-2">Data de Entrega</label>
                <input 
                  type="date" 
                  readOnly={isClient}
                  className="w-full border-gray-300 rounded-lg p-2 text-sm"
                  value={card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : ''}
                  onChange={e => handleUpdate({dueDate: e.target.value}, `alterou a data de entrega para ${e.target.value}`)}
                />
             </div>

             {/* Actions */}
             <div className="pt-4 border-t">
               {!isClient && (
                  <button 
                     onClick={() => handleUpdate({status: CardStatus.DONE}, 'concluiu a tarefa')}
                     className="w-full bg-green-50 text-green-700 border border-green-200 py-2 rounded-lg text-sm font-bold hover:bg-green-100 flex items-center justify-center gap-2 mb-2"
                  >
                     <CheckCircle size={16}/> Concluir Tarefa
                  </button>
               )}
               {!isClient && (
                  <button onClick={() => handleUpdate({status: CardStatus.ARCHIVED}, 'arquivou')} className="w-full text-gray-500 hover:text-gray-700 text-xs flex items-center justify-center gap-1 py-2">
                     <Archive size={14}/> Arquivar
                  </button>
               )}
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};
