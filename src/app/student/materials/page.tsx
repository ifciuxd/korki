import {
  BookOpen,
  FileText,
  Video,
  Link2,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requireRole } from '@/lib/auth/session';
import { getStudentProfileIdByUserId } from '@/db/queries/student-session';
import { listMaterialsForStudent } from '@/db/queries/materials';
import { formatDatePL } from '@/lib/utils/dates';

const fileTypeConfig: Record<
  string,
  { icon: typeof FileText; label: string; color: string }
> = {
  pdf: { icon: FileText, label: 'PDF', color: 'text-red-500 bg-red-50' },
  video: { icon: Video, label: 'Wideo', color: 'text-purple-500 bg-purple-50' },
  link: { icon: Link2, label: 'Link', color: 'text-blue-500 bg-blue-50' },
};

export default async function StudentMaterialsPage() {
  const session = await requireRole('student');
  const profileId = await getStudentProfileIdByUserId(session.userId);

  if (!profileId) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">
          Profil ucznia nie został znaleziony.
        </p>
      </div>
    );
  }

  const studentMaterials = await listMaterialsForStudent(profileId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Materiały</h1>
        <p className="text-sm text-muted-foreground">
          Materiały edukacyjne przypisane przez korepetytora
        </p>
      </div>

      {studentMaterials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <BookOpen className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nie masz jeszcze przypisanych materiałów
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {studentMaterials.map((material) => {
            const ftConfig =
              fileTypeConfig[material.fileType ?? ''] ?? fileTypeConfig.link;
            const Icon = ftConfig.icon;
            const url = material.fileUrl ?? material.externalUrl;

            return (
              <Card
                key={material.id}
                className="group overflow-hidden transition-shadow hover:shadow-lg"
              >
                <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${ftConfig.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{material.title}</h3>
                      {material.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
                          {material.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{ftConfig.label}</Badge>
                        {material.topicName && (
                          <Badge variant="outline">{material.topicName}</Badge>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Przypisano {formatDatePL(material.assignedAt)}
                      </p>
                    </div>
                  </div>
                  {url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                      asChild
                    >
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        Otwórz
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
