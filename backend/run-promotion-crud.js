// Simple Promotion CRUD runner for Promotions against Admin API
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
  const contentId = `promo${Date.now()}`;
  const payload = {
    page_type: "promotions",
    content_id: contentId,
    title: "Promo Automático",
    description: "Promo automática para teste de CRUD",
    images: ["https://via.placeholder.com/800x600"],
    metadata: {
      discount: 20,
      validUntil: new Date().toISOString(),
    },
    seo_data: {
      title: "Promo Automático - Teste",
      description:
        "Descrição detalhada para SEO da promoção de teste com conteúdo mínimo.",
      keywords: ["promo", "teste"],
    },
    status: "active",
  };

  const created = await request("/api/admin/website/content", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  console.log("PROMO CREATE ok:", created?.data?.content_id || created);

  const list = await request("/api/admin/website/content/promotions");
  console.log("PROMO LIST count:", (list?.data || []).length);

  const updatePayload = { title: payload.title + " (Atualizado)" };
  const updated = await request(
    `/api/admin/website/content/promotions/${payload.content_id}`,
    {
      method: "PUT",
      body: JSON.stringify(updatePayload),
    },
  );
  console.log("PROMO UPDATE ok:", updated?.data?.title || updatePayload.title);

  await request(`/api/admin/website/content/promotions/${payload.content_id}`, {
    method: "DELETE",
  });
  console.log("PROMO DELETE ok:", payload.content_id);
}

main().catch((err) => {
  console.error("Promotions CRUD failed:", err.message || err);
  process.exit(1);
});
