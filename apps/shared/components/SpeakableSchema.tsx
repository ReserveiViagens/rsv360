export function SpeakableSchema({ url, cssSelectors }: { url: string; cssSelectors: string[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          url,
          speakable: {
            '@type': 'SpeakableSpecification',
            cssSelector: cssSelectors,
          },
        }),
      }}
    />
  );
}
