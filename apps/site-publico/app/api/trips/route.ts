import { NextRequest, NextResponse } from 'next/server';
import {
  createTripPlan,
  getTripPlan,
  addTripTask,
  addItineraryItem,
  addTripExpense,
  getTripFinancialSummary,
  inviteTripMember,
} from '@/lib/trip-planning-service';

// GET: Listar ou buscar plano de viagem
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (tripId) {
      const trip = await getTripPlan(parseInt(tripId), userId ? parseInt(userId) : undefined);
      return NextResponse.json({ success: true, data: trip });
    }

    return NextResponse.json(
      { error: 'tripId é obrigatório' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Erro ao buscar plano de viagem:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar plano de viagem' },
      { status: 500 }
    );
  }
}

// POST: Criar plano de viagem
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, destination, startDate, endDate, createdBy, options } = body;

    if (!name || !destination || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, destination, startDate, endDate' },
        { status: 400 }
      );
    }

    const tripPlan = await createTripPlan(
      name,
      destination,
      new Date(startDate),
      new Date(endDate),
      createdBy,
      options || {}
    );

    return NextResponse.json({ success: true, data: tripPlan });
  } catch (error: any) {
    console.error('Erro ao criar plano de viagem:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao criar plano de viagem' },
      { status: 500 }
    );
  }
}

// PUT: Adicionar tarefa, item de itinerário ou despesa
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, tripId, ...data } = body;

    if (!action || !tripId) {
      return NextResponse.json(
        { error: 'action e tripId são obrigatórios' },
        { status: 400 }
      );
    }

    if (action === 'add_task') {
      const task = await addTripTask(tripId, data.title, {
        description: data.description,
        assignedTo: data.assignedTo,
        assignedToEmail: data.assignedToEmail,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      });
      return NextResponse.json({ success: true, data: task });
    }

    if (action === 'add_itinerary_item') {
      const item = await addItineraryItem(tripId, new Date(data.date), data.title, {
        time: data.time,
        description: data.description,
        location: data.location,
        type: data.type,
        cost: data.cost,
        createdBy: data.createdBy,
      });
      return NextResponse.json({ success: true, data: item });
    }

    if (action === 'add_expense') {
      const expense = await addTripExpense(
        tripId,
        data.category,
        data.description,
        data.amount,
        data.paidBy,
        data.paidByEmail,
        {
          currency: data.currency,
          shared: data.shared,
          participants: data.participants,
        }
      );
      return NextResponse.json({ success: true, data: expense });
    }

    if (action === 'invite_member') {
      const member = await inviteTripMember(
        tripId,
        data.email,
        data.name,
        data.role,
        data.invitedBy
      );
      return NextResponse.json({ success: true, data: member });
    }

    return NextResponse.json(
      { error: 'Ação inválida' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Erro ao processar ação:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar ação' },
      { status: 500 }
    );
  }
}

// GET: Resumo financeiro
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { tripId } = body;

    if (!tripId) {
      return NextResponse.json(
        { error: 'tripId é obrigatório' },
        { status: 400 }
      );
    }

    const summary = await getTripFinancialSummary(tripId);
    return NextResponse.json({ success: true, data: summary });
  } catch (error: any) {
    console.error('Erro ao buscar resumo financeiro:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao buscar resumo financeiro' },
      { status: 500 }
    );
  }
}

