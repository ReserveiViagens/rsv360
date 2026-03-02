import type { AppProps } from 'next/app'
import { AuthProvider } from '../context/AuthContext'
import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Onion RSV 360 - Sistema de Turismo</title>
        <meta name="description" content="Sistema completo de gestão turística Onion RSV 360" />
      </Head>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  )
} 