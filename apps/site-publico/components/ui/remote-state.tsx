"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";

type RemoteStatus = "loading" | "success" | "error";

interface RemoteStateProps {
  status: RemoteStatus;
  error?: string | null;
  loadingText?: string;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  retryLabel?: string;
  onRetry?: () => void;
  children: ReactNode;
}

export function RemoteState({
  status,
  error,
  loadingText = "Carregando...",
  empty = false,
  emptyTitle = "Nenhum dado encontrado",
  emptyDescription,
  retryLabel = "Tentar novamente",
  onRetry,
  children,
}: RemoteStateProps) {
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" text={loadingText} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-4">
        <ErrorMessage
          error={error || "Nao foi possivel carregar os dados."}
          userMessage={error || "Nao foi possivel carregar os dados."}
        />
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-semibold text-gray-800">{emptyTitle}</h3>
        {emptyDescription && <p className="text-gray-600 mt-2">{emptyDescription}</p>}
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-4">
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
