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
import { InviteStudentDialog } from '@/components/admin/invite-student-dialog';
import { listStudents } from '@/db/queries/students';
import { listParentsForSelect } from '@/db/queries/parents';
import { formatDatePL } from '@/lib/utils/dates';
import { EXAM_TARGETS } from '@/lib/constants';

export const dynamic = 'force-dynamic';

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

export default async function StudentsPage() {
  const [students, parents] = await Promise.all([
    safeQuery(() => listStudents(), []),
    safeQuery(() => listParentsForSelect(), []),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Uczniowie</h1>
          <p className="text-sm text-muted-foreground">
            Lista zarejestrowanych uczniów.
          </p>
        </div>
        <InviteStudentDialog parents={parents} />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imię i nazwisko</TableHead>
              <TableHead>Klasa</TableHead>
              <TableHead>Cel egzaminu</TableHead>
              <TableHead>Rodzic</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Dodano</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableEmpty>
                Brak zarejestrowanych uczniów. Wyślij pierwsze zaproszenie.
              </TableEmpty>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell>{student.gradeLevel}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {EXAM_TARGETS[student.examTarget]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.parentName ?? '—'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.email}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDatePL(student.createdAt)}
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
