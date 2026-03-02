/**
 * Mock para @radix-ui/react-select
 * Retorna componentes React válidos com todos os componentes necessários
 */
const React = require('react');

// Props específicas do Radix UI que devem ser removidas
const RADIX_PROPS = [
  'asChild', 'onValueChange', 'value', 'defaultValue', 'open', 'defaultOpen',
  'onOpenChange', 'dir', 'name', 'required', 'disabled', 'modal', 'position',
];

const filterRadixProps = (props) => {
  const filtered = { ...props };
  RADIX_PROPS.forEach(prop => {
    delete filtered[prop];
  });
  return filtered;
};

const Root = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('div', { ...rest, ref }, children);
});
Root.displayName = 'SelectRoot';

const Trigger = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('button', { ...rest, ref }, children);
});
Trigger.displayName = 'SelectTrigger';

const Value = React.forwardRef((props, ref) => {
  const { ...rest } = filterRadixProps(props);
  return React.createElement('span', { ...rest, ref });
});
Value.displayName = 'SelectValue';

const Content = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('div', { ...rest, ref }, children);
});
Content.displayName = 'SelectContent';

const Item = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('div', { ...rest, ref }, children);
});
Item.displayName = 'SelectItem';

const ScrollUpButton = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('div', { ...rest, ref }, children);
});
ScrollUpButton.displayName = 'SelectScrollUpButton';

const ScrollDownButton = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('div', { ...rest, ref }, children);
});
ScrollDownButton.displayName = 'SelectScrollDownButton';

const Viewport = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('div', { ...rest, ref }, children);
});
Viewport.displayName = 'SelectViewport';

const Group = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('div', { ...rest, ref }, children);
});
Group.displayName = 'SelectGroup';

const Label = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('label', { ...rest, ref }, children);
});
Label.displayName = 'SelectLabel';

const Separator = React.forwardRef((props, ref) => {
  const { ...rest } = filterRadixProps(props);
  return React.createElement('hr', { ...rest, ref });
});
Separator.displayName = 'SelectSeparator';

const Icon = React.forwardRef((props, ref) => {
  const { children, asChild, ...rest } = filterRadixProps(props);
  if (asChild && children) {
    return children;
  }
  return React.createElement('span', { ...rest, ref }, children);
});
Icon.displayName = 'SelectIcon';

const Portal = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};
Portal.displayName = 'SelectPortal';

const ItemIndicator = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('span', { ...rest, ref }, children);
});
ItemIndicator.displayName = 'SelectItemIndicator';

const ItemText = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('span', { ...rest, ref }, children);
});
ItemText.displayName = 'SelectItemText';

module.exports = {
  Root,
  Trigger,
  Value,
  Content,
  Item,
  ScrollUpButton,
  ScrollDownButton,
  Viewport,
  Group,
  Label,
  Separator,
  Icon,
  Portal,
  ItemIndicator,
  ItemText,
  // Aliases para compatibilidade
  SelectItem: Item,
  SelectTrigger: Trigger,
  SelectValue: Value,
  SelectContent: Content,
  SelectScrollUpButton: ScrollUpButton,
  SelectScrollDownButton: ScrollDownButton,
  SelectViewport: Viewport,
  SelectGroup: Group,
  SelectLabel: Label,
  SelectSeparator: Separator,
};
