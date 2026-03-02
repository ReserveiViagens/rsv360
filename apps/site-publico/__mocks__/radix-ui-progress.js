/**
 * Mock para @radix-ui/react-progress
 * Retorna componentes React válidos
 */
const React = require('react');

const Root = React.forwardRef((props, ref) => {
  const { children, ...rest } = props;
  return React.createElement('div', { ...rest, ref }, children);
});
Root.displayName = 'ProgressRoot';

const Indicator = React.forwardRef((props, ref) => {
  const { children, ...rest } = props;
  return React.createElement('div', { ...rest, ref }, children);
});
Indicator.displayName = 'ProgressIndicator';

module.exports = {
  Root,
  Indicator,
};
