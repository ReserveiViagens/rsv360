/**
 * Página de testes automatizados para o Módulo de Orçamentos
 * Acesse: http://localhost:3000/cotacoes/test-page
 * 
 * IMPORTANTE: Esta página é renderizada APENAS no cliente (client-side only)
 * Todos os imports são 100% dinâmicos para evitar erros no SSR
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

export default function TestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Garantir que estamos no cliente
    if (typeof window !== 'undefined') {
      setMounted(true);
    }
  }, []);

  const executeTests = async () => {
    if (!mounted || typeof window === 'undefined') {
      return;
    }

    setIsRunning(true);
    
    try {
      // Import dinâmico APENAS após verificar que estamos no cliente
      // Usar string literal para evitar análise estática pelo bundler
      const modulePath = '@/lib/test-module';
      const testModule = await import(modulePath);
      
      if (testModule && testModule.runAllTests) {
        // Exportar para window para uso no console
        if (typeof window !== 'undefined') {
          (window as any).testModule = {
            runAllTests: testModule.runAllTests,
            testTemplateLoading: testModule.testTemplateLoading,
            testCreateBudgetFromTemplate: testModule.testCreateBudgetFromTemplate,
            testCalculations: testModule.testCalculations,
            testLocalStorage: testModule.testLocalStorage,
            testTemplateVersioning: testModule.testTemplateVersioning,
          };
        }

        const results = testModule.runAllTests();
        setTestResults(results);
      } else {
        throw new Error('Função runAllTests não encontrada no módulo');
      }
    } catch (error: any) {
      console.error('Erro ao executar testes:', error);
      setTestResults([{
        name: 'Erro na Execução',
        passed: false,
        message: `Erro: ${error.message || 'Erro desconhecido'}`,
        details: { 
          error: error.toString(),
          stack: error.stack,
          message: error.message
        }
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Executar testes automaticamente após montagem
    if (mounted && typeof window !== 'undefined') {
      // Delay maior para garantir que tudo está pronto
      const timer = setTimeout(() => {
        executeTests();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  // Renderizar apenas no cliente - retornar null durante SSR
  if (typeof window === 'undefined' || !mounted) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Carregando testes...</p>
        </div>
      </div>
    );
  }

  const passedCount = testResults.filter(r => r.passed).length;
  const totalCount = testResults.length;
  const successRate = totalCount > 0 ? ((passedCount / totalCount) * 100).toFixed(0) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Testes do Módulo de Orçamentos</h1>
          <p className="text-gray-600">
            Página de validação automática das funcionalidades do módulo
          </p>
        </div>

        {/* Botão de Reexecutar */}
        <div className="mb-6">
          <Button onClick={executeTests} disabled={isRunning} className="mb-4">
            {isRunning ? 'Executando testes...' : '🔄 Reexecutar Testes'}
          </Button>
        </div>

        {/* Resumo */}
        {testResults.length > 0 && (
          <div className={`rounded-lg shadow p-6 mb-6 ${
            successRate === '100' ? 'bg-green-50 border-2 border-green-500' :
            parseFloat(successRate) >= 80 ? 'bg-yellow-50 border-2 border-yellow-500' :
            'bg-red-50 border-2 border-red-500'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">📊 Resumo dos Testes</h2>
                <p className="text-lg">
                  <span className="font-bold text-green-600">{passedCount}</span> de{' '}
                  <span className="font-bold">{totalCount}</span> testes passaram
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Taxa de sucesso: <span className="font-bold">{successRate}%</span>
                </p>
              </div>
              <div className="text-4xl">
                {successRate === '100' ? '✅' : parseFloat(successRate) >= 80 ? '⚠️' : '❌'}
              </div>
            </div>
          </div>
        )}

        {/* Resultados Individuais */}
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow p-6 ${
                result.passed ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1">
                    {result.passed ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {result.name}
                    </h3>
                    <p className={`text-sm ${
                      result.passed ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {result.message}
                    </p>
                    {result.details && (
                      <div className="mt-3 p-3 bg-gray-50 rounded text-xs overflow-auto">
                        <pre className="whitespace-pre-wrap text-gray-700">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem se não houver resultados */}
        {testResults.length === 0 && !isRunning && mounted && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">
              Nenhum teste foi executado ainda. Clique em "Reexecutar Testes" ou aguarde a execução automática.
            </p>
          </div>
        )}

        {/* Instruções */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">📝 Instruções de Teste Manual</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Acesse <code className="bg-blue-100 px-1 rounded">/cotacoes/templates</code> e verifique se 157 templates estão carregados</li>
            <li>Clique em "Usar Template" em um template e preencha os dados do cliente</li>
            <li>Modifique itens e verifique se os cálculos são atualizados automaticamente</li>
            <li>Salve o orçamento e verifique se aparece no dashboard</li>
            <li>Acesse a visualização do orçamento e teste o botão de impressão</li>
            <li>Edite um orçamento e teste as 8 abas de edição</li>
            <li>Teste a galeria de fotos: adicione por URL, edite legendas, reordene</li>
            <li>Teste a galeria de vídeos: adicione vídeos YouTube em diferentes formatos</li>
            <li>Teste templates de notas: crie, edite, exclua e aplique templates</li>
          </ol>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">🧪 Testes via Console</h4>
            <p className="text-sm text-blue-800 mb-2">
              Você também pode executar testes diretamente no console do navegador:
            </p>
            <code className="block bg-blue-100 p-2 rounded text-xs text-blue-900">
              window.testModule.runAllTests()
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
