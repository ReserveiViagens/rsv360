import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png",
      title: "Reservei Viagens",
      subtitle: "Hotéis em Caldas Novas",
      phone: "(64) 99319-7555",
      email: "reservas@reserveiviagens.com.br",
      type: "image",
      url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/favicon-reservei-viagens-VVm0zxcolWbkv9Lf5Yj0PUoxLJrARl.png"
    }
  });
}

