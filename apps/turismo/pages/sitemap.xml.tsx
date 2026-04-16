import type { GetServerSideProps } from 'next';

const urls = [
  'https://www.rsv360.com.br/',
  'https://www.rsv360.com/',
  'https://www.reserveiviagens.com.br/',
  'https://www.reserveiviagens.com/',
  'https://www.rsv360.com.br/politica-de-privacidade',
  'https://www.rsv360.com.br/politica-de-cookies',
  'https://www.rsv360.com.br/termos-de-uso',
];

export default function SitemapXmlPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${url}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>`)
    .join('\n')}\n</urlset>`;
  res.setHeader('Content-Type', 'application/xml');
  res.write(xml);
  res.end();
  return { props: {} };
};
