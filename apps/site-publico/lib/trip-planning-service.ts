/**
 * ✅ PLANEJAMENTO DE VIAGEM COLABORATIVO
 * Sistema completo para planejar viagens em grupo com tarefas, cronograma e orçamento
 */

import { queryDatabase } from './db';
import { sendNotification } from './enhanced-notification-service';

export interface TripPlan {
  id: number;
  name: string;
  description?: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget?: number;
  currency: string;
  status: 'planning' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
  members: TripMember[];
  tasks: TripTask[];
  itinerary: TripItineraryItem[];
  expenses: TripExpense[];
  sharedWishlistId?: number;
  groupChatId?: number;
  splitPaymentId?: number;
}

export interface TripMember {
  id: number;
  tripId: number;
  userId?: number;
  email: string;
  name?: string;
  role: 'organizer' | 'member' | 'viewer';
  responsibilities: string[];
  joinedAt: string;
}

export interface TripTask {
  id: number;
  tripId: number;
  title: string;
  description?: string;
  assignedTo?: number;
  assignedToEmail?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
}

export interface TripItineraryItem {
  id: number;
  tripId: number;
  date: string;
  time?: string;
  title: string;
  description?: string;
  location?: string;
  type: 'accommodation' | 'activity' | 'transport' | 'meal' | 'other';
  cost?: number;
  booked: boolean;
  bookingReference?: string;
  createdBy?: number;
  createdAt: string;
}

export interface TripExpense {
  id: number;
  tripId: number;
  category: 'accommodation' | 'transport' | 'food' | 'activities' | 'shopping' | 'other';
  description: string;
  amount: number;
  currency: string;
  paidBy?: number;
  paidByEmail?: string;
  shared: boolean;
  participants: number[];
  createdAt: string;
}

/**
 * Criar plano de viagem
 */
export async function createTripPlan(
  name: string,
  destination: string,
  startDate: Date,
  endDate: Date,
  createdBy: number | undefined,
  options: {
    description?: string;
    budget?: number;
    currency?: string;
  } = {}
): Promise<TripPlan> {
  const result = await queryDatabase(
    `INSERT INTO trip_plans (
      name, description, destination, start_date, end_date,
      budget, currency, created_by, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'planning')
    RETURNING *`,
    [
      name,
      options.description || null,
      destination,
      startDate.toISOString(),
      endDate.toISOString(),
      options.budget || null,
      options.currency || 'BRL',
      createdBy || null,
    ]
  );

  const tripPlan = result[0];

  // Adicionar criador como organizador
  if (createdBy) {
    await queryDatabase(
      `INSERT INTO trip_members (trip_id, user_id, role)
       VALUES ($1, $2, 'organizer')`,
      [tripPlan.id, createdBy]
    );
  }

  return getTripPlan(tripPlan.id, createdBy);
}

/**
 * Obter plano de viagem completo
 */
export async function getTripPlan(
  tripId: number,
  userId?: number
): Promise<TripPlan> {
  const trips = await queryDatabase(
    `SELECT * FROM trip_plans WHERE id = $1`,
    [tripId]
  );

  if (trips.length === 0) {
    throw new Error('Plano de viagem não encontrado');
  }

  const trip = trips[0];

  // Buscar membros
  const members = await queryDatabase(
    `SELECT * FROM trip_members WHERE trip_id = $1`,
    [tripId]
  );

  // Buscar tarefas
  const tasks = await queryDatabase(
    `SELECT * FROM trip_tasks WHERE trip_id = $1 ORDER BY due_date ASC, priority DESC`,
    [tripId]
  );

  // Buscar itinerário
  const itinerary = await queryDatabase(
    `SELECT * FROM trip_itinerary WHERE trip_id = $1 ORDER BY date ASC, time ASC`,
    [tripId]
  );

  // Buscar despesas
  const expenses = await queryDatabase(
    `SELECT * FROM trip_expenses WHERE trip_id = $1 ORDER BY created_at DESC`,
    [tripId]
  );

  return {
    ...trip,
    members: members as TripMember[],
    tasks: tasks as TripTask[],
    itinerary: itinerary as TripItineraryItem[],
    expenses: expenses as TripExpense[],
  };
}

/**
 * Adicionar tarefa ao plano
 */
export async function addTripTask(
  tripId: number,
  title: string,
  options: {
    description?: string;
    assignedTo?: number;
    assignedToEmail?: string;
    priority?: TripTask['priority'];
    dueDate?: Date;
  } = {}
): Promise<TripTask> {
  const result = await queryDatabase(
    `INSERT INTO trip_tasks (
      trip_id, title, description, assigned_to, assigned_to_email,
      priority, due_date, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'todo')
    RETURNING *`,
    [
      tripId,
      title,
      options.description || null,
      options.assignedTo || null,
      options.assignedToEmail || null,
      options.priority || 'medium',
      options.dueDate?.toISOString() || null,
    ]
  );

  const task = result[0];

  // Notificar pessoa atribuída
  if (options.assignedTo || options.assignedToEmail) {
    await sendNotification({
      userId: options.assignedTo,
      type: ['email', 'in_app'],
      templateId: 'trip_task_assigned',
      variables: {
        tripId: tripId.toString(),
        taskTitle: title,
        dueDate: options.dueDate?.toLocaleDateString('pt-BR') || 'Não especificado',
      },
    });
  }

  return task as TripTask;
}

/**
 * Adicionar item ao itinerário
 */
export async function addItineraryItem(
  tripId: number,
  date: Date,
  title: string,
  options: {
    time?: string;
    description?: string;
    location?: string;
    type?: TripItineraryItem['type'];
    cost?: number;
    createdBy?: number;
  } = {}
): Promise<TripItineraryItem> {
  const result = await queryDatabase(
    `INSERT INTO trip_itinerary (
      trip_id, date, time, title, description, location, type, cost, booked, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false, $9)
    RETURNING *`,
    [
      tripId,
      date.toISOString().split('T')[0],
      options.time || null,
      title,
      options.description || null,
      options.location || null,
      options.type || 'activity',
      options.cost || null,
      options.createdBy || null,
    ]
  );

  return result[0] as TripItineraryItem;
}

/**
 * Adicionar despesa
 */
export async function addTripExpense(
  tripId: number,
  category: TripExpense['category'],
  description: string,
  amount: number,
  paidBy: number | undefined,
  paidByEmail: string | undefined,
  options: {
    currency?: string;
    shared?: boolean;
    participants?: number[];
  } = {}
): Promise<TripExpense> {
  const result = await queryDatabase(
    `INSERT INTO trip_expenses (
      trip_id, category, description, amount, currency,
      paid_by, paid_by_email, shared
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      tripId,
      category,
      description,
      amount,
      options.currency || 'BRL',
      paidBy || null,
      paidByEmail || null,
      options.shared !== false,
    ]
  );

  const expense = result[0];

  // Se compartilhada, criar divisão
  if (options.shared && options.participants && options.participants.length > 0) {
    const amountPerPerson = amount / options.participants.length;
    // Criar registros de divisão (implementar tabela trip_expense_splits se necessário)
  }

  return expense as TripExpense;
}

/**
 * Obter resumo financeiro da viagem
 */
export async function getTripFinancialSummary(tripId: number): Promise<{
  totalBudget?: number;
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  expensesByMember: Record<string, number>;
  balance: number;
}> {
  const trip = await queryDatabase(
    `SELECT budget, currency FROM trip_plans WHERE id = $1`,
    [tripId]
  );

  const expenses = await queryDatabase(
    `SELECT category, amount, paid_by, paid_by_email FROM trip_expenses WHERE trip_id = $1`,
    [tripId]
  );

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  
  const expensesByCategory: Record<string, number> = {};
  const expensesByMember: Record<string, number> = {};

  expenses.forEach((expense: any) => {
    expensesByCategory[expense.category] = (expensesByCategory[expense.category] || 0) + parseFloat(expense.amount || 0);
    
    const payer = expense.paid_by_email || `user_${expense.paid_by}`;
    expensesByMember[payer] = (expensesByMember[payer] || 0) + parseFloat(expense.amount || 0);
  });

  return {
    totalBudget: trip[0]?.budget ? parseFloat(trip[0].budget) : undefined,
    totalExpenses,
    expensesByCategory,
    expensesByMember,
    balance: (trip[0]?.budget ? parseFloat(trip[0].budget) : 0) - totalExpenses,
  };
}

/**
 * Convidar membro para o plano
 */
export async function inviteTripMember(
  tripId: number,
  email: string,
  name?: string,
  role: TripMember['role'] = 'member',
  invitedBy?: number
): Promise<TripMember> {
  // Verificar se já é membro
  const existing = await queryDatabase(
    `SELECT * FROM trip_members WHERE trip_id = $1 AND email = $2`,
    [tripId, email]
  );

  if (existing.length > 0) {
    return existing[0] as TripMember;
  }

  const result = await queryDatabase(
    `INSERT INTO trip_members (trip_id, email, name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [tripId, email, name || null, role]
  );

  const member = result[0];

  // Enviar convite
  await sendNotification({
    type: ['email'],
    templateId: 'trip_invitation',
    variables: {
      tripId: tripId.toString(),
      tripName: (await queryDatabase(`SELECT name FROM trip_plans WHERE id = $1`, [tripId]))[0]?.name || 'Viagem',
      invitationLink: `${process.env.NEXT_PUBLIC_APP_URL}/trips/${tripId}/join`,
    },
  });

  return member as TripMember;
}

