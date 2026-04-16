/**
 * RSV360 PMS/CRM — Reservei Viagens
 * Copyright (c) 2024-2026 Reservei Viagens LTDA. Todos os direitos reservados.
 * Desenvolvido por Douglas P. Figueiredo <douglas@reserveiviagens.com.br>
 * @author Douglas P. Figueiredo
 * @license UNLICENSED
 */
import type { GetServerSideProps } from 'next';
import { useEffect, useState } from 'react';
import { SEOHead } from '@shared/components/SEOHead';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useProfile, useProfileMutation } from '@/hooks/use-profile';
import { useBooking } from '@/hooks/use-reservations';
import type { GuestProfile } from '@/types/auth';
import { loadPortalBootstrap, requirePortalToken, type PortalBootstrap } from '@/lib/ssr';

type ProfileProps = PortalBootstrap;

export default function ProfilePage(props: ProfileProps) {
  const profileQuery = useProfile(props.guest || undefined);
  const bookingQuery = useBooking(props.booking && props.guest ? { booking: props.booking, guest: props.guest } : undefined);
  const profileMutation = useProfileMutation();
  const [profile, setProfile] = useState<GuestProfile>({});

  useEffect(() => {
    if (profileQuery.data) {
      setProfile(profileQuery.data);
      return;
    }

    if (bookingQuery.data?.guest) {
      setProfile(bookingQuery.data.guest);
    }
  }, [bookingQuery.data?.guest, profileQuery.data]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await profileMutation.mutateAsync(profile);
  }

  return (
    <div className="space-y-6">
      <SEOHead
        title="Perfil | RSV360 Guest"
        description="Atualize seus dados pessoais e preferências de hospedagem."
        url="https://www.reserveiviagens.com.br/profile"
        noIndex
      />
      <Card>
        <CardHeader>
          <CardTitle>Perfil do hóspede</CardTitle>
          <CardDescription>Revise seus dados e preferências para futuras estadias.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={String(profile.name || '')}
                  onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  value={String(profile.email || '')}
                  onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={String(profile.phone || '')}
                  onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentNumber">Documento</Label>
                <Input
                  id="documentNumber"
                  value={String(profile.documentNumber || profile.document || '')}
                  onChange={(event) => setProfile((current) => ({ ...current, documentNumber: event.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="roomType">Tipo de quarto preferido</Label>
                <Input
                  id="roomType"
                  value={String(profile.preferences?.roomType || '')}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      preferences: { ...(current.preferences || {}), roomType: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredFloor">Andar preferido</Label>
                <Input
                  id="preferredFloor"
                  value={String(profile.preferences?.preferredFloor || '')}
                  onChange={(event) =>
                    setProfile((current) => ({
                      ...current,
                      preferences: { ...(current.preferences || {}), preferredFloor: event.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialRequests">Preferências e restrições</Label>
              <Textarea
                id="specialRequests"
                value={String(profile.preferences?.specialRequests || profile.preferences?.allergies || '')}
                onChange={(event) =>
                  setProfile((current) => ({
                    ...current,
                    preferences: { ...(current.preferences || {}), specialRequests: event.target.value },
                  }))
                }
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={profileMutation.isPending}>
                {profileMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.localStorage.setItem('rsv360_guest_profile', JSON.stringify(profile));
                  }
                }}
              >
                Salvar localmente
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<ProfileProps> = async (context) => {
  const tokenResult = await requirePortalToken(context);
  if (typeof tokenResult !== 'string') {
    return tokenResult as any;
  }

  try {
    return { props: await loadPortalBootstrap(tokenResult) };
  } catch {
    return {
      props: {
        booking: null,
        guest: null,
        requests: [],
        feedback: null,
        checkinStatus: null,
      },
    };
  }
};
