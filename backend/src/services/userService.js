const jwtService = require("./jwtService");
const User = require("../models/User");
const logger = require("../config/logger");

// Dados mock de usuários (em produção, viria do banco de dados)
let users = [
  {
    id: 1,
    name: "Administrador RSV",
    email: "admin@rsv360.com",
    password: "$2a$12$zVBIdGQ5w4QZvEn6vmtZDu43Mgp1/PRD18Xt/1Ac1oviQVT/TiRNO", // senha: admin123
    role: "admin",
    isActive: true,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    lastLogin: null,
  },
  {
    id: 2,
    name: "Moderador RSV",
    email: "moderador@rsv360.com",
    password: "$2a$12$5uQUb8JQzyWd/NMIiuykq.yp5Pk2knzdpA9vOAyf.PjTaYwKtDmmG", // senha: moderador123
    role: "moderator",
    isActive: true,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    lastLogin: null,
  },
];

class UserService {
  // Buscar usuário por email
  async findByEmail(email) {
    const userData = users.find((user) => user.email === email);
    return userData ? new User(userData) : null;
  }

  // Buscar usuário por ID
  async findById(id) {
    const userData = users.find((user) => user.id === parseInt(id));
    return userData ? new User(userData) : null;
  }

  // Criar novo usuário
  async create(userData) {
    const { name, email, password, role = "user" } = userData;

    // Verificar se email já existe
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error("Email já está em uso");
    }

    // Hash da senha
    const hashedPassword = await jwtService.hashPassword(password);

    // Criar novo usuário
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
    };

    users.push(newUser);
    logger.info(`[USER] Novo usuário criado: ${email} (${role})`);

    return new User(newUser);
  }

  // Atualizar usuário
  async update(id, updateData) {
    const userIndex = users.findIndex((user) => user.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error("Usuário não encontrado");
    }

    // Atualizar dados
    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      id: parseInt(id), // Garantir que o ID não seja alterado
      updatedAt: new Date(),
    };

    logger.info(`[USER] Usuário atualizado: ${users[userIndex].email}`);
    return new User(users[userIndex]);
  }

  // Atualizar último login
  async updateLastLogin(id) {
    const userIndex = users.findIndex((user) => user.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error("Usuário não encontrado");
    }

    users[userIndex].lastLogin = new Date();
    logger.info(`[USER] Último login atualizado: ${users[userIndex].email}`);
  }

  // Listar todos os usuários
  async findAll() {
    return users.map((userData) => new User(userData));
  }

  // Deletar usuário
  async delete(id) {
    const userIndex = users.findIndex((user) => user.id === parseInt(id));
    if (userIndex === -1) {
      throw new Error("Usuário não encontrado");
    }

    const deletedUser = users.splice(userIndex, 1)[0];
    logger.info(`[USER] Usuário deletado: ${deletedUser.email}`);

    return new User(deletedUser);
  }

  // Autenticar usuário
  async authenticate(email, password) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error("Credenciais inválidas");
    }

    if (!user.isActive) {
      throw new Error("Conta desativada");
    }

    const isPasswordValid = await jwtService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new Error("Credenciais inválidas");
    }

    // Atualizar último login
    await this.updateLastLogin(user.id);

    logger.info(`[AUTH] Login realizado: ${user.email} (${user.role})`);
    return user;
  }

  // Gerar token para usuário
  generateUserToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return jwtService.generateToken(payload);
  }
}

module.exports = new UserService();
