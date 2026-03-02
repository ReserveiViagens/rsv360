"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LogsPage() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Placeholder: em produção, poderíamos ler via endpoint dedicado
    setLogs([]);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Logs Estruturados</h1>
      <Card>
        <CardHeader>
          <CardTitle>Últimos Registros</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem registros disponíveis nesta visualização.</div>
          ) : (
            <pre className="text-xs bg-black text-green-200 p-3 rounded overflow-auto max-h-[60vh]">{logs.join('\n')}</pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
