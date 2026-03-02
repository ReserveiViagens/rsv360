import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      site_info: {
        title: "Reservei Viagens",
        tagline: "Parques, Hotéis & Atrações em Caldas Novas",
        description: "Especialistas em turismo em Caldas Novas. Os melhores hotéis, pacotes e atrações com desconto especial.",
      },
      contact_info: {
        phones: [
          "(64) 99319-7555",
          "(64) 99306-8752",
          "(65) 99235-1207",
          "(65) 99204-8814",
        ],
        email: "reservas@reserveiviagens.com.br",
        whatsapp: "5564993197555",
        address: "Rua RP5, Residencial Primavera 2, Caldas Novas, GO",
        filial: "Av. Manoel José de Arruda, Porto, Cuiabá, MT",
        fixo: "(65) 2127-0415",
        hours: "Seg-Sex 8h-18h, Sáb 8h-12h",
      },
      social_media: {
        facebook: "facebook.com/comercialreservei",
        instagram: "@reserveiviagens",
        website: "reserveiviagens.com.br",
      },
      seo_global: {
        title: "Reservei Viagens - Hotéis e Atrações em Caldas Novas",
        description: "Especialista em turismo em Caldas Novas. Hotéis com desconto, pacotes promocionais e as melhores atrações.",
        keywords: [
          "caldas novas",
          "hotéis caldas novas",
          "piscinas termais",
          "reservei viagens",
          "turismo goiás",
        ],
        og_image: "/images/og-reservei-viagens.jpg",
      },
    }
  });
}

