"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  description?: string;
  children?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  loading: Loader2,
};

const colors = {
  success: 'text-green-600 bg-green-50 dark:bg-green-950',
  error: 'text-red-600 bg-red-50 dark:bg-red-950',
  warning: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950',
  info: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
  loading: 'text-gray-600 bg-gray-50 dark:bg-gray-950',
};

/**
 * ✅ STATUS MODAL
 * 
 * Modal com diferentes status visuais:
 * - Success
 * - Error
 * - Warning
 * - Info
 * - Loading
 */
export function StatusModal({
  open,
  onOpenChange,
  status,
  title,
  description,
  children,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
}: StatusModalProps) {
  const Icon = icons[status];
  const isAnimated = status === 'loading';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={cn('p-3 rounded-full', colors[status])}>
              {isAnimated ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Icon className="h-6 w-6" />
                </motion.div>
              ) : (
                <Icon className="h-6 w-6" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription className="mt-2">{description}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            {children}
          </motion.div>
        )}

        {(onConfirm || onCancel) && (
          <div className="flex justify-end gap-2 mt-6">
            {onCancel && (
              <button
                onClick={() => {
                  onCancel();
                  onOpenChange(false);
                }}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {cancelLabel}
              </button>
            )}
            {onConfirm && (
              <button
                onClick={() => {
                  onConfirm();
                  if (status !== 'loading') {
                    onOpenChange(false);
                  }
                }}
                className={cn(
                  'px-4 py-2 text-sm font-medium text-white rounded-md transition-colors',
                  status === 'error' && 'bg-red-600 hover:bg-red-700',
                  status === 'warning' && 'bg-yellow-600 hover:bg-yellow-700',
                  status === 'success' && 'bg-green-600 hover:bg-green-700',
                  status === 'info' && 'bg-blue-600 hover:bg-blue-700',
                  status === 'loading' && 'bg-gray-600 cursor-not-allowed'
                )}
                disabled={status === 'loading'}
              >
                {confirmLabel}
              </button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

