
import React, { useState, createContext, useContext, useEffect, useMemo } from 'react';
import { 
  UserRole, User, TaskCard, Client, CardStatus, Supplier, PurchaseItem, HistoryLog, SystemNotification
} from './types';
import { Kanban } from './components/Kanban';
import { Dashboard } from './components/Dashboard';
import { RequestWizard } from './components/RequestWizard';
import { ClientManagementView } from './components/ClientManagement';
import { AdminView } from './components/AdminView';
import { FinanceView } from './components/FinanceView';
import { RequestsView } from './components/RequestsView';
import { CalendarView } from './components/CalendarView';
import { TaskModal } from './components/TaskModal';
import { 
  LayoutDashboard, Briefcase, UserCheck, Bell, Calendar as CalIcon, Users, Star, ShoppingCart, UserCircle, LogOut, ChevronRight, ChevronLeft, Wallet
} from 'lucide-react';

// --- MOCK DATA ---
const TODAY = new Date();
const addDays = (days: number) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const MOCK_USERS: User[] = [
  { id: '1', name: 'Ana Admin', role: UserRole.ADMIN, avatar: 'https://ui-avatars.com/api/?name=Ana+Admin&background=ea4d75&color=fff', username: 'admin', password: '123', jobTitle: 'CEO', salary: 15000, paymentDate: 5, isActive: true },
  { id: '2', name: 'Geraldo Gerente', role: UserRole.GERENTE, avatar: 'https://ui-avatars.com/api/?name=Geraldo&background=d56329&color=fff', username: 'gerente', password: '123', jobTitle: 'Gerente', salary: 8000, isActive: true },
  { id: '3', name: 'Helena Head', role: UserRole.HEAD, avatar: 'https://ui-avatars.com/api/?name=Helena&background=purple&color=fff', username: 'head', password: '123', jobTitle: 'Head Criação', salary: 6000, isActive: true },
  { id: '4', name: 'Carlos Cliente', role: UserRole.CLIENTE, clientId: 'c1', avatar: 'https://ui-avatars.com/api/?name=Carlos&background=blue&color=fff', username: 'cliente', password: '123', jobTitle: 'Cliente', isActive: true },
  { id: '7', name: 'Fernando Financeiro', role: UserRole.FINANCEIRO, avatar: 'https://ui-avatars.com/api/?name=Fernando&background=teal&color=fff', username: 'financeiro', password: '123', jobTitle: 'CFO', salary: 9000, isActive: true },
];

const MOCK_CLIENTS: Client[] = [
  { id: 'c1', name: 'Tech Solutions', contractValue: 5000, isRecurrent: true, onboardingStep: 5, logo: 'https://ui-avatars.com/api/?name=TS', paymentDay: 10, paymentStatus: 'Em dia', isActive: true, assignedHeadId: '3', cnpj: '12.345.678/0001-90', isBlocked: false },
  { id: 'c2', name: 'Burger King Local', contractValue: 2000, isRecurrent: true, onboardingStep: 5, logo: 'https://ui-avatars.com/api/?name=BK', paymentDay: 15, paymentStatus: 'Atrasado', lastPaymentDate: '2023-10-15', isActive: true, assignedHeadId: '3', isBlocked: false },
];

const MOCK_CARDS: TaskCard[] = [
  {
    id: 't1', title: 'Campanha Instagram Black Friday', description: 'Criar 3 posts.', 
    status: CardStatus.DOING, priority: 'Alta', category: 'Social Media', clientId: 'c1', assigneeIds: ['3'], 
    dueDate: addDays(2), tags: [], checklist: [], comments: [], attachments: [], isPaused: false, history: [],
    estimatedHours: 8, timeLogs: [], createdBy: { id: '3', name: 'Helena Head', role: 'HEAD' }
  },
  {
    id: 't2', title: 'Edição Vídeo Institucional', description: 'Cortes finais.', 
    status: CardStatus.TO_DO, priority: 'Média', category: 'Vídeo', clientId: 'c1', assigneeIds: ['3'], 
    dueDate: addDays(5), tags: [], checklist: [], comments: [], attachments: [], isPaused: false, history: [],
    estimatedHours: 4, timeLogs: [], createdBy: { id: '3', name: 'Helena Head', role: 'HEAD' }
  }
];

interface AppContextType {
  user: User | null;
  login: (u: string, p: string) => boolean;
  logout: () => void;
}
const AppContext = createContext<AppContextType>({} as AppContextType);

const Sidebar = ({ currentView, setView, role }: { currentView: string, setView: (v: string) => void, role: UserRole }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useContext(AppContext);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: Object.values(UserRole) },
    { id: 'kanban', icon: Briefcase, label: 'Projetos', roles: [UserRole.ADMIN, UserRole.GERENTE, UserRole.HEAD, UserRole.COLABORADOR, UserRole.CS] },
    { id: 'requests', icon: Bell, label: 'Solicitações', roles: Object.values(UserRole) },
    { id: 'calendar', icon: CalIcon, label: 'Calendário', roles: Object.values(UserRole) },
    { id: 'clients', icon: Users, label: 'Clientes', roles: [UserRole.ADMIN, UserRole.GERENTE, UserRole.HEAD, UserRole.CS, UserRole.FINANCEIRO] },
    { id: 'admin', icon: Star, label: 'Administrativo', roles: [UserRole.ADMIN] },
    { id: 'finance', icon: Wallet, label: 'Financeiro', roles: [UserRole.ADMIN, UserRole.FINANCEIRO] },
    { id: 'profile', icon: UserCircle, label: 'Perfil', roles: Object.values(UserRole) },
  ];

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 z-50 shadow-sm`}>
      <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-8 w-6 h-6 bg-white border rounded-full flex items-center justify-center text-gray-500 z-50 shadow-sm hover:text-chan-pink">
          {collapsed ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>}
      </button>
      <div className={`p-6 flex items-center ${collapsed ? 'justify-center' : 'gap-3'} border-b border-gray-100`}>
        <div className="w-8 h-8 bg-gradient-to-br from-chan-pink to-chan-orange rounded text-white flex items-center justify-center font-bold shrink-0 shadow-sm">CH</div>
        {!collapsed && <span className="font-bold text-lg text-gray-800 tracking-tight">Agência Chan</span>}
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scroll">
        {menuItems.filter(item => item.roles.includes(role)).map(item => (
          <button key={item.id} onClick={() => setView(item.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${currentView === item.id ? 'bg-pink-50 text-chan-pink shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:pl-4'} ${collapsed ? 'justify-center' : ''}`}>
            <item.icon size={20} className={currentView === item.id ? 'text-chan-pink' : 'text-gray-400'}/>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </div>
      <div className="p-4 border-t bg-gray-50"><button onClick={logout} className="w-full flex items-center gap-2 text-sm text-red-500 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors"><LogOut size={18}/> {!collapsed && 'Sair'}</button></div>
    </aside>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [cards, setCards] = useState<TaskCard[]>(MOCK_CARDS);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [currentView, setCurrentView] = useState('dashboard');
  
  const [activeTaskCard, setActiveTaskCard] = useState<TaskCard | null>(null);
  const [wizardState, setWizardState] = useState({ isOpen: false, mode: 'REQUEST' as 'REQUEST' | 'TASK', targetColumn: '' });

  useEffect(() => {
    // Simulated Auto-block logic
    setClients(prev => prev.map(c => {
       if ((c.paymentStatus === 'Atrasado' || c.paymentStatus === 'Inadimplente') && !c.isBlocked) {
          return { ...c, isBlocked: true }; 
       }
       return c;
    }));
  }, []);

  const login = (username: string, pass: string) => {
    const u = users.find(user => user.username === username && user.password === pass);
    if (u) {
       setUser(u);
       setCurrentView(u.role === UserRole.CLIENTE ? 'requests' : 'dashboard');
       return true;
    }
    return false;
  };

  const handleUpdateCard = (card: TaskCard, log?: string) => {
     let updatedCard = { ...card };
     if (log && user) {
        updatedCard.history = [...(card.history || []), { 
           id: Date.now().toString(), userId: user.id, userName: user.name, action: log, timestamp: new Date().toISOString(), type: 'SYSTEM'
        }];
     }
     setCards(prev => prev.map(c => c.id === card.id ? updatedCard : c));
     if (activeTaskCard?.id === card.id) setActiveTaskCard(updatedCard);
  };

  const handleAddCard = (data: Partial<TaskCard>, status: string = CardStatus.BACKLOG) => {
     const newCard: TaskCard = {
        id: Date.now().toString(),
        title: data.title || 'Nova Tarefa',
        description: data.description || '',
        status: status as CardStatus,
        priority: data.priority || 'Média',
        category: data.category || 'Geral',
        clientId: data.clientId || (user?.clientId || clients[0].id),
        assigneeIds: [],
        dueDate: data.dueDate || new Date().toISOString(),
        tags: [], checklist: [], comments: [], history: [], attachments: [], isPaused: false, estimatedHours: 0, timeLogs: [],
        createdBy: { id: user?.id || 'sys', name: user?.name || 'Sistema', role: user?.role || 'SYS' },
        requestStatus: 'PENDING',
        ...data
     };
     setCards(prev => [...prev, newCard]);
  };

  if (!user) {
     return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
           <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
              <div className="flex justify-center mb-6">
                 <div className="w-16 h-16 bg-chan-pink text-white rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg shadow-pink-200">CH</div>
              </div>
              <h1 className="text-2xl font-bold mb-1 text-center text-gray-800">Bem-vindo(a)</h1>
              <p className="text-center text-gray-500 text-sm mb-8">Faça login para acessar o Agência Chan Manager</p>
              <form onSubmit={(e) => {
                 e.preventDefault();
                 const form = e.target as any;
                 if(!login(form.username.value, form.password.value)) alert('Credenciais inválidas. Tente admin/123');
              }} className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Usuário</label>
                    <input name="username" className="w-full border-gray-300 p-3 rounded-lg bg-gray-50 focus:bg-white focus:ring-chan-pink focus:border-chan-pink transition-all" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 uppercase">Senha</label>
                    <input name="password" type="password" className="w-full border-gray-300 p-3 rounded-lg bg-gray-50 focus:bg-white focus:ring-chan-pink focus:border-chan-pink transition-all" />
                 </div>
                 <button className="w-full bg-chan-pink text-white py-3 rounded-lg font-bold hover:bg-pink-700 shadow-md transition-all active:scale-95">Entrar</button>
              </form>
           </div>
        </div>
     )
  }

  const accessibleCards = cards.filter(c => {
     if (user.role === UserRole.CLIENTE) return c.clientId === user.clientId;
     if (user.role === UserRole.HEAD) return clients.filter(cl => cl.assignedHeadId === user.id).map(cl => cl.id).includes(c.clientId);
     if (user.role === UserRole.COLABORADOR) return c.assigneeIds.includes(user.id);
     return true;
  });

  return (
    <AppContext.Provider value={{ user, login, logout: () => setUser(null) }}>
      <div className="flex h-screen bg-[#f4f4f4] text-gray-800 font-sans overflow-hidden">
        <Sidebar currentView={currentView} setView={setCurrentView} role={user.role} />
        
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
           
           {/* HEADER */}
           <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
              <h2 className="text-xl font-bold text-gray-800 capitalize flex items-center gap-2">
                 {currentView === 'dashboard' && <LayoutDashboard className="text-gray-400" size={20}/>}
                 {currentView === 'kanban' && <Briefcase className="text-gray-400" size={20}/>}
                 {currentView === 'requests' && <Bell className="text-gray-400" size={20}/>}
                 {currentView === 'clients' && <Users className="text-gray-400" size={20}/>}
                 {currentView === 'admin' && <Star className="text-gray-400" size={20}/>}
                 {currentView === 'finance' && <Wallet className="text-gray-400" size={20}/>}
                 {currentView === 'calendar' && <CalIcon className="text-gray-400" size={20}/>}
                 {currentView}
              </h2>
              <div className="flex items-center gap-4">
                 <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                 </div>
                 <img src={user.avatar} className="w-10 h-10 rounded-full border-2 border-gray-100 shadow-sm"/>
              </div>
           </header>

           {/* CONTENT AREA */}
           <div className="flex-1 overflow-y-auto p-0 relative">
              {currentView === 'dashboard' && <Dashboard cards={accessibleCards} clients={clients} users={users} currentUser={user} purchases={purchases} />}
              
              {currentView === 'kanban' && (
                 <div className="p-6 h-full flex flex-col">
                    <Kanban 
                       cards={accessibleCards} 
                       users={users} 
                       currentUser={user} 
                       onUpdateCard={handleUpdateCard} 
                       onAddCard={(status) => setWizardState({ isOpen: true, mode: 'TASK', targetColumn: status })}
                       onCardClick={setActiveTaskCard}
                    /> 
                 </div>
              )}

              {currentView === 'requests' && (
                 <RequestsView 
                    cards={accessibleCards.filter(c => c.requestStatus)} 
                    onRequestOpen={setActiveTaskCard}
                    onNewRequest={() => setWizardState({ isOpen: true, mode: 'REQUEST', targetColumn: '' })}
                 />
              )}

              {currentView === 'clients' && (
                 <ClientManagementView 
                    clients={clients} 
                    users={users} 
                    currentUser={user}
                    onAddClient={c => setClients(p => [...p, c])}
                    onUpdateClient={c => setClients(p => p.map(cl => cl.id === c.id ? c : cl))}
                    onAddUser={u => setUsers(p => [...p, u])}
                 />
              )}

              {currentView === 'admin' && (
                 <AdminView 
                    users={users} 
                    suppliers={suppliers} 
                    onAddUser={u => setUsers(p => [...p, u])}
                    onUpdateUser={u => setUsers(p => p.map(us => us.id === u.id ? u : us))}
                    onAddSupplier={s => setSuppliers(p => [...p, s])}
                    onUpdateSupplier={s => setSuppliers(p => p.map(su => su.id === s.id ? s : su))}
                 />
              )}

              {currentView === 'finance' && (
                 <FinanceView 
                    clients={clients} 
                    users={users} 
                    purchases={purchases} 
                    financialRequests={cards.filter(c => c.category === 'Financeiro' && c.requestStatus === 'PENDING')}
                    onUpdateClient={c => setClients(p => p.map(cl => cl.id === c.id ? c : cl))}
                    onUpdatePurchase={pu => setPurchases(p => p.map(pur => pur.id === pu.id ? pu : pur))}
                    onApproveRequest={c => handleUpdateCard({...c, requestStatus: 'ACCEPTED', status: CardStatus.TO_DO})}
                 />
              )}

              {currentView === 'calendar' && (
                 <CalendarView 
                    cards={accessibleCards} 
                    clients={clients} 
                    users={users} 
                    currentUser={user}
                    purchases={purchases} 
                    onEventClick={setActiveTaskCard}
                 />
              )}
           </div>

           {/* OVERLAYS */}
           {activeTaskCard && (
              <TaskModal 
                 card={activeTaskCard} 
                 users={users} 
                 currentUser={user} 
                 onClose={() => setActiveTaskCard(null)} 
                 onUpdate={handleUpdateCard} 
              />
           )}

           {wizardState.isOpen && (
              <RequestWizard 
                 currentUser={user} 
                 clients={clients} 
                 mode={wizardState.mode}
                 onClose={() => setWizardState({...wizardState, isOpen: false})} 
                 onSave={(data) => {
                    handleAddCard(data, wizardState.targetColumn || CardStatus.BACKLOG);
                    setWizardState({...wizardState, isOpen: false});
                 }}
              />
           )}
        </main>
      </div>
    </AppContext.Provider>
  );
}
