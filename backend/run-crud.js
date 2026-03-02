/* Simple CRUD runner against Admin Website APIs (port 5002) */
const BASE = "http://localhost:5002/api/admin/website";
const TOKEN = "admin-token-123";

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
      ...(opts.headers || {}),
    },
  });
  let json;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status, ok: res.ok, json };
}

async function run() {
  const content_id = "hoteltestersv5";

  // POST create
  const payload = {
    page_type: "hotels",
    content_id,
    title: "Hotel Teste RSV 5",
    description:
      "Hotel de teste criado automaticamente para validar CRUD end-to-end.",
    images: ["https://via.placeholder.com/800x600"],
    metadata: {
      stars: 4,
      price: 250,
      originalPrice: 312.5,
      features: ["Wi-Fi", "Piscina"],
      location: "Caldas Novas, GO",
      capacity: "4 pessoas",
    },
    seo_data: {
      title: "Hotel Teste RSV 5 - Caldas Novas",
      description:
        "Hotel de teste criado automaticamente em Caldas Novas para validação do CMS.",
      keywords: ["hotel", "caldas novas"],
    },
    status: "active",
  };
  const created = await request("/content", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  console.log("POST create:", created.status, created.ok);
  if (!created.ok) {
    console.log(created.json);
    process.exit(1);
  }

  // GET list
  const listed = await request("/content/hotels");
  console.log(
    "GET list hotels:",
    listed.status,
    listed.ok,
    "total=",
    Array.isArray(listed.json?.data) ? listed.json.data.length : "n/a",
  );

  // PUT update
  const updateBody = {
    description: "Hotel atualizado automaticamente",
    metadata: { price: 275 },
  };
  const updated = await request(`/content/hotels/${content_id}`, {
    method: "PUT",
    body: JSON.stringify(updateBody),
  });
  console.log("PUT update:", updated.status, updated.ok);
  if (!updated.ok) console.log(updated.json);

  // DELETE
  const deleted = await request(`/content/hotels/${content_id}`, {
    method: "DELETE",
  });
  console.log("DELETE:", deleted.status, deleted.ok);
  if (!deleted.ok) console.log(deleted.json);
}

run().catch((err) => {
  console.error("RUN ERR", err);
  process.exit(1);
});
