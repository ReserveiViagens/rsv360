/**
 * Mock para class-variance-authority
 */
module.exports = {
  cva: (base, config) => {
    return (variants) => {
      return base || '';
    };
  },
};

