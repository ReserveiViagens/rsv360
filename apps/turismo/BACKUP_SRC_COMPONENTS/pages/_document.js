import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <link rel="preconnect" href="http://localhost:5000" />
        <link rel="preconnect" href="https://localhost:5000" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 