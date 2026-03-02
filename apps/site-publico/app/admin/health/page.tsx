"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HealthPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const ping = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      const json = await res.json();
      setResult(json);
    } catch (e: any) {
      setResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { ping(); }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Monitoramento de Health</h1>
      <Card>
        <CardHeader>
          <CardTitle>Status do Backend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Button onClick={ping} disabled={loading}>{loading ? 'Verificando...' : 'Verificar novamente'}</Button>
          </div>
          <pre className="text-xs bg-black text-green-200 p-3 rounded overflow-auto max-h-[60vh]">{JSON.stringify(result, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
