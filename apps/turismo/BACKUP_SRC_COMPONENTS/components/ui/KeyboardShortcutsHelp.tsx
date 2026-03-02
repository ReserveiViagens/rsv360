import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Search, Palette, Navigation, Settings } from 'lucide-react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const { shortcuts } = useKeyboardShortcuts();
  const [activeCategory, setActiveCategory] = useState<string>('navigation');

  const categories = {
    navigation: { icon: Navigation, label: 'Navegação', color: 'blue' },
    ui: { icon: Settings, label: 'Interface', color: 'green' },
    search: { icon: Search, label: 'Busca', color: 'purple' },
    theme: { icon: Palette, label: 'Temas', color: 'orange' }
  };

  const filteredShortcuts = shortcuts.filter(s => s.category === activeCategory);

  const getKeyDisplay = (shortcut: any) => {
    const keys = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.shiftKey) keys.push('Shift');
    if (shortcut.metaKey) keys.push('Cmd');
    keys.push(shortcut.key);
    return keys.join(' + ');
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Keyboard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Atalhos de Teclado
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Navegue rapidamente pelo sistema
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              title="Fechar"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex h-[60vh]">
            {/* Categories Sidebar */}
            <div className="w-48 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Categorias
                </h3>
                <div className="space-y-1">
                  {Object.entries(categories).map(([key, category]) => (
                    <button
                      key={key}
                      onClick={() => setActiveCategory(key)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                        activeCategory === key
                          ? `bg-${category.color}-100 text-${category.color}-700 dark:bg-${category.color}-900/20 dark:text-${category.color}-300`
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <category.icon className="h-4 w-4" />
                      <span>{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Shortcuts List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`p-2 bg-${categories[activeCategory as keyof typeof categories].color}-100 dark:bg-${categories[activeCategory as keyof typeof categories].color}-900/20 rounded-lg`}>
                    {React.createElement(categories[activeCategory as keyof typeof categories].icon, {
                      className: `h-5 w-5 text-${categories[activeCategory as keyof typeof categories].color}-600 dark:text-${categories[activeCategory as keyof typeof categories].color}-400`
                    })}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {categories[activeCategory as keyof typeof categories].label}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {filteredShortcuts.length} atalhos disponíveis
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  {filteredShortcuts.map((shortcut, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {shortcut.description}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getKeyDisplay(shortcut).split(' + ').map((key, keyIndex) => (
                          <React.Fragment key={keyIndex}>
                            <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300">
                              {key}
                            </kbd>
                            {keyIndex < getKeyDisplay(shortcut).split(' + ').length - 1 && (
                              <span className="text-gray-400 text-xs">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Pressione <kbd className="px-1 py-0.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">?</kbd> para abrir esta ajuda
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
