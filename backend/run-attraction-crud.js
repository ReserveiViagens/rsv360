// Simple CRUD runner for Attractions against Admin API
// Usage: node run-attraction-crud.js

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
  // CREATE (must satisfy Joi schema in admin-website.js)
  const payload = {
    page_type: "attractions",
    content_id: `attraction${Date.now()}`,
    title: "Atração Teste Automático",
    description:
      "Atração criada automaticamente para validar CRUD completo das atrações.",
    images: ["https://via.placeholder.com/800x600"],
    metadata: {
      price: 75,
      type: "parque_aquatico",
      features: ["Piscinas termais", "Toboáguas", "Área kids"],
      location: "Caldas Novas - GO",
      hours: "08:00 - 18:00",
    },
    seo_data: {
      title: "Atração Automática - Parque Aquático em Caldas Novas",
      description:
        "Item gerado para testes automáticos: validações de CRUD, SEO e metadados para atrações.",
      keywords: ["atração", "parque aquático", "caldas novas"],
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
  const list = await request("/api/admin/website/content/attractions");
  console.log("LIST count:", (list?.data || []).length);

  // GET ONE (to build full valid update payload)
  const getOne = await request(
    `/api/admin/website/content/attractions/${contentId}`,
  );
  const base = getOne?.data || {};

  // UPDATE (Joi requires full object except page_type/content_id)
  const updatePayload = {
    title: (base.title || payload.title) + " (Atualizada)",
    description: "Descrição atualizada automaticamente (payload completo).",
    images: base.images || payload.images,
    metadata: base.metadata || payload.metadata,
    seo_data: base.seo_data || payload.seo_data,
    status: base.status || "active",
    order_index: base.order_index || 0,
  };

  const updated = await request(
    `/api/admin/website/content/attractions/${contentId}`,
    {
      method: "PUT",
      body: JSON.stringify(updatePayload),
    },
  );
  console.log("UPDATE ok:", updated?.data?.content_id || contentId);

  // DELETE
  await request(`/api/admin/website/content/attractions/${contentId}`, {
    method: "DELETE",
  });
  console.log("DELETE ok:", contentId);
}

main().catch((err) => {
  console.error("Attraction CRUD failed:", err.message || err);
  process.exit(1);
});
