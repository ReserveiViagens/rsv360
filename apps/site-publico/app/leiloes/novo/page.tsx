import Link from "next/link";
import { Gavel, ArrowLeft, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NovoLeilaoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Gavel className="w-7 h-7" />
          Novo Leilão - em breve
        </h1>
        <p className="text-muted-foreground">
          A criação assistida de leilões está em fase final de desenvolvimento.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>O que estará disponível aqui</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>- Criação de lote com regras de lance e duração.</p>
          <p>- Vínculo de produto/imóvel com disponibilidade.</p>
          <p>- Publicação e monitoramento em tempo real.</p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/leiloes">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Leilões
          </Button>
        </Link>
        <Link href="/admin/cms">
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Ir para Painel Admin
          </Button>
        </Link>
      </div>
    </div>
  );
}
