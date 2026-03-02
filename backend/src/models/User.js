// Modelo de usuário para o sistema de autenticação
class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || "user";
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.lastLogin = data.lastLogin || null;
  }

  // Converter para objeto seguro (sem senha)
  toSafeObject() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastLogin: this.lastLogin,
    };
  }

  // Verificar se é admin
  isAdmin() {
    return this.role === "admin";
  }

  // Verificar se é moderador
  isModerator() {
    return this.role === "moderator" || this.role === "admin";
  }

  // Verificar se pode acessar recursos administrativos
  canAccessAdmin() {
    return this.isAdmin() || this.isModerator();
  }
}

module.exports = User;
