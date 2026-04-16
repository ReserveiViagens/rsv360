import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Dynamic imports for cloud pages
const FileManager = dynamic(() => import('../../client/src/modules/cloud/pages/FileManager'), {
  loading: () => <div className="flex items-center justify-center min-h-screen">Carregando...</div>
});

const JobMonitor = dynamic(() => import('../../client/src/modules/cloud/pages/JobMonitor'), {
  loading: () => <div className="flex items-center justify-center min-h-screen">Carregando...</div>
});

const CloudSettings = dynamic(() => import('../../client/src/modules/cloud/pages/CloudSettings'), {
  loading: () => <div className="flex items-center justify-center min-h-screen">Carregando...</div>
});

interface CloudPageProps {
  page: 'files' | 'jobs' | 'settings';
}

export default function CloudPage({ page }: CloudPageProps) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to files if no specific page
    if (!page) {
      router.replace('/cloud/files');
    }
  }, [page, router]);

  const renderPage = () => {
    switch (page) {
      case 'files':
        return <FileManager />;
      case 'jobs':
        return <JobMonitor />;
      case 'settings':
        return <CloudSettings />;
      default:
        return <FileManager />;
    }
  };

  return renderPage();
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { page } = context.params as { page: string[] };

  // Validate page parameter
  const validPages = ['files', 'jobs', 'settings'];
  const currentPage = page?.[0] || 'files';

  if (!validPages.includes(currentPage)) {
    return {
      redirect: {
        destination: '/cloud/files',
        permanent: false,
      },
    };
  }

  return {
    props: {
      page: currentPage as CloudPageProps['page'],
    },
  };
};