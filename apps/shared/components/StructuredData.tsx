type JSONLDProps = {
  data: Record<string, unknown>;
};

function JSONLD({ data }: JSONLDProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema() {
  return (
    <JSONLD
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Reservei Viagens LTDA',
        legalName: 'Reservei Viagens LTDA',
        url: 'https://www.reserveiviagens.com.br',
        logo: 'https://www.reserveiviagens.com.br/icons/icon-512x512.png',
        founder: {
          '@type': 'Person',
          name: 'Douglas P. Figueiredo',
          email: 'douglas@reserveiviagens.com.br',
        },
        sameAs: [
          'https://www.reserveiviagens.com.br',
          'https://www.reserveiviagens.com',
          'https://www.rsv360.com.br',
          'https://www.rsv360.com',
          'https://www.instagram.com/reserveiviagens',
          'https://www.facebook.com/reserveiviagens',
          'https://www.linkedin.com/company/reserveiviagens',
        ],
      }}
    />
  );
}

export function SoftwareApplicationSchema() {
  return (
    <JSONLD
      data={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'RSV360 PMS/CRM',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: 'https://www.reserveiviagens.com.br',
        author: {
          '@type': 'Person',
          name: 'Douglas P. Figueiredo',
        },
      }}
    />
  );
}

export function WebSiteSchema() {
  return (
    <JSONLD
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Reservei Viagens',
        url: 'https://www.reserveiviagens.com.br',
        copyrightHolder: {
          '@type': 'Organization',
          name: 'Reservei Viagens LTDA',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://www.reserveiviagens.com.br/buscar?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}
