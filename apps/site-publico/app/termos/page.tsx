import Link from "next/link";
import { FileText, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TermosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-7 h-7" />
          Termos de Uso - em elaboracao
        </h1>
        <p className="text-muted-foreground">
          Versao preliminar para orientacao dos usuarios da plataforma RSV360.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Escopo e responsabilidades</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            Este documento define regras basicas de uso da plataforma, direitos e deveres das partes,
            alem de condicoes para uso dos servicos digitais.
          </p>
          <p>
            A versao juridica completa sera publicada nesta mesma rota. Ate la, em caso de duvidas,
            utilize os canais oficiais de atendimento.
          </p>
          <div className="flex items-start gap-2 p-3 rounded-md bg-blue-50 border border-blue-200">
            <ShieldCheck className="w-4 h-4 mt-0.5 text-blue-600" />
            <p className="text-blue-800">
              Este conteudo e temporario e sera substituido por uma versao legal final.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/politica-privacidade">
          <Button variant="outline">Politica de Privacidade</Button>
        </Link>
        <Link href="/contato">
          <Button>Entrar em contato</Button>
        </Link>
      </div>
    </div>
  );
}
