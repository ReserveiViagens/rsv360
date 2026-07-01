const bcrypt = require('bcryptjs');
const { queryDatabase, isDbRefreshEnabled } = require('./refresh-token.service');

const ALLOWED_REGISTER_ROLES = new Set(['user', 'manager']);
/** Papéis parceiros (`anfitriao`, `corretor`): criados apenas por admin/staff — não no registro público. */

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

function normalizeRegisterPayload(body = {}) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const passwordConfirmation =
    typeof body.password_confirmation === 'string'
      ? body.password_confirmation
      : typeof body.passwordConfirmation === 'string'
        ? body.passwordConfirmation
        : password;
  const role =
    typeof body.role === 'string' && ALLOWED_REGISTER_ROLES.has(body.role)
      ? body.role
      : 'user';

  return { name, email, password, passwordConfirmation, role };
}

async function insertUser({ name, email, passwordHash, role }) {
  try {
    const rows = await queryDatabase(
      `INSERT INTO users (name, email, password, role, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, name, email, role, is_active, created_at`,
      [name, email, passwordHash, role]
    );
    return rows?.[0] ?? null;
  } catch (error) {
    if (String(error.message).includes('password')) {
      const rows = await queryDatabase(
        `INSERT INTO users (name, email, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, true)
         RETURNING id, name, email, role, is_active, created_at`,
        [name, email, passwordHash, role]
      );
      return rows?.[0] ?? null;
    }
    if (String(error.message).includes('unique') || String(error.code) === '23505') {
      return { error: 'email_exists' };
    }
    throw error;
  }
}

async function registerWithDatabase(payload) {
  if (!isDbRefreshEnabled()) {
    return null;
  }

  const { name, email, password, passwordConfirmation, role } =
    normalizeRegisterPayload(payload);

  if (!name || !email || !password) {
    return { error: 'validation', status: 400, message: 'Nome, e-mail e senha são obrigatórios' };
  }

  if (password.length < 8) {
    return {
      error: 'validation',
      status: 400,
      message: 'Senha deve ter pelo menos 8 caracteres',
    };
  }

  if (password !== passwordConfirmation) {
    return {
      error: 'validation',
      status: 400,
      message: 'Confirmação de senha não confere',
    };
  }

  const existing = await queryDatabase('SELECT id FROM users WHERE email = $1', [email]);
  if (existing?.length) {
    return { error: 'email_exists', status: 409, message: 'E-mail já cadastrado' };
  }

  const passwordHash = await hashPassword(password);
  const user = await insertUser({ name, email, passwordHash, role });

  if (user?.error === 'email_exists') {
    return { error: 'email_exists', status: 409, message: 'E-mail já cadastrado' };
  }

  if (!user) {
    return { error: 'insert_failed', status: 503, message: 'Não foi possível criar a conta' };
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      enterpriseId: 'ent_1',
      status: user.is_active === false ? 'inactive' : 'active',
      two_factor_enabled: false,
      created_at: user.created_at,
      updated_at: user.created_at,
    },
  };
}

module.exports = {
  registerWithDatabase,
  isDbRegisterEnabled: isDbRefreshEnabled,
  normalizeRegisterPayload,
};
