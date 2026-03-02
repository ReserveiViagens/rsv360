const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

class JWTService {
  constructor() {
    this.secretKey = process.env.JWT_SECRET || "rsv-360-secret-key-2025";
    this.expiresIn = process.env.JWT_EXPIRES_IN || "24h";
  }

  // Gerar token JWT
  generateToken(payload) {
    return jwt.sign(payload, this.secretKey, { expiresIn: this.expiresIn });
  }

  // Verificar token JWT
  verifyToken(token) {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      throw new Error("Token inválido ou expirado");
    }
  }

  // Hash de senha
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verificar senha
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Extrair token do header Authorization
  extractTokenFromHeader(authHeader) {
    if (!authHeader) {
      throw new Error("Token de autorização não fornecido");
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw new Error("Formato de token inválido");
    }

    return parts[1];
  }

  // Decodificar token sem verificar (para debug)
  decodeToken(token) {
    return jwt.decode(token);
  }
}

module.exports = new JWTService();
