import React from 'react';
import { motion } from 'framer-motion';
import { designTokens } from '../../styles/design-tokens';

// 🎯 TIPOS DO COMPONENTE CARD
export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  border?: boolean;
  borderColor?: 'primary' | 'secondary' | 'accent' | 'neutral';
}

// 🎯 TIPOS DOS COMPONENTES CARD
export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

// 🎨 COMPONENTE CARD PRINCIPAL
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  hover = false,
  clickable = false,
  onClick,
  padding = 'md',
  rounded = 'lg',
  shadow = 'md',
  border = false,
  borderColor = 'neutral',
  ...props
}) => {
  // 🎨 CLASSES BASE POR VARIANTE
  const variantClasses = {
    default: 'bg-white',
    elevated: 'bg-white shadow-lg',
    outlined: 'bg-white border-2 border-neutral-200',
    gradient: 'bg-gradient-to-br from-primary-50 to-secondary-50',
  };

  // 📏 CLASSES POR TAMANHO
  const sizeClasses = {
    sm: 'min-h-[120px]',
    md: 'min-h-[160px]',
    lg: 'min-h-[200px]',
    xl: 'min-h-[280px]',
  };

  // 🎭 CLASSES DE PADDING
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  };

  // 🔲 CLASSES DE BORDER RADIUS
  const roundedClasses = {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  };

  // 🌟 CLASSES DE SOMBRA
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };

  // 🎨 CLASSES DE BORDA
  const borderClasses = {
    primary: 'border-primary-200',
    secondary: 'border-secondary-200',
    accent: 'border-accent-200',
    neutral: 'border-neutral-200',
  };

  // 🔄 ESTADOS INTERATIVOS
  const interactiveClasses = {
    clickable: 'cursor-pointer',
    hover: 'hover:shadow-xl hover:-translate-y-1',
    default: '',
  };

  // 🎭 ANIMAÇÕES
  const cardVariants = {
    initial: { 
      opacity: 0, 
      y: 20,
      scale: 0.95,
      transition: { 
        duration: 0.3, 
        ease: designTokens.animations.easing.ease 
      }
    },
    animate: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.3, 
        ease: designTokens.animations.easing.ease 
      }
    },
    hover: hover ? { 
      y: -5,
      scale: 1.02,
      transition: { 
        duration: 0.2, 
        ease: designTokens.animations.easing.ease 
      }
    } : {},
    tap: clickable ? { 
      scale: 0.98,
      transition: { 
        duration: 0.1, 
        ease: designTokens.animations.easing.ease 
      }
    } : {},
  };

  // 🎯 CLASSES FINAIS
  const cardClasses = `
    relative overflow-hidden
    transition-all duration-300
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${paddingClasses[padding]}
    ${roundedClasses[rounded]}
    ${shadowClasses[shadow]}
    ${border ? `border ${borderClasses[borderColor]}` : ''}
    ${interactiveClasses[clickable ? 'clickable' : hover ? 'hover' : 'default']}
    ${className}
  `.trim();

  // 🎨 RENDERIZAÇÃO
  const CardComponent = clickable ? motion.button : motion.div;
  const cardProps = clickable ? { onClick, type: 'button' as const } : {};

  return (
    <CardComponent
      className={cardClasses}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      {...cardProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

// 🎨 COMPONENTE CARD HEADER
export const CardHeader: React.FC<CardHeaderProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`p-6 pb-0 ${className}`}>
      {children}
    </div>
  );
};

// 🎨 COMPONENTE CARD TITLE
export const CardTitle: React.FC<CardTitleProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <h3 className={`text-xl font-semibold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
};

// 🎨 COMPONENTE CARD DESCRIPTION
export const CardDescription: React.FC<CardDescriptionProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <p className={`text-sm text-gray-600 dark:text-gray-400 mt-1 ${className}`}>
      {children}
    </p>
  );
};

// 🎨 COMPONENTE CARD CONTENT
export const CardContent: React.FC<CardContentProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`p-6 pt-0 ${className}`}>
      {children}
    </div>
  );
};

// 🎯 COMPONENTES ESPECIALIZADOS PARA CASOS DE USO COMUNS
export const ElevatedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="elevated" {...props} />
);

export const OutlinedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="outlined" {...props} />
);

export const GradientCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card variant="gradient" {...props} />
);

export const HoverCard: React.FC<Omit<CardProps, 'hover'>> = (props) => (
  <Card hover={true} {...props} />
);

export const ClickableCard: React.FC<Omit<CardProps, 'clickable'> & { onClick: () => void }> = (props) => (
  <Card clickable={true} {...props} />
);

// 🎭 COMPONENTES DE CARD ESPECÍFICOS PARA TURISMO
export const TourismCard: React.FC<Omit<CardProps, 'variant' | 'hover'> & { 
  image?: string;
  title: string;
  description: string;
  price?: string;
  rating?: number;
}> = ({ image, title, description, price, rating, ...props }) => (
  <Card variant="elevated" hover={true} className="overflow-hidden" {...props}>
    {image && (
      <div className="relative h-48 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- card header image */}
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        {rating && (
          <div className="absolute top-3 right-3 bg-accent-500 text-white px-2 py-1 rounded-full text-sm font-medium">
            ⭐ {rating}
          </div>
        )}
      </div>
    )}
    
    <div className="p-6">
      <h3 className="text-xl font-semibold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600 mb-4 line-clamp-3">{description}</p>
      
      {price && (
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-600">{price}</span>
          <button className="btn-primary text-sm">
            Ver Detalhes
          </button>
        </div>
      )}
    </div>
  </Card>
);

// 🚀 EXPORTAR COMPONENTE PRINCIPAL
export default Card;
