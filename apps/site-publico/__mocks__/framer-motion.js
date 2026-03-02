/**
 * Mock para framer-motion
 * Retorna componentes React válidos usando React.createElement
 */

const React = require('react');

// Props específicas do framer-motion que devem ser removidas
const FRAMER_MOTION_PROPS = [
  'initial', 'animate', 'whileHover', 'whileTap', 'transition',
  'exit', 'variants', 'layout', 'layoutId', 'drag', 'dragConstraints',
  'dragElastic', 'dragMomentum', 'dragTransition', 'dragPropagation',
  'dragDirectionLock', 'dragSnapToOrigin', 'dragListener', 'onDrag',
  'onDragStart', 'onDragEnd', 'onAnimationStart', 'onAnimationComplete',
  'onUpdate', 'onPan', 'onPanStart', 'onPanEnd', 'onTap', 'onTapStart',
  'onTapCancel', 'onHoverStart', 'onHoverEnd', 'onFocus', 'onBlur',
  'onViewportBoxUpdate', 'onLayoutAnimationComplete', 'custom', 'inherit',
  'transformTemplate', 'transformValues', 'style', 'onLayoutMeasure',
];

// Criar componente motion que aceita props e children
const createMotionComponent = (Component) => {
  const MotionComponent = React.forwardRef((props, ref) => {
    // Remover props específicas do framer-motion
    const filteredProps = { ...props };
    FRAMER_MOTION_PROPS.forEach(prop => {
      delete filteredProps[prop];
    });
    
    const { children, ...rest } = filteredProps;
    
    // Retornar elemento React válido
    return React.createElement(Component, { ...rest, ref }, children);
  });
  
  MotionComponent.displayName = `Motion${Component}`;
  return MotionComponent;
};

module.exports = {
  motion: {
    div: createMotionComponent('div'),
    span: createMotionComponent('span'),
    button: createMotionComponent('button'),
    card: createMotionComponent('div'),
  },
  AnimatePresence: ({ children }) => {
    // Retornar Fragment com children
    if (!children) return null;
    return React.createElement(React.Fragment, null, children);
  },
  useAnimation: () => ({
    start: () => Promise.resolve(),
    stop: () => {},
    set: () => {},
  }),
  useMotionValue: (initial) => ({ 
    get: () => initial, 
    set: () => {},
    onChange: () => () => {},
  }),
  useTransform: (value, inputRange, outputRange) => {
    return () => outputRange[0];
  },
  useSpring: (value, config) => value,
  useInView: () => [React.createRef(), true],
};
