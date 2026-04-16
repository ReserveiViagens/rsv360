import type { ReactNode } from 'react';

type SEOHeadProps = {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: 'website' | 'article';
  locale?: string;
  noIndex?: boolean;
  siteName?: string;
  children?: ReactNode;
};

const DEFAULT_IMAGE = 'https://www.reserveiviagens.com.br/og/rsv360-1200x630.png';

export function SEOHead({
  title,
  description,
  url,
  image = DEFAULT_IMAGE,
  type = 'website',
  locale = 'pt_BR',
  noIndex = false,
  siteName = 'RSV360',
  children,
}: SEOHeadProps) {
  const canonicalUrl = url || 'https://www.reserveiviagens.com.br';
  const alternatePt = 'https://www.reserveiviagens.com.br';
  const alternateEn = 'https://www.reserveiviagens.com';

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="author" content="Douglas P. Figueiredo" />
      <meta name="creator" content="Douglas P. Figueiredo" />
      <meta name="publisher" content="Reservei Viagens LTDA" />
      <meta name="copyright" content="© 2024-2026 Reservei Viagens LTDA" />
      <meta name="designer" content="Douglas P. Figueiredo" />
      <meta name="owner" content="Reservei Viagens LTDA" />
      <meta name="reply-to" content="douglas@reserveiviagens.com.br" />
      <meta name="application-name" content="RSV360" />
      <meta name="generator" content="RSV360 Metadata Suite" />
      <meta name="classification" content="Business, Travel, PMS, CRM" />
      <meta name="identifier-url" content={canonicalUrl} />
      <meta name="original-source" content={canonicalUrl} />
      <meta
        name="robots"
        content={noIndex ? 'noindex,nofollow,noarchive' : 'index,follow,max-image-preview:large'}
      />
      <meta
        name="googlebot"
        content={noIndex ? 'noindex,nofollow,noarchive' : 'index,follow,max-image-preview:large'}
      />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="pt-BR" href={alternatePt} />
      <link rel="alternate" hrefLang="en" href={alternateEn} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content={siteName} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {children}
    </>
  );
}
