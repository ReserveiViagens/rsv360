import React from 'react';
import { motion } from 'framer-motion';
import { designTokens } from '../../styles/design-tokens';

// 🎯 TIPOS DO COMPONENTE BUTTON
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  rounded?: boolean;
  children: React.ReactNode;
}

// 🎨 COMPONENTE BUTTON PRINCIPAL
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  rounded = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  // 🎨 CLASSES BASE POR VARIANTE
  const variantClasses = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white shadow-md hover:shadow-lg',
    accent: 'bg-accent-500 hover:bg-accent-600 text-white shadow-md hover:shadow-lg',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white',
    ghost: 'text-primary-600 hover:bg-primary-50 hover:text-primary-700',
    danger: 'bg-danger-500 hover:bg-danger-600 text-white shadow-md hover:shadow-lg',
  };

  // 📏 CLASSES POR TAMANHO
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  // 🔄 ESTADOS DO BOTÃO
  const stateClasses = {
    disabled: 'opacity-50 cursor-not-allowed',
    loading: 'cursor-wait',
    default: 'cursor-pointer',
  };

  // 🎭 ANIMAÇÕES
  const buttonVariants = {
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2, ease: designTokens.animations.easing.ease }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1, ease: designTokens.animations.easing.ease }
    },
    loading: {
      rotate: 360,
      transition: { duration: 1, repeat: Infinity, ease: "linear" }
    }
  };

  // 🎯 CLASSES FINAIS
  const buttonClasses = `
    inline-flex items-center justify-center
    font-medium font-sans
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${rounded ? 'rounded-full' : 'rounded-lg'}
    ${className}
  `.trim();

  // 🔄 RENDERIZAÇÃO DO ÍCONE DE LOADING
  const LoadingSpinner = () => (
    <motion.div
      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
      animate="loading"
      variants={buttonVariants}
    />
  );

  // 🎨 RENDERIZAÇÃO DO CONTEÚDO
  const renderContent = () => {
    if (loading) {
      return (
        <>
          <LoadingSpinner />
          <span className="ml-2">Carregando...</span>
        </>
      );
    }

    if (icon) {
      return (
        <>
          {iconPosition === 'left' && icon}
          <span className={icon ? (iconPosition === 'left' ? 'ml-2' : 'mr-2') : ''}>
            {children}
          </span>
          {iconPosition === 'right' && icon}
        </>
      );
    }

    return children;
  };

  return (
    <motion.button
      className={buttonClasses}
      disabled={disabled || loading}
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      {...props}
    >
      {renderContent()}
    </motion.button>
  );
};

// 🎯 COMPONENTES ESPECIALIZADOS PARA CASOS DE USO COMUNS
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

export const AccentButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="accent" {...props} />
);

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="outline" {...props} />
);

export const DangerButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="danger" {...props} />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="ghost" {...props} />
);

// 🚀 EXPORTAR COMPONENTE PRINCIPAL
export default Button;
