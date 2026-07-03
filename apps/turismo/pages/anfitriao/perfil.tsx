import Head from 'next/head';
import Link from 'next/link';
import AnfitriaoRoleGuard from '../../components/AnfitriaoRoleGuard';
import { useAuth } from '@/context/AuthContext';

export default function AnfitriaoPerfilPage() {
  const { user } = useAuth();

  return (
    <AnfitriaoRoleGuard>
      <Head>
        <title>Perfil | Anfitrião</title>
      </Head>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-lg">
          <Link href="/anfitriao" className="text-sm text-blue-600 hover:underline">
            ← Painel
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Perfil do parceiro</h1>
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
            <p>
              <strong>Nome:</strong> {user?.full_name ?? user?.name ?? '—'}
            </p>
            <p className="mt-2">
              <strong>E-mail:</strong> {user?.email ?? '—'}
            </p>
            <p className="mt-2">
              <strong>Papel:</strong> {user?.role ?? '—'}
            </p>
          </div>
        </div>
      </div>
    </AnfitriaoRoleGuard>
  );
}
