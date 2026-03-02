/**
 * Mock para @radix-ui/react-label
 */
module.exports = {
  Root: ({ children, className, ...props }) => {
    return {
      type: 'label',
      props: { className, ...props, children },
    };
  },
};

