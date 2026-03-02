// Quick upload test to validate /api/upload/images endpoint
// Usage: node test-upload.js

const fs = require("fs");
const path = require("path");

async function main() {
  try {
    const apiBase = process.env.API_BASE_URL || "http://localhost:5002";
    const imagePath = path.join(
      __dirname,
      "../Hotel-com-melhor-preco-main/public/images/hot-park.jpeg",
    );
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image not found at: ${imagePath}`);
    }

    const buffer = fs.readFileSync(imagePath);
    const file = new File([buffer], "hot-park.jpeg", { type: "image/jpeg" });

    const form = new FormData();
    form.append("images", file);

    const res = await fetch(`${apiBase}/api/upload/images`, {
      method: "POST",
      headers: {
        Authorization: "Bearer admin-token-123",
      },
      body: form,
    });

    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Body:", text);

    if (!res.ok) process.exit(1);
  } catch (err) {
    console.error("Upload test failed:", err);
    process.exit(1);
  }
}

main();
