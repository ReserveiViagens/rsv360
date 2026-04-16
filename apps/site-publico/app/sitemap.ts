import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.reserveiviagens.com.br';
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://www.reserveiviagens.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://www.rsv360.com.br', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: 'https://www.rsv360.com', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/politica-de-privacidade`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/politica-de-cookies`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/termos-de-uso`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ];
}
