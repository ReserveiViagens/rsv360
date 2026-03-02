/**
 * Mock para sonner (toast notifications)
 */
const React = require('react');

module.exports = {
  toast: {
    success: jest.fn((message) => ({ id: 'success-' + Date.now(), message })),
    error: jest.fn((message) => ({ id: 'error-' + Date.now(), message })),
    info: jest.fn((message) => ({ id: 'info-' + Date.now(), message })),
    warning: jest.fn((message) => ({ id: 'warning-' + Date.now(), message })),
    loading: jest.fn((message) => ({ id: 'loading-' + Date.now(), message })),
  },
  Toaster: () => React.createElement('div', { 'data-testid': 'toaster' }),
};

