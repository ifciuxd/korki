import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  TrendingUp,
  MessageCircle,
  ClipboardList,
  Star,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Korepetycje Matematyka
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Zaloguj się</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/login">
                Zacznij naukę
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
            <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-primary/8 blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="text-muted-foreground">
                  Indywidualne podejście do każdego ucznia
                </span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Matematyka
                <br />
                <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                  staje się prosta
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Korepetycje z matematyki dostosowane do Twoich potrzeb.
                Egzamin ósmoklasisty, matura, studia — razem osiągniemy cel.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Button size="lg" className="px-8 text-base" asChild>
                  <Link href="/auth/login">
                    Zacznij naukę
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 text-base"
                  asChild
                >
                  <Link href="#jak-to-dziala">Dowiedz się więcej</Link>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mx-auto mt-20 grid max-w-2xl grid-cols-3 gap-8">
              <StatItem value="1:1" label="Lekcje indywidualne" />
              <StatItem value="Online" label="Wygodnie z domu" />
              <StatItem value="24/7" label="Dostęp do materiałów" />
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="jak-to-dziala"
          className="border-t bg-gradient-to-b from-muted/60 to-background py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
                Platforma
              </p>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Wszystko czego potrzebujesz do nauki
              </h2>
              <p className="mt-4 text-muted-foreground">
                Jedna platforma łącząca ucznia, rodzica i korepetytora.
                Rezerwuj lekcje, śledź postępy i ucz się efektywnie.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Calendar className="h-6 w-6" />}
                title="Rezerwacja online"
                description="Wybierz wygodny termin z kalendarza dostępności. Odwołaj lub przenieś lekcję jednym kliknięciem."
                color="bg-blue-50 text-blue-600"
              />
              <FeatureCard
                icon={<BookOpen className="h-6 w-6" />}
                title="Materiały i zadania"
                description="Dostęp do materiałów dopasowanych do poziomu. PDFy, filmy, linki — wszystko w jednym miejscu."
                color="bg-emerald-50 text-emerald-600"
              />
              <FeatureCard
                icon={<ClipboardList className="h-6 w-6" />}
                title="Zadania domowe"
                description="Korepetytor przypisuje zadania, uczeń przesyła rozwiązania. Oceny i komentarze zwrotne online."
                color="bg-purple-50 text-purple-600"
              />
              <FeatureCard
                icon={<TrendingUp className="h-6 w-6" />}
                title="Raporty z lekcji"
                description="Po każdej lekcji szczegółowy raport: omówione tematy, ocena i notatki dla rodzica."
                color="bg-amber-50 text-amber-600"
              />
              <FeatureCard
                icon={<MessageCircle className="h-6 w-6" />}
                title="Pytania i odpowiedzi"
                description="Utknąłeś przy zadaniu? Zadaj pytanie korepetytorowi w dowolnym momencie, nie czekając na lekcję."
                color="bg-rose-50 text-rose-600"
              />
              <FeatureCard
                icon={<GraduationCap className="h-6 w-6" />}
                title="Cel: Egzamin"
                description="Przygotowanie do egzaminu ósmoklasisty, matury podstawowej i rozszerzonej z matematyki."
                color="bg-primary/10 text-primary"
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
                Jak zacząć
              </p>
              <h2 className="text-3xl font-bold sm:text-4xl">
                3 proste kroki
              </h2>
            </div>

            <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
              <StepCard
                number="1"
                title="Otrzymaj zaproszenie"
                description="Korepetytor wysyła Ci e-mail z linkiem do rejestracji. Kliknij i utwórz konto."
              />
              <StepCard
                number="2"
                title="Wybierz pakiet"
                description="Wykup pakiet godzin. Płatność przelewem lub gotówką — elastycznie."
              />
              <StepCard
                number="3"
                title="Zarezerwuj lekcję"
                description="Wybierz termin z kalendarza i zacznij się uczyć. To takie proste!"
              />
            </div>
          </div>
        </section>

        {/* Exam targets */}
        <section className="border-t bg-gradient-to-b from-muted/60 to-background py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
                Poziomy
              </p>
              <h2 className="text-3xl font-bold sm:text-4xl">
                Przygotowanie na każdy poziom
              </h2>
            </div>

            <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
              <ExamCard
                title="Egzamin ósmoklasisty"
                items={[
                  'Arytmetyka i algebra',
                  'Geometria płaska',
                  'Statystyka i prawdopodobieństwo',
                  'Zadania z treścią',
                ]}
              />
              <ExamCard
                title="Matura podstawowa"
                highlight
                items={[
                  'Funkcje i ich własności',
                  'Ciągi arytmetyczne i geometryczne',
                  'Trygonometria',
                  'Stereometria',
                ]}
              />
              <ExamCard
                title="Matura rozszerzona"
                items={[
                  'Analiza matematyczna',
                  'Liczby zespolone',
                  'Rachunek różniczkowy',
                  'Dowody matematyczne',
                ]}
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-br from-primary to-orange-500 p-8 text-center text-primary-foreground sm:p-12">
              <GraduationCap className="mx-auto mb-4 h-10 w-10" />
              <h2 className="text-2xl font-bold sm:text-3xl">
                Gotowy na lepsze oceny?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm opacity-90 sm:text-base">
                Skontaktuj się z korepetytorem, aby otrzymać zaproszenie
                i rozpocząć naukę na platformie.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="mt-8 px-8 text-base font-semibold"
                asChild
              >
                <Link href="/auth/login">
                  Zaloguj się
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-semibold">Korepetycje Matematyka</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Wszelkie prawa zastrzeżone.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-primary sm:text-3xl">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/5">
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${color} transition-transform group-hover:scale-110`}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
        {number}
      </div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function ExamCard({
  title,
  items,
  highlight = false,
}: {
  title: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 transition-shadow hover:shadow-lg ${
        highlight
          ? 'border-primary bg-gradient-to-b from-primary/5 to-transparent ring-1 ring-primary/20'
          : 'bg-card'
      }`}
    >
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-muted-foreground">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
