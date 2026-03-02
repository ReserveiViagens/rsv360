const http = require("http");
const url = require("url");

// Configuração CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

// Simular banco de dados de usuários
const users = [
  {
    email: "admin@onion360.com",
    password: "admin123",
    name: "Administrador Onion 360",
    permissions: ["admin", "user"],
  },
  {
    email: "demo@onionrsv.com",
    password: "demo123",
    name: "Usuário Demo",
    permissions: ["admin"],
  },
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Configurar CORS
  Object.keys(corsHeaders).forEach((key) => {
    res.setHeader(key, corsHeaders[key]);
  });

  // Responder a requisições OPTIONS (preflight)
  if (method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Rota: GET /
  if (path === "/" && method === "GET") {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        message: "Onion RSV 360 - Backend API",
        version: "2.1.0",
        status: "running",
      }),
    );
    return;
  }

  // Rota: GET /health
  if (path === "/health" && method === "GET") {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        status: "healthy",
        service: "core",
        timestamp: new Date().toISOString(),
      }),
    );
    return;
  }

  // Rota: POST /api/core/token
  if (path === "/api/core/token" && method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const loginData = JSON.parse(body);
        const user = users.find(
          (u) =>
            u.email === loginData.email && u.password === loginData.password,
        );

        if (user) {
          res.writeHead(200);
          res.end(
            JSON.stringify({
              access_token: `token-${user.email}-${Date.now()}`,
              refresh_token: `refresh-${user.email}-${Date.now()}`,
              token_type: "bearer",
              expires_in: 1800,
              user: {
                email: user.email,
                name: user.name,
                permissions: user.permissions,
              },
            }),
          );
        } else {
          res.writeHead(401);
          res.end(
            JSON.stringify({
              error: "Credenciais inválidas",
              message: "Email ou senha incorretos",
            }),
          );
        }
      } catch (error) {
        res.writeHead(400);
        res.end(
          JSON.stringify({
            error: "Dados inválidos",
            message: "Formato JSON inválido",
          }),
        );
      }
    });
    return;
  }

  // Rota: POST /api/users/
  if (path === "/api/users/" && method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const userData = JSON.parse(body);
        res.writeHead(200);
        res.end(
          JSON.stringify({
            message: "Usuário criado com sucesso",
            email: userData.email,
            name: userData.full_name,
          }),
        );
      } catch (error) {
        res.writeHead(400);
        res.end(
          JSON.stringify({
            error: "Dados inválidos",
            message: "Formato JSON inválido",
          }),
        );
      }
    });
    return;
  }

  // Rota não encontrada
  res.writeHead(404);
  res.end(
    JSON.stringify({
      error: "Rota não encontrada",
      message: `A rota ${path} não existe`,
    }),
  );
});

const PORT = 5001;
server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Servidor Backend Onion RSV 360 iniciado!");
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log("");
  console.log("📋 Endpoints disponíveis:");
  console.log("   GET  / - Página inicial");
  console.log("   GET  /health - Status do servidor");
  console.log("   POST /api/core/token - Login");
  console.log("   POST /api/users/ - Criar usuário");
  console.log("");
  console.log("🔐 Credenciais de teste:");
  console.log("   Email: admin@onion360.com");
  console.log("   Senha: admin123");
  console.log("");
  console.log("   Email: demo@onionrsv.com");
  console.log("   Senha: demo123");
  console.log("");
  console.log("✅ Backend pronto para receber conexões!");
});
