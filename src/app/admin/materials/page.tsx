import {
  BookOpen,
  FileText,
  Video,
  Link2,
  Globe,
  Lock,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreateMaterialDialog } from '@/components/admin/create-material-dialog';
import { AssignMaterialDialog } from '@/components/admin/assign-material-dialog';
import { DeleteMaterialButton } from '@/components/admin/delete-material-button';
import { listMaterials } from '@/db/queries/materials';
import { listMathTopics } from '@/db/queries/math-topics';
import { listStudents } from '@/db/queries/students';
import { formatDatePL } from '@/lib/utils/dates';

export const dynamic = 'force-dynamic';

async function safeQuery<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

const fileTypeConfig: Record<
  string,
  { icon: typeof FileText; label: string; color: string }
> = {
  pdf: { icon: FileText, label: 'PDF', color: 'text-red-500' },
  video: { icon: Video, label: 'Wideo', color: 'text-purple-500' },
  link: { icon: Link2, label: 'Link', color: 'text-blue-500' },
};

export default async function MaterialsPage() {
  const [allMaterials, topics, students] = await Promise.all([
    safeQuery(() => listMaterials(), []),
    safeQuery(() => listMathTopics(), []),
    safeQuery(() => listStudents(), []),
  ]);

  const studentOptions = students.map((s) => ({
    id: s.id,
    label: `${s.firstName} ${s.lastName} (${s.gradeLevel})`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Materiały</h1>
          <p className="text-sm text-muted-foreground">
            Zarządzaj materiałami edukacyjnymi i przypisuj je uczniom
          </p>
        </div>
        <CreateMaterialDialog topics={topics} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{allMaterials.length}</p>
              <p className="text-xs text-muted-foreground">Materiałów</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Globe className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {allMaterials.filter((m) => m.isPublic).length}
              </p>
              <p className="text-xs text-muted-foreground">Publicznych</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {allMaterials.reduce((sum, m) => sum + m.assignmentCount, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Przypisań</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Materials list */}
      {allMaterials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <BookOpen className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Brak materiałów. Dodaj pierwszy materiał.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {allMaterials.map((material) => {
            const ftConfig =
              fileTypeConfig[material.fileType ?? ''] ?? fileTypeConfig.link;
            const Icon = ftConfig.icon;

            return (
              <div
                key={material.id}
                className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${ftConfig.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{material.title}</p>
                    {material.isPublic ? (
                      <Globe className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ftConfig.label}
                    {material.topicName && ` · ${material.topicName}`}
                    {' · '}
                    {formatDatePL(material.createdAt)}
                  </p>
                </div>
                <Badge variant="secondary">
                  {material.assignmentCount} przypisań
                </Badge>
                <div className="flex items-center gap-1">
                  <AssignMaterialDialog
                    materialId={material.id}
                    students={studentOptions}
                  />
                  <DeleteMaterialButton materialId={material.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
