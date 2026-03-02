"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface Competitor {
  competitor_name: string;
  price: number;
  currency: string;
  availability_status: string;
  scraped_at: string;
}

interface CompetitorTableProps {
  competitors: Competitor[];
  currentPrice: number;
  title?: string;
  description?: string;
}

export function CompetitorTable({
  competitors,
  currentPrice,
  title = 'Tabela de Competidores',
  description,
}: CompetitorTableProps) {
  if (!competitors || competitors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dado de competidor disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number, currency: string = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : 'USD',
    }).format(value);
  };

  const getPriceComparison = (competitorPrice: number) => {
    const diff = currentPrice - competitorPrice;
    const diffPercent = (diff / competitorPrice) * 100;

    if (diff > 0) {
      return {
        icon: <TrendingUp className="h-4 w-4 text-red-600" />,
        text: `+${formatCurrency(Math.abs(diff))} (+${diffPercent.toFixed(1)}%)`,
        color: 'text-red-600',
        badge: <Badge variant="destructive">Mais Caro</Badge>,
      };
    } else if (diff < 0) {
      return {
        icon: <TrendingDown className="h-4 w-4 text-green-600" />,
        text: `-${formatCurrency(Math.abs(diff))} (${diffPercent.toFixed(1)}%)`,
        color: 'text-green-600',
        badge: <Badge className="bg-green-600">Mais Barato</Badge>,
      };
    } else {
      return {
        icon: <DollarSign className="h-4 w-4 text-blue-600" />,
        text: 'Igual',
        color: 'text-blue-600',
        badge: <Badge variant="secondary">Mesmo Preço</Badge>,
      };
    }
  };

  // Ordenar por preço
  const sortedCompetitors = [...competitors].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competidor</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="text-center">Disponibilidade</TableHead>
                <TableHead className="text-right">Comparação</TableHead>
                <TableHead className="text-right">Última Atualização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCompetitors.map((competitor, idx) => {
                const comparison = getPriceComparison(parseFloat(competitor.price));
                const isCurrentPrice = parseFloat(competitor.price) === currentPrice;

                return (
                  <TableRow
                    key={idx}
                    className={
                      isCurrentPrice
                        ? 'bg-blue-50 dark:bg-blue-950'
                        : parseFloat(competitor.price) < currentPrice
                        ? 'bg-green-50 dark:bg-green-950'
                        : 'bg-red-50 dark:bg-red-950'
                    }
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {competitor.competitor_name}
                        {isCurrentPrice && (
                          <Badge variant="outline" className="text-xs">
                            Você
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(parseFloat(competitor.price), competitor.currency)}
                    </TableCell>
                    <TableCell className="text-center">
                      {competitor.availability_status === 'available' ? (
                        <Badge className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Disponível
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Indisponível
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {comparison.icon}
                        <span className={comparison.color}>{comparison.text}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {new Date(competitor.scraped_at).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Resumo */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Seu Preço</p>
              <p className="text-lg font-bold">{formatCurrency(currentPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Média Competidores</p>
              <p className="text-lg font-bold">
                {formatCurrency(
                  competitors.reduce((sum, c) => sum + parseFloat(c.price), 0) / competitors.length
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Menor Preço</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(Math.min(...competitors.map((c) => parseFloat(c.price))))}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Maior Preço</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(Math.max(...competitors.map((c) => parseFloat(c.price))))}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

