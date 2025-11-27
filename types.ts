
export enum UserRole {
  ADMIN = 'ADMIN',
  GERENTE = 'GERENTE',
  HEAD = 'HEAD',
  COLABORADOR = 'COLABORADOR',
  FREELANCER = 'FREELANCER',
  CLIENTE = 'CLIENTE',
  FINANCEIRO = 'FINANCEIRO',
  CS = 'CS' // Customer Success
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  clientId?: string;
  jobTitle?: string;
  username?: string;
  password?: string;
  instagram?: string;
  bio?: string; // New for profile
  banner?: string; // New for profile
  salary?: number;
  paymentDate?: number;
  paymentStatus?: 'Pago' | 'Pendente' | 'Atrasado';
  isActive?: boolean;
  availabilityStatus?: 'DISPONIVEL' | 'LOTADO' | 'FERIAS' | 'AUSENTE';
  unseenCelebrations?: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface HistoryLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  type?: 'SYSTEM' | 'CHAT';
}

export interface ChecklistItem {
  id: string;
  text: string;
  isCompleted: boolean;
  dueDate?: string;
}

export interface TimeLog {
  id: string;
  userId: string;
  userName: string;
  hours: number;
  date: string;
}

export enum CardStatus {
  BACKLOG = 'Backlog',
  TO_DO = 'A Fazer',
  DOING = 'Em Execução',
  REVIEW = 'Revisão',
  DONE = 'Concluído',
  ARCHIVED = 'Arquivado'
}

export type TaskCategory = 'Geral' | 'Design' | 'Redação' | 'Vídeo' | 'Social Media' | 'Tráfego' | 'Web' | 'Planejamento' | 'Financeiro' | 'Administrativo';

export interface CardLabel {
  id: string;
  text: string;
  color: string;
}

export interface TaskCard {
  id: string;
  title: string;
  description: string;
  status: CardStatus | string;
  priority: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  category: TaskCategory;
  clientId: string;
  assigneeIds: string[];
  dueDate: string;
  tags: string[];
  checklist: ChecklistItem[];
  comments: Comment[];
  history: HistoryLog[];
  attachments: string[];
  isPaused: boolean;
  
  labels?: CardLabel[];

  requestStatus?: 'PENDING' | 'ACCEPTED' | 'NEGOTIATION' | 'REJECTED';
  lastInteractionBy?: 'AGENCY' | 'CLIENT';
  
  financialType?: 'Compra' | 'Reembolso' | 'Transporte' | 'Alimentação' | 'Outros';
  financialValue?: number; // New for finance requests
  
  planningStatus?: 'DRAFT' | 'WAITING_APPROVAL' | 'APPROVED' | 'REJECTED';

  createdBy?: { id: string; name: string; role: string };

  estimatedHours: number;
  timeLogs: TimeLog[];
  timerStartedAt?: number;
  completedAt?: string;
  
  coverImage?: string;
  coverColor?: string;
  format?: string;
}

export interface ClientCredential {
  id: string;
  service: string;
  login: string;
  password: string;
}

export interface BrandLink {
  id: string;
  label: string;
  url: string;
}

export interface Client {
  id: string;
  name: string;
  logo: string;
  
  // Contacts
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  financialContactName?: string;
  financialEmail?: string;
  
  // Contract & Finance
  contractValue: number;
  isRecurrent: boolean;
  paymentDay: number;
  lastPaymentDate?: string;
  paymentStatus: 'Em dia' | 'Pendente' | 'Atrasado' | 'Inadimplente';
  isBlocked?: boolean; // New: Auto block > 15 days
  
  // Assignment
  assignedHeadId?: string;
  assignedCsId?: string; // New: CS
  
  // Data
  onboardingStep: number;
  isActive: boolean;
  cnpj?: string;
  address?: string;
  briefing?: string;
  clientSummary?: string;
  
  // Assets
  driveLink?: string;
  contractLink?: string; // New
  diagnosticLink?: string; // New
  socialMediaAccess?: string; // New
  credentials?: ClientCredential[];
  brandLinks?: BrandLink[];
  teamIds?: string[];
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  serviceType: string;
  status: 'Ativo' | 'Inativo';
}

export interface PurchaseItem {
  id: string;
  name: string;
  supplierId: string;
  price: number;
  date: string;
  status: 'Pago' | 'Pendente';
  receiptLink?: string;
  type?: 'Receita' | 'Despesa';
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  linkTo?: string;
}
