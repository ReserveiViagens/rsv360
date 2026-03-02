import { NextRequest, NextResponse } from 'next/server';
import { getCaldasNovasOSMData } from '@/lib/caldas-novas-osm';

/** Escapa valor para CSV */
function escapeCsv(val: string | undefined): string {
  if (val == null) return '';
  const s = String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Gera CSV OSM com preços atualizados do site */
export async function GET(request: NextRequest) {
  try {
    const origin = request.headers.get('origin') || request.nextUrl.origin;
    const baseUrl = origin.replace(/\/$/, '');

    const items = getCaldasNovasOSMData();

    const header = 'name,lat,lng,tourism,price,image,phone,rsv360:verified,brand,website,whatsapp';

    const rows = items.map((item) => {
      const image = item.image.startsWith('/') ? `${baseUrl}${item.image}` : item.image;
      const website = item.website?.startsWith('/') ? `${baseUrl}${item.website}` : (item.website ?? '');
      return [
        escapeCsv(item.name),
        item.lat,
        item.lng,
        item.tourism,
        escapeCsv(item.price),
        escapeCsv(image),
        escapeCsv(item.phone),
        item.rsv360Verified ? 'yes' : 'no',
        escapeCsv(item.brand),
        escapeCsv(website),
        escapeCsv(item.whatsapp),
      ].join(',');
    });

    const csv = [header, ...rows].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="caldas-novas-osm.csv"',
      },
    });
  } catch (err) {
    console.error('Erro ao gerar CSV OSM:', err);
    return NextResponse.json({ error: 'Erro ao gerar CSV' }, { status: 500 });
  }
}
