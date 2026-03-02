'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, DollarSign, CheckSquare, MapPin, Plus } from 'lucide-react';
import { useToast } from '@/components/providers/toast-wrapper';

interface TripPlan {
  id: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget?: number;
  tasks: Array<{
    id: number;
    title: string;
    status: string;
    priority: string;
    dueDate?: string;
  }>;
  itinerary: Array<{
    id: number;
    date: string;
    title: string;
    type: string;
  }>;
  expenses: Array<{
    id: number;
    description: string;
    amount: number;
    category: string;
  }>;
}

interface TripPlanningInterfaceProps {
  tripId: number;
  userId?: number;
}

export function TripPlanningInterface({ tripId, userId }: TripPlanningInterfaceProps) {
  const { toast } = useToast();
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' });
  const [newExpense, setNewExpense] = useState({ description: '', amount: 0, category: 'other' });

  useEffect(() => {
    loadTripPlan();
  }, [tripId]);

  const loadTripPlan = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/trips?id=${tripId}&userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setTripPlan(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar plano de viagem:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const response = await fetch('/api/trips', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_task',
          tripId,
          title: newTask.title,
          priority: newTask.priority,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewTask({ title: '', priority: 'medium' });
        loadTripPlan();
        toast({
          title: 'Tarefa adicionada',
          description: 'Tarefa criada com sucesso',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao adicionar tarefa',
        variant: 'destructive',
      });
    }
  };

  const addExpense = async () => {
    if (!newExpense.description.trim() || newExpense.amount <= 0) return;

    try {
      const response = await fetch('/api/trips', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_expense',
          tripId,
          category: newExpense.category,
          description: newExpense.description,
          amount: newExpense.amount,
          paidBy: userId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewExpense({ description: '', amount: 0, category: 'other' });
        loadTripPlan();
        toast({
          title: 'Despesa adicionada',
          description: 'Despesa registrada com sucesso',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao adicionar despesa',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!tripPlan) {
    return <div>Plano de viagem não encontrado</div>;
  }

  const totalExpenses = tripPlan.expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBudget = (tripPlan.budget || 0) - totalExpenses;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {tripPlan.name} - {tripPlan.destination}
        </CardTitle>
        <div className="text-sm text-gray-500">
          {new Date(tripPlan.startDate).toLocaleDateString('pt-BR')} -{' '}
          {new Date(tripPlan.endDate).toLocaleDateString('pt-BR')}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="tasks">
          <TabsList>
            <TabsTrigger value="tasks">
              <CheckSquare className="w-4 h-4 mr-2" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="itinerary">
              <Calendar className="w-4 h-4 mr-2" />
              Itinerário
            </TabsTrigger>
            <TabsTrigger value="expenses">
              <DollarSign className="w-4 h-4 mr-2" />
              Despesas
            </TabsTrigger>
            <TabsTrigger value="members">
              <Users className="w-4 h-4 mr-2" />
              Membros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Nova tarefa..."
              />
              <Button onClick={addTask}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {tripPlan.tasks.map((task) => (
                <div key={task.id} className="p-3 border rounded-lg">
                  <div className="font-semibold">{task.title}</div>
                  <div className="text-sm text-gray-500">
                    Prioridade: {task.priority} | Status: {task.status}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="itinerary" className="space-y-2">
            {tripPlan.itinerary.map((item) => (
              <div key={item.id} className="p-3 border rounded-lg">
                <div className="font-semibold">{item.title}</div>
                <div className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString('pt-BR')} - {item.type}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">Orçamento</div>
                <div className="text-xl font-bold">
                  R$ {tripPlan.budget?.toFixed(2) || '0.00'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Gasto</div>
                <div className="text-xl font-bold text-red-600">
                  R$ {totalExpenses.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Restante</div>
                <div className={`text-xl font-bold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  R$ {remainingBudget.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                placeholder="Descrição..."
              />
              <Input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                placeholder="Valor..."
              />
              <Button onClick={addExpense}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {tripPlan.expenses.map((expense) => (
                <div key={expense.id} className="p-3 border rounded-lg">
                  <div className="font-semibold">{expense.description}</div>
                  <div className="text-sm text-gray-500">
                    {expense.category} - R$ {expense.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="members">
            <div className="text-sm text-gray-500">Lista de membros será exibida aqui</div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

