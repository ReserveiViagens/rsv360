/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { GetServerSideProps } from 'next';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { SEOHead } from '@shared/components/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/EmptyState';
import { useMessages, useSendMessageMutation } from '@/hooks/use-messages';
import { formatDateTime } from '@/lib/format';
import { buildClearedPortalTokenCookie } from '@/lib/portal-session';
import { loadPortalBootstrapOrRedirect, requirePortalToken, type PortalBootstrap } from '@/lib/ssr';
import { MessageSquare } from 'lucide-react';

type MessagesProps = PortalBootstrap;

export default function MessagesPage(_props: MessagesProps) {
  const messagesQuery = useMessages();
  const sendMessageMutation = useSendMessageMutation();
  const [message, setMessage] = useState('');
  const messages = messagesQuery.data || [];
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;
    await sendMessageMutation.mutateAsync({ message });
    setMessage('');
  }

  return (
    <div className="space-y-6">
      <SEOHead
        title="Mensagens | RSV360 Guest"
        description="Converse com a recepção e acompanhe suas solicitações."
        url="https://www.reserveiviagens.com.br/messages"
        noIndex
      />

      <Card className="h-full">
        <CardHeader>
          <CardTitle>Mensagens e solicitações</CardTitle>
          <CardDescription>Este espaço reúne pedidos e feedback enviados para a equipe.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="max-h-[26rem] space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4">
            {messages.length > 0 ? (
              messages.map((item) => (
                <div
                  key={item.id}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    item.author === 'guest' ? 'ml-auto bg-brand-900 text-white' : 'bg-white text-slate-700 shadow-sm'
                  }`}
                >
                  <p>{item.message}</p>
                  <p className={`mt-2 text-[11px] ${item.author === 'guest' ? 'text-brand-100' : 'text-slate-400'}`}>
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState icon={<MessageSquare className="h-5 w-5" />} title="Sem mensagens" description="Envie uma solicitação para começar a conversa." />
            )}
            <div ref={scrollRef} />
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <Textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Escreva sua mensagem para a recepção..."
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={sendMessageMutation.isPending}>
                {sendMessageMutation.isPending ? 'Enviando...' : 'Enviar mensagem'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<MessagesProps> = async (context) => {
  const tokenResult = await requirePortalToken(context);
  if (typeof tokenResult !== 'string') {
    return tokenResult;
  }

  const bootstrapResult = await loadPortalBootstrapOrRedirect(tokenResult);
  if (bootstrapResult.kind === 'redirect') {
    context.res.setHeader('Set-Cookie', buildClearedPortalTokenCookie());
    return { redirect: bootstrapResult.redirect };
  }

  return { props: bootstrapResult.props };
};
