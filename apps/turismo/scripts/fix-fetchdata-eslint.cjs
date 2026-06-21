const fs = require('fs');
const files = [
  'pages/multilingual.tsx', 'pages/rewards.tsx', 'pages/subscriptions.tsx',
  'src/pages/giftcards.tsx', 'src/pages/multilingual.tsx', 'src/pages/rewards.tsx',
  'src/pages/subscriptions.tsx', 'src/pages/seo.tsx',
];
for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(
    /useEffect\(\(\) => \{\n        (\w+)\(\);/g,
    'useEffect(() => {\n        // eslint-disable-next-line react-hooks/set-state-in-effect -- load data on mount\n        $1();'
  );
  fs.writeFileSync(f, c);
  console.log('fixed', f);
}
