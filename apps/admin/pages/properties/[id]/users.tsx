import { useRouter } from 'next/router';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { usePropertyUsers } from '@/src/modules/properties/hooks';
import { Badge } from '@/components/ui/badge';

export default function PropertyUsersPage() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  const { data = [] } = usePropertyUsers(id);

  return (
    <div className="space-y-6">
      <PageHeader badge="Multi-property" title="Usuários da propriedade" description="Owner, admin, manager e staff." actions={<Button asChild variant="outline"><Link href={`/properties/${id}`}>Voltar</Link></Button>} />
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-4">
          <Input placeholder="E-mail do usuário" />
          <Select defaultValue=""><option value="">Role</option><option value="admin">Admin</option><option value="manager">Manager</option></Select>
          <Input placeholder="Permissões" />
          <Button>Adicionar</Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((user) => (
          <Card key={user.id}>
            <CardContent className="space-y-2 p-4">
              <p className="font-medium text-slate-900">User {user.user_id}</p>
              <Badge variant="outline">{user.role}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
