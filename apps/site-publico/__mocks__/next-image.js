/**
 * Mock para next/image
 */
const React = require('react');

module.exports = {
  __esModule: true,
  default: React.forwardRef((props, ref) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return React.createElement('img', { ...props, ref });
  }),
};

