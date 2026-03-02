import React from 'react';
import { motion } from 'framer-motion';
import { designTokens } from '../../styles/design-tokens';

// 🎯 TIPOS DO COMPONENTE BADGE
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  outlined?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
  clickable?: boolean;
  pulse?: boolean;
  dot?: boolean;
}

// 🎨 COMPONENTE BADGE PRINCIPAL
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  rounded = false,
  outlined = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  clickable = false,
  pulse = false,
  dot = false,
  ...props
}) => {
  // 🎨 CLASSES BASE POR VARIANTE
  const variantClasses = {
    primary: outlined 
      ? 'border-primary-500 text-primary-600 bg-primary-50' 
      : 'bg-primary-500 text-white',
    secondary: outlined 
      ? 'border-secondary-500 text-secondary-600 bg-secondary-50' 
      : 'bg-secondary-500 text-white',
    accent: outlined 
      ? 'border-accent-500 text-accent-600 bg-accent-50' 
      : 'bg-accent-500 text-white',
    success: outlined 
      ? 'border-success-500 text-success-600 bg-success-50' 
      : 'bg-success-500 text-white',
    warning: outlined 
      ? 'border-warning-500 text-warning-600 bg-warning-50' 
      : 'bg-warning-500 text-white',
    danger: outlined 
      ? 'border-danger-500 text-danger-600 bg-danger-50' 
      : 'bg-danger-500 text-white',
    neutral: outlined 
      ? 'border-neutral-500 text-neutral-600 bg-neutral-50' 
      : 'bg-neutral-500 text-white',
  };

  // 📏 CLASSES POR TAMANHO
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  // 🔲 CLASSES DE BORDER RADIUS
  const roundedClasses = rounded ? 'rounded-full' : 'rounded-md';

  // 🎭 CLASSES DE BORDA
  const borderClasses = outlined ? 'border-2' : '';

  // 🔄 ESTADOS INTERATIVOS
  const interactiveClasses = {
    clickable: 'cursor-pointer hover:scale-105',
    default: '',
  };

  // 🌟 CLASSES DE PULSE
  const pulseClasses = pulse ? 'animate-pulse' : '';

  // 🎯 CLASSES FINAIS
  const badgeClasses = `
    inline-flex items-center justify-center
    font-medium
    transition-all duration-200
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${roundedClasses}
    ${borderClasses}
    ${interactiveClasses[clickable ? 'clickable' : 'default']}
    ${pulseClasses}
    ${className}
  `.trim();

  // 🎭 ANIMAÇÕES
  const badgeVariants = {
    initial: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.2, ease: designTokens.animations.easing.ease }
    },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2, ease: designTokens.animations.easing.ease }
    },
    hover: clickable ? {
      scale: 1.05,
      transition: { duration: 0.2, ease: designTokens.animations.easing.ease }
    } : {},
    tap: clickable ? {
      scale: 0.95,
      transition: { duration: 0.1, ease: designTokens.animations.easing.ease }
    } : {},
  };

  // 🔴 COMPONENTE DOT
  const Dot = () => (
    <div className={`w-2 h-2 rounded-full mr-2 ${
      outlined ? 'bg-current' : 'bg-white'
    }`} />
  );

  // 🎨 RENDERIZAÇÃO DO CONTEÚDO
  const renderContent = () => {
    const content = (
      <>
        {dot && <Dot />}
        {icon && iconPosition === 'left' && (
          <span className="mr-1.5">{icon}</span>
        )}
        <span>{children}</span>
        {icon && iconPosition === 'right' && (
          <span className="ml-1.5">{icon}</span>
        )}
      </>
    );

    return content;
  };

  // 🎯 RENDERIZAÇÃO DO BADGE
  const BadgeContent = (
    <motion.span
      className={badgeClasses}
      variants={badgeVariants}
      initial="initial"
      animate="animate"
      whileHover={clickable ? "hover" : undefined}
      whileTap={clickable ? "tap" : undefined}
      {...props}
    >
      {renderContent()}
    </motion.span>
  );

  // 🔄 RENDERIZAÇÃO CONDICIONAL BASEADA EM PROPS
  if (clickable && onClick) {
    return (
      <button
        onClick={onClick}
        className="bg-transparent border-none p-0"
        type="button"
      >
        {BadgeContent}
      </button>
    );
  }

  return BadgeContent;
};

// 🎯 COMPONENTES ESPECIALIZADOS PARA CASOS DE USO COMUNS
export const PrimaryBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="primary" {...props} />
);

export const SecondaryBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="secondary" {...props} />
);

export const SuccessBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="success" {...props} />
);

export const WarningBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="warning" {...props} />
);

export const DangerBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="danger" {...props} />
);

export const NeutralBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge variant="neutral" {...props} />
);

// 🎭 COMPONENTES DE BADGE ESPECÍFICOS PARA TURISMO
export const StatusBadge: React.FC<Omit<BadgeProps, 'variant'> & {
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed' | 'draft';
}> = ({ status, ...props }) => {
  const statusConfig = {
    confirmed: { variant: 'success' as const, text: 'Confirmado' },
    pending: { variant: 'warning' as const, text: 'Pendente' },
    cancelled: { variant: 'danger' as const, text: 'Cancelado' },
    completed: { variant: 'primary' as const, text: 'Concluído' },
    draft: { variant: 'neutral' as const, text: 'Rascunho' },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} {...props}>
      {config.text}
    </Badge>
  );
};

export const PriorityBadge: React.FC<Omit<BadgeProps, 'variant'> & {
  priority: 'low' | 'medium' | 'high' | 'urgent';
}> = ({ priority, ...props }) => {
  const priorityConfig = {
    low: { variant: 'neutral' as const, text: 'Baixa' },
    medium: { variant: 'secondary' as const, text: 'Média' },
    high: { variant: 'warning' as const, text: 'Alta' },
    urgent: { variant: 'danger' as const, text: 'Urgente' },
  };

  const config = priorityConfig[priority];

  return (
    <Badge variant={config.variant} {...props}>
      {config.text}
    </Badge>
  );
};

export const CategoryBadge: React.FC<Omit<BadgeProps, 'variant'> & {
  category: 'hotel' | 'flight' | 'tour' | 'package' | 'activity';
}> = ({ category, ...props }) => {
  const categoryConfig = {
    hotel: { variant: 'primary' as const, text: '🏨 Hotel' },
    flight: { variant: 'secondary' as const, text: '✈️ Voo' },
    tour: { variant: 'accent' as const, text: '🗺️ Tour' },
    package: { variant: 'success' as const, text: '📦 Pacote' },
    activity: { variant: 'warning' as const, text: '🎯 Atividade' },
  };

  const config = categoryConfig[category];

  return (
    <Badge variant={config.variant} {...props}>
      {config.text}
    </Badge>
  );
};

// 🚀 EXPORTAR COMPONENTE PRINCIPAL
export default Badge;
