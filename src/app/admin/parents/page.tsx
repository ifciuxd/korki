import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { InviteParentDialog } from '@/components/admin/invite-parent-dialog';
import { listParents } from '@/db/queries/parents';
import { formatDatePL } from '@/lib/utils/dates';

export default async function ParentsPage() {
  const parents = await listParents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rodzice</h1>
          <p className="text-sm text-muted-foreground">
            Lista zarejestrowanych rodziców i ich dzieci.
          </p>
        </div>
        <InviteParentDialog />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imię i nazwisko</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Dzieci</TableHead>
              <TableHead>Dodano</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parents.length === 0 ? (
              <TableEmpty>
                Brak zarejestrowanych rodziców. Wyślij pierwsze zaproszenie.
              </TableEmpty>
            ) : (
              parents.map((parent) => (
                <TableRow key={parent.id}>
                  <TableCell className="font-medium">
                    {parent.firstName} {parent.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {parent.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {parent.phone ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {parent.childrenCount}{' '}
                      {parent.childrenCount === 1 ? 'dziecko' : 'dzieci'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDatePL(parent.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
