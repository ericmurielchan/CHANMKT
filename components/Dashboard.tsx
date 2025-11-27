
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { TaskCard, Client, CardStatus, User, UserRole, PurchaseItem } from '../types';
import { Clock, CheckCircle, TrendingUp, AlertTriangle, Filter, DollarSign, Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface DashboardProps {
  cards: TaskCard[];
  clients: Client[];
  users: User[];
  currentUser: User;
  purchases?: PurchaseItem[]; // Added for Finance View
}

const COLORS = ['#ea4d75', '#d56329', '#FFBB28', '#00C49F', '#8884d8', '#82ca9d', '#ffc658'];

export const Dashboard: React.FC<DashboardProps> = ({ cards, clients, users, currentUser, purchases = [] }) => {
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // --- VIEW 1: FINANCEIRO ---
  if (currentUser.role === UserRole.FINANCEIRO) {
    const receivable = clients.reduce((acc, c) => acc + (c.isActive ? c.contractValue : 0), 0);
    const payroll = users.reduce((acc, u) => acc + (u.salary || 0), 0);
    const purchasesCost = purchases.filter(p => p.status === 'Pendente').reduce((acc, p) => acc + p.price, 0);
    const totalExpenses = payroll + purchasesCost;
    const balance = receivable - totalExpenses;

    const cashFlowData = [
      { name: 'Receitas', value: receivable, color: '#10b981' },
      { name: 'Despesas', value: totalExpenses, color: '#ef4444' },
    ];

    return (
      <div className="space-y-6 animate-fade-in pb-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Dashboard Financeiro</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                 <p className="text-gray-500 text-sm">Receita Mensal (MRR)</p>
                 <p className="text-2xl font-bold text-green-600">R$ {receivable.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full text-green-600"><ArrowUpCircle size={24}/></div>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                 <p className="text-gray-500 text-sm">Despesas Previstas</p>
                 <p className="text-2xl font-bold text-red-600">R$ {totalExpenses.toLocaleString()}</p>
                 <p className="text-xs text-gray-400">Folha + Compras</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full text-red-600"><ArrowDownCircle size={24}/></div>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                 <p className="text-gray-500 text-sm">Saldo Estimado</p>
                 <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>R$ {balance.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full text-blue-600"><Wallet size={24}/></div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm h-80">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Fluxo de Caixa Estimado</h3>
             <ResponsiveContainer width="100%" height="90%">
              <BarChart data={cashFlowData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip cursor={{fill: '#f4f4f4'}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                   {cashFlowData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // --- VIEW 2: CLIENTE ---
  if (currentUser.role === UserRole.CLIENTE) {
    const myCards = cards; // Already filtered in App.tsx
    const pending = myCards.filter(c => c.requestStatus === 'PENDING' || c.requestStatus === 'NEGOTIATION').length;
    const active = myCards.filter(c => c.status !== CardStatus.BACKLOG && c.status !== CardStatus.DONE && c.status !== CardStatus.ARCHIVED).length;
    const completed = myCards.filter(c => c.status === CardStatus.DONE).length;

    const data = [
       { name: 'Pendente', value: pending, color: '#f59e0b' },
       { name: 'Em Produção', value: active, color: '#3b82f6' },
       { name: 'Entregue', value: completed, color: '#10b981' },
    ];

    return (
       <div className="space-y-6 animate-fade-in pb-10">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Olá, {currentUser.name}!</h2>
            <p className="text-gray-500">Aqui está o resumo das suas demandas.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
               <p className="text-4xl font-bold text-orange-500 mb-2">{pending}</p>
               <p className="text-sm font-bold text-gray-500 uppercase">Solicitações Pendentes</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
               <p className="text-4xl font-bold text-blue-500 mb-2">{active}</p>
               <p className="text-sm font-bold text-gray-500 uppercase">Em Produção</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
               <p className="text-4xl font-bold text-green-500 mb-2">{completed}</p>
               <p className="text-sm font-bold text-gray-500 uppercase">Concluídos</p>
            </div>
         </div>

         <div className="bg-white p-6 rounded-xl shadow-sm h-80">
            <h3 className="font-bold text-gray-700 mb-4">Status das Demandas</h3>
            <ResponsiveContainer width="100%" height="90%">
               <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                     {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
               </PieChart>
            </ResponsiveContainer>
         </div>
       </div>
    )
  }

  // --- VIEW 3: OPERACIONAL (ADMIN, HEAD, COLABORADOR, GERENTE) ---
  
  // Filter Logic
  const filteredCards = useMemo(() => {
    let filtered = cards;
    if (selectedUser !== 'all') {
      filtered = filtered.filter(c => c.assigneeIds.includes(selectedUser));
    } else if (selectedRole !== 'all') {
      const usersInRole = users.filter(u => u.role === selectedRole).map(u => u.id);
      filtered = filtered.filter(c => c.assigneeIds.some(id => usersInRole.includes(id)));
    }
    return filtered;
  }, [cards, users, selectedUser, selectedRole]);
  
  const statusData = Object.values(CardStatus).map(status => ({
    name: status,
    count: filteredCards.filter(c => c.status === status).length
  })).filter(d => d.name !== CardStatus.ARCHIVED);

  const categoryData = filteredCards.reduce((acc, card) => {
    const cat = card.category || 'Geral';
    const found = acc.find(i => i.name === cat);
    if (found) found.value += 1;
    else acc.push({ name: cat, value: 1 });
    return acc;
  }, [] as {name: string, value: number}[]);

  const productivityData = users
    .filter(u => u.role !== UserRole.CLIENTE)
    .filter(u => selectedUser === 'all' || u.id === selectedUser)
    .filter(u => selectedRole === 'all' || u.role === selectedRole)
    .map(user => {
      const totalHours = cards.reduce((sum, card) => {
        const userLogs = card.timeLogs ? card.timeLogs.filter(log => log.userId === user.id) : [];
        return sum + userLogs.reduce((lSum, log) => lSum + log.hours, 0);
      }, 0);
      return { name: user.name.split(' ')[0], hours: totalHours };
    })
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 10);

  const totalTasks = filteredCards.length;
  const lateTasks = filteredCards.filter(c => new Date(c.dueDate) < new Date() && c.status !== CardStatus.DONE).length;
  const onTimeRate = totalTasks > 0 ? Math.round(((totalTasks - lateTasks) / totalTasks) * 100) : 100;
  
  const totalHoursLogged = filteredCards.reduce((sum, c) => {
    const logs = c.timeLogs || [];
    return sum + logs.reduce((l, log) => l + log.hours, 0);
  }, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-500 font-medium">
            <Filter size={20} />
            <span>Filtrar Dashboard:</span>
          </div>
          <select 
            value={selectedRole} 
            onChange={(e) => { setSelectedRole(e.target.value); setSelectedUser('all'); }}
            className="border-gray-300 rounded-lg text-sm p-2 focus:ring-chan-pink focus:border-chan-pink"
          >
            <option value="all">Todos os Cargos</option>
            <option value={UserRole.HEAD}>Heads</option>
            <option value={UserRole.GERENTE}>Gerentes</option>
            <option value={UserRole.COLABORADOR}>Colaboradores</option>
            <option value={UserRole.FREELANCER}>Freelancers</option>
          </select>

          <select 
            value={selectedUser} 
            onChange={(e) => { setSelectedUser(e.target.value); setSelectedRole('all'); }}
            className="border-gray-300 rounded-lg text-sm p-2 focus:ring-chan-pink focus:border-chan-pink"
          >
            <option value="all">Todos os Usuários</option>
            {users.filter(u => u.role !== UserRole.CLIENTE).map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-chan-pink/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium flex items-center gap-2"><CheckCircle size={16} className="text-chan-pink"/> Taxa de Entrega</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{onTimeRate}%</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">Tarefas entregues no prazo</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-chan-orange/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium flex items-center gap-2"><Clock size={16} className="text-chan-orange"/> Horas Produzidas</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{totalHoursLogged.toFixed(1)}h</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">Total filtrado</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-24 h-24 bg-blue-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium flex items-center gap-2"><TrendingUp size={16} className="text-blue-500"/> Volume</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{totalTasks}</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">Tarefas visíveis</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-24 h-24 bg-red-100 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <div>
            <h3 className="text-gray-500 text-sm font-medium flex items-center gap-2"><AlertTriangle size={16} className="text-red-500"/> Atrasos</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{lateTasks}</p>
          </div>
          <p className="text-xs text-gray-400 mt-2">Tarefas vencidas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Productivity Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Produtividade (Top 10)</h3>
            <p className="text-xs text-gray-400 mb-4">Horas trabalhadas por colaborador</p>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={productivityData} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: '#f4f4f4'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                <Bar dataKey="hours" fill="#ea4d75" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
        </div>

        {/* Categories Pie */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96">
          <h3 className="text-lg font-bold text-gray-800 mb-1">Distribuição de Demandas</h3>
          <p className="text-xs text-gray-400 mb-4">Volume de tarefas por categoria</p>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
              <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};