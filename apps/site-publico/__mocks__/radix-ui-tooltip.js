/**
 * Mock para @radix-ui/react-tooltip
 * Retorna componentes React válidos
 */
const React = require('react');

// Props específicas do Radix UI que devem ser removidas
const RADIX_PROPS = [
  'sideOffset', 'side', 'align', 'alignOffset', 'arrowPadding',
  'collisionPadding', 'sticky', 'hideWhenDetached', 'asChild',
  'onOpenChange', 'open', 'defaultOpen', 'delayDuration',
  'skipDelayDuration', 'disableHoverableContent',
];

const filterRadixProps = (props) => {
  const filtered = { ...props };
  RADIX_PROPS.forEach(prop => {
    delete filtered[prop];
  });
  return filtered;
};

module.exports = {
  Root: React.forwardRef((props, ref) => {
    const { children, ...rest } = filterRadixProps(props);
    return React.createElement('div', { ...rest, ref }, children);
  }),
  Trigger: React.forwardRef((props, ref) => {
    const { children, asChild, ...rest } = filterRadixProps(props);
    const Component = asChild ? React.Fragment : 'div';
    return React.createElement(Component, { ...rest, ref }, children);
  }),
  Content: React.forwardRef((props, ref) => {
    const { children, ...rest } = filterRadixProps(props);
    return React.createElement('div', { ...rest, ref }, children);
  }),
  Provider: ({ children }) => {
    return React.createElement(React.Fragment, null, children);
  },
  Tooltip: React.forwardRef((props, ref) => {
    const { children, ...rest } = filterRadixProps(props);
    return React.createElement('div', { ...rest, ref }, children);
  }),
  TooltipContent: React.forwardRef((props, ref) => {
    const { children, ...rest } = filterRadixProps(props);
    return React.createElement('div', { ...rest, ref }, children);
  }),
  TooltipProvider: ({ children }) => {
    return React.createElement(React.Fragment, null, children);
  },
  TooltipTrigger: React.forwardRef((props, ref) => {
    const { children, asChild, ...rest } = filterRadixProps(props);
    const Component = asChild ? React.Fragment : 'div';
    return React.createElement(Component, { ...rest, ref }, children);
  }),
};
