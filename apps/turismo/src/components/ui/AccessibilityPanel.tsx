import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Accessibility, 
  Eye, 
  Type, 
  MousePointer, 
  Volume2, 
  Settings,
  X,
  Check,
  Minus,
  Plus
} from 'lucide-react';
import { useAccessibility } from '../../hooks/useAccessibility';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessibilityPanel({ isOpen, onClose }: AccessibilityPanelProps) {
  const { 
    config, 
    updateConfig, 
    announce,
    toggleReducedMotion,
    toggleHighContrast,
    changeFontSize,
    toggleFocusVisible
  } = useAccessibility();

  const [activeTab, setActiveTab] = useState<'visual' | 'motion' | 'keyboard'>('visual');

  const tabs = [
    { id: 'visual', label: 'Visual', icon: Eye },
    { id: 'motion', label: 'Movimento', icon: MousePointer },
    { id: 'keyboard', label: 'Teclado', icon: Settings }
  ];

  const handleToggle = (key: keyof typeof config, label: string) => {
    const newValue = !config[key];
    updateConfig({ [key]: newValue });
    announce(`${label} ${newValue ? 'habilitado' : 'desabilitado'}`);
  };

  const handleFontSizeChange = (size: 'small' | 'medium' | 'large') => {
    changeFontSize(size);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-labelledby="accessibility-panel-title"
          aria-describedby="accessibility-panel-description"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Accessibility className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 id="accessibility-panel-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                  Configurações de Acessibilidade
                </h2>
                <p id="accessibility-panel-description" className="text-sm text-gray-500 dark:text-gray-400">
                  Personalize a experiência para suas necessidades
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              aria-label="Fechar painel de acessibilidade"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700" role="tablist">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                aria-selected={activeTab === tab.id ? 'true' : 'false'}
                role="tab"
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-96">
            <AnimatePresence mode="wait">
              {activeTab === 'visual' && (
                <motion.div
                  key="visual"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* High Contrast */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Eye className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Alto Contraste
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Melhora a visibilidade dos elementos
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle('highContrast', 'Alto contraste')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        config.highContrast ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      role="switch"
                      aria-checked={config.highContrast ? 'true' : 'false'}
                      aria-label="Alternar alto contraste"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          config.highContrast ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Font Size */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Type className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Tamanho da Fonte
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Ajuste o tamanho do texto
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => handleFontSizeChange(size)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            config.fontSize === size
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                          aria-pressed={config.fontSize === size ? 'true' : 'false'}
                        >
                          {size === 'small' && <Minus className="h-4 w-4" />}
                          {size === 'medium' && <Type className="h-4 w-4" />}
                          {size === 'large' && <Plus className="h-4 w-4" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Focus Visible */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <MousePointer className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Indicador de Foco
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Mostra claramente o elemento focado
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle('focusVisible', 'Indicador de foco')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        config.focusVisible ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      role="switch"
                      aria-checked={config.focusVisible ? 'true' : 'false'}
                      aria-label="Alternar indicador de foco"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          config.focusVisible ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'motion' && (
                <motion.div
                  key="motion"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Reduced Motion */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                        <MousePointer className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          Movimento Reduzido
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Reduz animações e transições
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle('reducedMotion', 'Movimento reduzido')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        config.reducedMotion ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      role="switch"
                      aria-checked={config.reducedMotion ? 'true' : 'false'}
                      aria-label="Alternar movimento reduzido"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          config.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'keyboard' && (
                <motion.div
                  key="keyboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                      Atalhos de Acessibilidade
                    </h3>
                    <div className="space-y-3">
                      {[
                        { keys: ['Alt', '0'], description: 'Pular para o conteúdo' },
                        { keys: ['Alt', '1'], description: 'Pular para a navegação' },
                        { keys: ['Alt', 'M'], description: 'Alternar movimento reduzido' },
                        { keys: ['Alt', 'C'], description: 'Alternar alto contraste' },
                        { keys: ['Alt', 'F'], description: 'Alternar indicador de foco' },
                        { keys: ['Tab'], description: 'Navegar entre elementos' },
                        { keys: ['Enter'], description: 'Ativar elemento focado' },
                        { keys: ['Esc'], description: 'Fechar modais/dropdowns' }
                      ].map((shortcut, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center space-x-1">
                            {shortcut.keys.map((key, keyIndex) => (
                              <React.Fragment key={keyIndex}>
                                <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300">
                                  {key}
                                </kbd>
                                {keyIndex < shortcut.keys.length - 1 && (
                                  <span className="text-gray-400 text-xs">+</span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Configurações salvas automaticamente
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
