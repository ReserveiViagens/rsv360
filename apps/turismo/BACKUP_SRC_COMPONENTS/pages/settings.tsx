import React from 'react';
import { Layout } from '../components/layout';
import { Card, Button } from '../components/ui';
import { PageTransition } from '../components/ui';
import { Settings, Save } from 'lucide-react';

export default function Settings() {
                return (
    <Layout>
      <PageTransition type="fade" className="space-y-6">
        <div className="flex items-center justify-between">
                        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              ⚙️ Configurações
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie as configurações do sistema
                            </p>
                        </div>
          <Button className="flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Salvar</span>
          </Button>
                </div>

        <Card className="p-6">
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">
                Configurações em desenvolvimento
              </p>
            </div>
                        </div>
        </Card>
      </PageTransition>
    </Layout>
    );
} 