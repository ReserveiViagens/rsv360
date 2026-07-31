import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        {/* Meta tags básicas */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        
        {/* Preconnect para melhor performance */}
        <link rel="preconnect" href="http://localhost:3002" />
        <link rel="preconnect" href="https://localhost:3002" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 