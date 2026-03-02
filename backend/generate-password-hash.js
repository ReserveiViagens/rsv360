const bcrypt = require("bcryptjs");

async function generatePasswordHashes() {
  console.log("🔐 Gerando hashes de senhas...\n");

  const passwords = [
    { password: "admin123", description: "Senha do admin" },
    { password: "moderador123", description: "Senha do moderador" },
  ];

  for (const { password, description } of passwords) {
    const hash = await bcrypt.hash(password, 12);
    console.log(`${description}:`);
    console.log(`  Senha: ${password}`);
    console.log(`  Hash:  ${hash}`);
    console.log("");
  }

  console.log("✅ Hashes gerados com sucesso!");
}

generatePasswordHashes().catch(console.error);
