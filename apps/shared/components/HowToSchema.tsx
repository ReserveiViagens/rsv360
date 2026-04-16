type StepItem = {
  title: string;
  text: string;
};

export function HowToSchema({ title, steps }: { title: string; steps: StepItem[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: title,
          step: steps.map((step, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.title,
            text: step.text,
          })),
        }),
      }}
    />
  );
}
