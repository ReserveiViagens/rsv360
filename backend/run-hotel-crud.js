// Simple CRUD runner for Hotels against Admin API
// Usage: node run-hotel-crud.js

const BASE_URL = process.env.API_BASE_URL || "http://localhost:5002";
const TOKEN = "admin-token-123";

async function request(path, init = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  return json;
}

async function main() {
  // CREATE
  const payload = {
    page_type: "hotels",
    content_id: `hotel${Date.now()}`,
    title: "Hotel Teste Automático",
    description:
      "Hotel criado automaticamente para validar CRUD completo de hotéis.",
    images: ["https://via.placeholder.com/800x600"],
    metadata: {
      stars: 4,
      price: 199.9,
      originalPrice: 249.9,
      features: ["Wi-Fi", "Piscina"],
      location: "Centro",
      capacity: "4 pessoas",
    },
    seo_data: {
      title: "Hotel Automático - Teste de CRUD",
      description:
        "Registro temporário para validação de APIs admin de hotéis.",
      keywords: ["hotel", "teste", "crud"],
    },
    status: "active",
  };
  const created = await request("/api/admin/website/content", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  console.log("CREATE ok:", created?.data?.content_id || created);

  const contentId = created?.data?.content_id || payload.content_id;

  // LIST
  const list = await request("/api/admin/website/content/hotels");
  console.log("LIST count:", (list?.data || []).length);

  // UPDATE (parcial permitido)
  const updatePayload = { title: "Hotel Teste Automático (Atualizado)" };
  const updated = await request(
    `/api/admin/website/content/hotels/${contentId}`,
    {
      method: "PUT",
      body: JSON.stringify(updatePayload),
    },
  );
  console.log("UPDATE ok:", updated?.data?.title);

  // DELETE
  await request(`/api/admin/website/content/hotels/${contentId}`, {
    method: "DELETE",
  });
  console.log("DELETE ok:", contentId);
}

main().catch((err) => {
  console.error("Hotel CRUD failed:", err.message || err);
  process.exit(1);
});
