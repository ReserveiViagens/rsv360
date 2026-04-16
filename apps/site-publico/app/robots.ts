import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/portal/'],
    },
    sitemap: [
      'https://www.reserveiviagens.com.br/sitemap.xml',
      'https://www.reserveiviagens.com/sitemap.xml',
      'https://www.rsv360.com.br/sitemap.xml',
      'https://www.rsv360.com/sitemap.xml',
    ],
  };
}
