import { render, screen } from '@testing-library/react';
import { MetricCard } from '../ui/MetricCard';

describe('MetricCard', () => {
  test('deve renderizar com dados básicos', () => {
    const props = {
      title: 'Total de Reservas',
      value: '150',
      change: '+12%',
      changeType: 'positive' as const,
      icon: '📊'
    };

    render(<MetricCard {...props} />);

    expect(screen.getByText('Total de Reservas')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  test('deve aplicar classe correta para mudança positiva', () => {
    const props = {
      title: 'Receita',
      value: 'R$ 45.000',
      change: '+8.5%',
      changeType: 'positive' as const,
      icon: '💰'
    };

    render(<MetricCard {...props} />);

    const changeElement = screen.getByText('+8.5%');
    expect(changeElement).toHaveClass('text-green-600');
  });

  test('deve aplicar classe correta para mudança negativa', () => {
    const props = {
      title: 'Taxa de Rejeição',
      value: '35%',
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: '📉'
    };

    render(<MetricCard {...props} />);

    const changeElement = screen.getByText('-2.1%');
    expect(changeElement).toHaveClass('text-red-600');
  });

  test('deve aplicar classe correta para mudança neutra', () => {
    const props = {
      title: 'Usuários Ativos',
      value: '75',
      change: '0%',
      changeType: 'neutral' as const,
      icon: '👥'
    };

    render(<MetricCard {...props} />);

    const changeElement = screen.getByText('0%');
    expect(changeElement).toHaveClass('text-gray-600');
  });

  test('deve renderizar com loading state', () => {
    const props = {
      title: 'Carregando...',
      value: '',
      change: '',
      changeType: 'neutral' as const,
      icon: '⏳',
      loading: true
    };

    render(<MetricCard {...props} />);

    expect(screen.getByText('Carregando...')).toBeInTheDocument();
    expect(screen.getByText('⏳')).toBeInTheDocument();
  });

  test('deve renderizar com link quando fornecido', () => {
    const props = {
      title: 'Ver Detalhes',
      value: '150',
      change: '+12%',
      changeType: 'positive' as const,
      icon: '📊',
      href: '/admin/analytics'
    };

    render(<MetricCard {...props} />);

    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/admin/analytics');
  });

  test('deve aplicar animação quando hover', () => {
    const props = {
      title: 'Card Animado',
      value: '100',
      change: '+5%',
      changeType: 'positive' as const,
      icon: '🎯',
      animated: true
    };

    render(<MetricCard {...props} />);

    const cardElement = screen.getByText('Card Animado').closest('div');
    expect(cardElement).toHaveClass('hover:scale-105');
  });

  test('deve renderizar com cor personalizada', () => {
    const props = {
      title: 'Card Personalizado',
      value: '200',
      change: '+15%',
      changeType: 'positive' as const,
      icon: '🎨',
      color: 'blue'
    };

    render(<MetricCard {...props} />);

    const cardElement = screen.getByText('Card Personalizado').closest('div');
    expect(cardElement).toHaveClass('border-blue-200');
  });

  test('deve ser acessível', () => {
    const props = {
      title: 'Card Acessível',
      value: '300',
      change: '+10%',
      changeType: 'positive' as const,
      icon: '♿'
    };

    render(<MetricCard {...props} />);

    // Verificar se o título é acessível
    expect(screen.getByText('Card Acessível')).toBeInTheDocument();

    // Verificar se o valor é acessível
    expect(screen.getByText('300')).toBeInTheDocument();

    // Verificar se a mudança é acessível
    expect(screen.getByText('+10%')).toBeInTheDocument();
  });

  test('deve renderizar com tooltip quando fornecido', () => {
    const props = {
      title: 'Card com Tooltip',
      value: '400',
      change: '+20%',
      changeType: 'positive' as const,
      icon: '💡',
      tooltip: 'Este é um tooltip explicativo'
    };

    render(<MetricCard {...props} />);

    // Verificar se o tooltip está presente
    expect(screen.getByTitle('Este é um tooltip explicativo')).toBeInTheDocument();
  });
});
