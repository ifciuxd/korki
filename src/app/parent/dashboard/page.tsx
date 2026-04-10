import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Package } from 'lucide-react';
import Link from 'next/link';

export default function ParentDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Panel rodzica</h1>

      {/* Quick actions */}
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/parent/book-lesson">
            <CalendarPlus className="mr-2 h-4 w-4" />
            Zarezerwuj lekcję
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/parent/buy-package">
            <Package className="mr-2 h-4 w-4" />
            Kup pakiet
          </Link>
        </Button>
      </div>

      {/* Children overview */}
      <Card>
        <CardHeader>
          <CardTitle>Moje dzieci</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Brak przypisanych uczniów. Skontaktuj się z korepetytorem.
          </p>
        </CardContent>
      </Card>

      {/* Upcoming lessons */}
      <Card>
        <CardHeader>
          <CardTitle>Nadchodzące lekcje</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Brak zaplanowanych lekcji.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
