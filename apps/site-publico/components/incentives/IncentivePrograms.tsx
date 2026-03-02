/**
 * ✅ FASE 6.6: IncentivePrograms Component
 * 
 * Lista de programas de incentivo disponíveis
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Target, Gift, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface IncentiveProgram {
  id: string;
  program_key: string;
  program_name: string;
  program_description: string;
  program_type: 'performance' | 'milestone' | 'seasonal' | 'promotional';
  criteria: Record<string, any>;
  reward: {
    type: 'badge' | 'points' | 'bonus' | 'discount';
    value: number;
  };
  is_active: boolean;
  starts_at: Date | null;
  ends_at: Date | null;
  priority: number;
}

interface Props {
  hostId: number;
}

export function IncentivePrograms({ hostId }: Props) {
  const [programs, setPrograms] = useState<IncentiveProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledPrograms, setEnrolledPrograms] = useState<string[]>([]);

  useEffect(() => {
    loadPrograms();
  }, [hostId]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      
      // Buscar programas ativos
      const response = await fetch(`/api/quality/incentives/${hostId}/programs`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPrograms(data.programs || []);
        }
      } else {
        // Fallback: buscar do serviço diretamente (se API não existir)
        const { getActiveIncentivePrograms } = await import('@/lib/quality/incentives.service');
        const activePrograms = await getActiveIncentivePrograms();
        setPrograms(activePrograms as any);
      }
    } catch (error: any) {
      console.error('Erro ao carregar programas:', error);
      toast.error('Erro ao carregar programas de incentivo');
    } finally {
      setLoading(false);
    }
  };

  const enrollInProgram = async (programId: string) => {
    try {
      const response = await fetch(`/api/quality/incentives/${hostId}/programs/${programId}/enroll`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erro ao inscrever-se no programa');
      }

      toast.success('Inscrição realizada com sucesso!');
      setEnrolledPrograms([...enrolledPrograms, programId]);
      loadPrograms();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao inscrever-se no programa');
    }
  };

  const getProgramIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return TrendingUp;
      case 'milestone':
        return Target;
      case 'seasonal':
        return Calendar;
      case 'promotional':
        return Gift;
      default:
        return Gift;
    }
  };

  const getProgramColor = (type: string) => {
    switch (type) {
      case 'performance':
        return 'from-blue-50 to-cyan-50 border-blue-200';
      case 'milestone':
        return 'from-purple-50 to-pink-50 border-purple-200';
      case 'seasonal':
        return 'from-green-50 to-emerald-50 border-green-200';
      case 'promotional':
        return 'from-orange-50 to-yellow-50 border-orange-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-gray-200 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Nenhum programa disponível
        </h3>
        <p className="text-sm text-gray-500">
          Novos programas de incentivo serão anunciados em breve!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Programas de Incentivo</h2>
        <p className="text-sm text-gray-500">
          {programs.length} programa{programs.length !== 1 ? 's' : ''} disponível{programs.length !== 1 ? 'eis' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {programs.map((program) => {
          const Icon = getProgramIcon(program.program_type);
          const isEnrolled = enrolledPrograms.includes(program.id);
          const isActive = program.is_active && 
            (!program.starts_at || new Date(program.starts_at) <= new Date()) &&
            (!program.ends_at || new Date(program.ends_at) >= new Date());

          return (
            <Card
              key={program.id}
              className={`p-6 bg-gradient-to-br ${getProgramColor(program.program_type)} transition-all hover:shadow-lg`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-gray-700" />
                  <div>
                    <h3 className="font-semibold text-lg">{program.program_name}</h3>
                    <span className="text-xs text-gray-600 capitalize">
                      {program.program_type}
                    </span>
                  </div>
                </div>
                {isEnrolled && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>

              <p className="text-sm text-gray-700 mb-4">
                {program.program_description}
              </p>

              {/* Recompensa */}
              <div className="bg-white/50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Recompensa:</span>
                  <span className="text-sm font-bold text-gray-900">
                    {program.reward.value}{' '}
                    {program.reward.type === 'points' ? 'pontos' : 
                     program.reward.type === 'discount' ? '% desconto' :
                     program.reward.type === 'bonus' ? 'R$' : 'badge'}
                  </span>
                </div>
              </div>

              {/* Critérios */}
              {program.criteria && Object.keys(program.criteria).length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">Critérios:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {Object.entries(program.criteria).slice(0, 3).map(([key, value]) => (
                      <li key={key} className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {key}: {String(value)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Datas */}
              {(program.starts_at || program.ends_at) && (
                <div className="text-xs text-gray-500 mb-4">
                  {program.starts_at && (
                    <p>Início: {new Date(program.starts_at).toLocaleDateString('pt-BR')}</p>
                  )}
                  {program.ends_at && (
                    <p>Término: {new Date(program.ends_at).toLocaleDateString('pt-BR')}</p>
                  )}
                </div>
              )}

              {/* Botão de ação */}
              <Button
                variant={isEnrolled ? 'outline' : 'default'}
                disabled={!isActive || isEnrolled}
                onClick={() => enrollInProgram(program.id)}
                className="w-full"
              >
                {isEnrolled ? 'Inscrito' : isActive ? 'Inscrever-se' : 'Indisponível'}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

