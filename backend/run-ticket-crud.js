const fetchFn =
  globalThis.fetch ||
  (async (...args) => {
    const mod = await import("node-fetch");
    return mod.default(...args);
  });

const API = "http://localhost:5002";
const HEADERS = {
  Authorization: "Bearer admin-token-123",
  "Content-Type": "application/json",
};

(async () => {
  try {
    const content_id = "ticket" + Date.now().toString().slice(-6);

    // CREATE
    const createPayload = {
      page_type: "tickets",
      content_id,
      title: "Ingresso Parque das Águas",
      description:
        "Ingresso diário para o Parque das Águas com acesso total às atrações.",
      images: [`${API}/uploads/thumbnails/thumb_placeholder.jpg`],
      metadata: { price: 99.9, category: "parque", duration: "1d" },
      seo_data: {
        title: "Ingresso Parque das Águas - Acesso Total 1 dia",
        description:
          "Compre seu ingresso para o Parque das Águas com acesso total por 1 dia.",
        keywords: ["ingresso", "parque", "caldas novas"],
      },
      status: "active",
      order_index: 0,
    };

    const createRes = await fetchFn(`${API}/api/admin/website/content`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(createPayload),
    });
    const created = await createRes.json();
    if (!createRes.ok)
      throw new Error("CREATE failed: " + JSON.stringify(created));
    console.log("CREATE OK:", created.data.content_id);

    // READ ALL tickets
    const listRes = await fetchFn(`${API}/api/admin/website/content/tickets`, {
      headers: HEADERS,
    });
    const list = await listRes.json();
    if (!listRes.ok) throw new Error("LIST failed: " + JSON.stringify(list));
    console.log("LIST OK:", list.total);

    // UPDATE
    const updatePayload = { title: "Ingresso Parque das Águas - Promo" };
    const updateRes = await fetchFn(
      `${API}/api/admin/website/content/tickets/${content_id}`,
      { method: "PUT", headers: HEADERS, body: JSON.stringify(updatePayload) },
    );
    const updated = await updateRes.json();
    if (!updateRes.ok)
      throw new Error("UPDATE failed: " + JSON.stringify(updated));
    console.log("UPDATE OK:", updated.data.title);

    // DELETE
    const deleteRes = await fetchFn(
      `${API}/api/admin/website/content/tickets/${content_id}`,
      { method: "DELETE", headers: HEADERS },
    );
    const del = await deleteRes.json();
    if (!deleteRes.ok) throw new Error("DELETE failed: " + JSON.stringify(del));
    console.log("DELETE OK:", del.data.content_id);

    process.exit(0);
  } catch (e) {
    console.error("Ticket CRUD failed:", e.message);
    process.exit(1);
  }
})();
