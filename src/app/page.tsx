import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, Calendar, BookOpen, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Korepetycje Matematyka</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Zaloguj się</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Matematyka staje się{' '}
            <span className="text-primary">prosta</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Indywidualne korepetycje z matematyki dostosowane do Twoich potrzeb.
            Przygotowanie do egzaminu ósmoklasisty i matury.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/login">Zacznij naukę</Link>
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/50 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Jak to działa?
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={<Calendar className="h-8 w-8" />}
                title="Rezerwacja online"
                description="Wybierz wygodny termin lekcji z dostępnego kalendarza."
              />
              <FeatureCard
                icon={<BookOpen className="h-8 w-8" />}
                title="Materiały"
                description="Dostęp do materiałów i zadań dopasowanych do poziomu."
              />
              <FeatureCard
                icon={<TrendingUp className="h-8 w-8" />}
                title="Śledzenie postępów"
                description="Raporty po każdej lekcji i mapa opanowanych działów."
              />
              <FeatureCard
                icon={<GraduationCap className="h-8 w-8" />}
                title="Przygotowanie do egzaminów"
                description="Egzamin ósmoklasisty, matura podstawowa i rozszerzona."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Korepetycje Matematyka. Wszelkie prawa zastrzeżone.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-4 rounded-lg bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
