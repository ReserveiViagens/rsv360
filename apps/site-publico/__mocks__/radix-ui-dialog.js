/**
 * Mock para @radix-ui/react-dialog
 * Retorna componentes React válidos
 */
const React = require('react');

// Props específicas do Radix UI que devem ser removidas
const RADIX_PROPS = [
  'asChild', 'onOpenChange', 'open', 'defaultOpen', 'modal',
];

const filterRadixProps = (props) => {
  const filtered = { ...props };
  RADIX_PROPS.forEach(prop => {
    delete filtered[prop];
  });
  return filtered;
};

const Root = React.forwardRef((props, ref) => {
  const { children, open, onOpenChange, ...rest } = filterRadixProps(props);
  return React.createElement('div', { ...rest, ref, 'data-open': open }, children);
});
Root.displayName = 'DialogRoot';

const Trigger = React.forwardRef((props, ref) => {
  const { children, asChild, ...rest } = filterRadixProps(props);
  const Component = asChild ? React.Fragment : 'button';
  return React.createElement(Component, { ...rest, ref }, children);
});
Trigger.displayName = 'DialogTrigger';

const Content = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('div', { ...rest, ref }, children);
});
Content.displayName = 'DialogContent';

const Header = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('div', { ...rest, ref }, children);
});
Header.displayName = 'DialogHeader';

const Title = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('h2', { ...rest, ref }, children);
});
Title.displayName = 'DialogTitle';

const Description = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('p', { ...rest, ref }, children);
});
Description.displayName = 'DialogDescription';

const Footer = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('div', { ...rest, ref }, children);
});
Footer.displayName = 'DialogFooter';

const Overlay = React.forwardRef((props, ref) => {
  const { ...rest } = filterRadixProps(props);
  return React.createElement('div', { ...rest, ref });
});
Overlay.displayName = 'DialogOverlay';

const Close = React.forwardRef((props, ref) => {
  const { children, ...rest } = filterRadixProps(props);
  return React.createElement('button', { ...rest, ref }, children);
});
Close.displayName = 'DialogClose';

module.exports = {
  Root,
  Trigger,
  Content,
  Header,
  Title,
  Description,
  Footer,
  Overlay,
  Close,
  // Aliases
  DialogRoot: Root,
  DialogTrigger: Trigger,
  DialogContent: Content,
  DialogHeader: Header,
  DialogTitle: Title,
  DialogDescription: Description,
  DialogFooter: Footer,
  DialogOverlay: Overlay,
  DialogClose: Close,
};
