/** Acesso Drizzle compartilhado pelos módulos Fase 1. */
const { db } = require('../../backend/src/db/drizzle');

export { db };

module.exports = { db };
