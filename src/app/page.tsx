import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  TrendingUp,
  MessageCircle,
  ClipboardList,
  CheckCircle2,
  ArrowRight,
  Phone,
  Clock,
  Users,
  Sparkles,
  Target,
  Shield,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 text-primary-foreground shadow-lg shadow-primary/25">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Korepetycje<span className="text-primary"> Matematyka</span>
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/auth/login">Zaloguj się</Link>
            </Button>
            <Button size="sm" className="cta-glow shadow-lg shadow-primary/25" asChild>
              <Link href="/auth/login">
                Umów lekcję
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary/6 blur-3xl" />
            <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-orange-400/8 blur-3xl" />
            <div className="absolute bottom-0 left-1/2 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-amber-300/6 blur-3xl" />
          </div>

          {/* Floating math symbols */}
          <div className="pointer-events-none absolute inset-0 -z-5 overflow-hidden" aria-hidden="true">
            <span className="absolute left-[10%] top-[15%] text-4xl text-primary/10 animate-float">+</span>
            <span className="absolute left-[85%] top-[20%] text-5xl text-primary/8 animate-float-delayed">&#x3C0;</span>
            <span className="absolute left-[75%] top-[60%] text-3xl text-orange-400/10 animate-float-slow">&#x221A;</span>
            <span className="absolute left-[15%] top-[70%] text-4xl text-primary/8 animate-float-delayed">&#x2211;</span>
            <span className="absolute left-[50%] top-[10%] text-3xl text-amber-400/10 animate-float-slow">&#x222B;</span>
            <span className="absolute left-[30%] top-[80%] text-5xl text-primary/6 animate-float">&#x0394;</span>
          </div>

          <div className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:pb-24 sm:pt-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="animate-hero-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Indywidualne korepetycje z matematyki</span>
              </div>

              <h1 className="animate-hero-slide-up text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Matematyka
                <br />
                <span className="animate-gradient-text bg-gradient-to-r from-primary via-orange-500 to-amber-400 bg-clip-text text-transparent">
                  staje się prosta
                </span>
              </h1>

              <p className="animate-hero-slide-up mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl" style={{ animationDelay: '200ms' }}>
                Korepetycje z matematyki dostosowane do Twoich potrzeb.
                Egzamin ósmoklasisty, matura, studia — razem osiągniemy cel.
              </p>

              <div className="animate-hero-slide-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center" style={{ animationDelay: '400ms' }}>
                <Button size="lg" className="cta-glow px-8 text-base shadow-xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/40" asChild>
                  <Link href="/auth/login">
                    <Phone className="mr-2 h-4 w-4" />
                    Umów pierwszą lekcję
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 text-base transition-all hover:scale-105"
                  asChild
                >
                  <Link href="#jak-to-dziala">Dowiedz się więcej</Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className="animate-hero-slide-up mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground" style={{ animationDelay: '600ms' }}>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Pierwsza lekcja próbna
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Bez zobowiązań
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Elastyczne terminy
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4 sm:mt-20">
              <AnimateOnScroll animation="scale-in" delay={0}>
                <StatCard value="1:1" label="Lekcje indywidualne" icon={<Users className="h-5 w-5" />} />
              </AnimateOnScroll>
              <AnimateOnScroll animation="scale-in" delay={100}>
                <StatCard value="Online" label="Wygodnie z domu" icon={<Target className="h-5 w-5" />} />
              </AnimateOnScroll>
              <AnimateOnScroll animation="scale-in" delay={200}>
                <StatCard value="24/7" label="Dostęp do materiałów" icon={<BookOpen className="h-5 w-5" />} />
              </AnimateOnScroll>
              <AnimateOnScroll animation="scale-in" delay={300}>
                <StatCard value="60min" label="Lekcja" icon={<Clock className="h-5 w-5" />} />
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="jak-to-dziala"
          className="border-t bg-gradient-to-b from-muted/50 to-background py-20 sm:py-28"
        >
          <div className="mx-auto max-w-6xl px-4">
            <AnimateOnScroll animation="fade-up">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                  Platforma
                </p>
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Wszystko czego potrzebujesz do nauki
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Jedna platforma łącząca ucznia, rodzica i korepetytora.
                  Rezerwuj lekcje, śledź postępy i ucz się efektywnie.
                </p>
              </div>
            </AnimateOnScroll>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <AnimateOnScroll animation="fade-up" delay={0}>
                <FeatureCard
                  icon={<Calendar className="h-6 w-6" />}
                  title="Rezerwacja online"
                  description="Wybierz wygodny termin z kalendarza dostępności. Odwołaj lub przenieś lekcję jednym kliknięciem."
                  gradient="from-blue-500/10 to-blue-600/5"
                  iconBg="bg-blue-100 text-blue-600"
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={100}>
                <FeatureCard
                  icon={<BookOpen className="h-6 w-6" />}
                  title="Materiały i zadania"
                  description="Dostęp do materiałów dopasowanych do poziomu. PDFy, filmy, linki — wszystko w jednym miejscu."
                  gradient="from-emerald-500/10 to-emerald-600/5"
                  iconBg="bg-emerald-100 text-emerald-600"
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={200}>
                <FeatureCard
                  icon={<ClipboardList className="h-6 w-6" />}
                  title="Zadania domowe"
                  description="Korepetytor przypisuje zadania, uczeń przesyła rozwiązania. Oceny i komentarze zwrotne online."
                  gradient="from-purple-500/10 to-purple-600/5"
                  iconBg="bg-purple-100 text-purple-600"
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={300}>
                <FeatureCard
                  icon={<TrendingUp className="h-6 w-6" />}
                  title="Raporty z lekcji"
                  description="Po każdej lekcji szczegółowy raport: omówione tematy, ocena i notatki dla rodzica."
                  gradient="from-amber-500/10 to-amber-600/5"
                  iconBg="bg-amber-100 text-amber-600"
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={400}>
                <FeatureCard
                  icon={<MessageCircle className="h-6 w-6" />}
                  title="Pytania i odpowiedzi"
                  description="Utknąłeś przy zadaniu? Zadaj pytanie korepetytorowi w dowolnym momencie, nie czekając na lekcję."
                  gradient="from-rose-500/10 to-rose-600/5"
                  iconBg="bg-rose-100 text-rose-600"
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={500}>
                <FeatureCard
                  icon={<GraduationCap className="h-6 w-6" />}
                  title="Cel: Egzamin"
                  description="Przygotowanie do egzaminu ósmoklasisty, matury podstawowej i rozszerzonej z matematyki."
                  gradient="from-primary/10 to-orange-500/5"
                  iconBg="bg-orange-100 text-primary"
                />
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <AnimateOnScroll animation="fade-up">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                  Jak zacząć
                </p>
                <h2 className="text-3xl font-bold sm:text-4xl">
                  3 proste kroki do lepszych ocen
                </h2>
              </div>
            </AnimateOnScroll>

            <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-3">
              <AnimateOnScroll animation="fade-right" delay={0}>
                <StepCard
                  number="1"
                  title="Umów się na lekcję"
                  description="Skontaktuj się ze mną i umów pierwszą lekcję próbną. Sprawdzimy Twój poziom i ustalimy plan nauki."
                  color="from-blue-500 to-blue-600"
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={150}>
                <StepCard
                  number="2"
                  title="Wybierz pakiet"
                  description="Wykup pakiet godzin dopasowany do Twoich potrzeb. Płatność przelewem lub gotówką — elastycznie."
                  color="from-primary to-orange-500"
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-left" delay={300}>
                <StepCard
                  number="3"
                  title="Ucz się i rozwijaj"
                  description="Rezerwuj lekcje, rób zadania, śledź postępy. Materiały i pomoc dostępne zawsze, gdy potrzebujesz."
                  color="from-emerald-500 to-emerald-600"
                />
              </AnimateOnScroll>
            </div>

            {/* Mid-page CTA */}
            <AnimateOnScroll animation="scale-in" delay={200}>
              <div className="mx-auto mt-14 max-w-md text-center">
                <Button size="lg" className="cta-glow px-10 text-base shadow-xl shadow-primary/30 transition-all hover:scale-105" asChild>
                  <Link href="/auth/login">
                    Umów pierwszą lekcję
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <p className="mt-3 text-sm text-muted-foreground">Pierwsza lekcja próbna</p>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        {/* Exam targets */}
        <section className="border-t bg-gradient-to-b from-muted/50 to-background py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <AnimateOnScroll animation="fade-up">
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                  Poziomy
                </p>
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Przygotowanie na każdy poziom
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Niezależnie od poziomu — pomogę Ci osiągnąć wymarzony wynik.
                </p>
              </div>
            </AnimateOnScroll>

            <div className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-3">
              <AnimateOnScroll animation="fade-up" delay={0}>
                <ExamCard
                  title="Egzamin ósmoklasisty"
                  emoji="📐"
                  items={[
                    'Arytmetyka i algebra',
                    'Geometria płaska',
                    'Statystyka i prawdopodobieństwo',
                    'Zadania z treścią',
                  ]}
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={150}>
                <ExamCard
                  title="Matura podstawowa"
                  emoji="📊"
                  highlight
                  items={[
                    'Funkcje i ich własności',
                    'Ciągi arytmetyczne i geometryczne',
                    'Trygonometria',
                    'Stereometria',
                  ]}
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={300}>
                <ExamCard
                  title="Matura rozszerzona"
                  emoji="🧮"
                  items={[
                    'Analiza matematyczna',
                    'Liczby zespolone',
                    'Rachunek różniczkowy',
                    'Dowody matematyczne',
                  ]}
                />
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Why me / social proof */}
        <section className="border-t py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <AnimateOnScroll animation="fade-up">
              <div className="mx-auto mb-16 max-w-2xl text-center">
                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                  Dlaczego warto
                </p>
                <h2 className="text-3xl font-bold sm:text-4xl">
                  Skuteczna nauka, realne wyniki
                </h2>
              </div>
            </AnimateOnScroll>

            <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
              <AnimateOnScroll animation="fade-right" delay={0}>
                <BenefitCard
                  icon={<Target className="h-5 w-5" />}
                  title="Indywidualny plan nauki"
                  description="Każdy uczeń ma inny poziom i cele. Tworzę spersonalizowany plan, który prowadzi do konkretnych wyników."
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-left" delay={100}>
                <BenefitCard
                  icon={<Clock className="h-5 w-5" />}
                  title="Elastyczne terminy"
                  description="Lekcje online w godzinach, które Ci odpowiadają. Odwołanie lub przeniesienie do 24h przed lekcją."
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-right" delay={200}>
                <BenefitCard
                  icon={<TrendingUp className="h-5 w-5" />}
                  title="Widoczne postępy"
                  description="Raporty po każdej lekcji, śledzenie opanowanych tematów i regularna informacja zwrotna dla rodziców."
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-left" delay={300}>
                <BenefitCard
                  icon={<MessageCircle className="h-5 w-5" />}
                  title="Wsparcie między lekcjami"
                  description="Utknąłeś przy zadaniu? Napisz do mnie w dowolnym momencie — nie musisz czekać do następnej lekcji."
                />
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4">
            <AnimateOnScroll animation="scale-in">
              <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-orange-500 to-amber-500 p-1">
                <div className="rounded-[calc(1.5rem-4px)] bg-gradient-to-br from-primary via-orange-500 to-amber-500 px-8 py-12 text-center text-primary-foreground sm:px-16 sm:py-16">
                  {/* Background pattern */}
                  <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden="true">
                    <div className="absolute left-[10%] top-[20%] text-6xl animate-float">+</div>
                    <div className="absolute right-[15%] top-[30%] text-4xl animate-float-delayed">&#x3C0;</div>
                    <div className="absolute left-[20%] bottom-[20%] text-5xl animate-float-slow">&#x221A;</div>
                    <div className="absolute right-[25%] bottom-[25%] text-3xl animate-float">&#x0394;</div>
                  </div>

                  <div className="relative">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                      <GraduationCap className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-bold sm:text-4xl">
                      Gotowy na lepsze oceny?
                    </h2>
                    <p className="mx-auto mt-4 max-w-lg text-base opacity-90 sm:text-lg">
                      Umów się na pierwszą lekcję próbną i przekonaj się,
                      że matematyka może być prosta i przyjemna.
                    </p>
                    <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                      <Button
                        size="lg"
                        variant="secondary"
                        className="px-8 text-base font-semibold shadow-xl transition-all hover:scale-105"
                        asChild
                      >
                        <Link href="/auth/login">
                          <Phone className="mr-2 h-4 w-4" />
                          Umów pierwszą lekcję
                        </Link>
                      </Button>
                      <Button
                        size="lg"
                        variant="ghost"
                        className="border border-white/30 px-8 text-base text-white hover:bg-white/10 hover:text-white"
                        asChild
                      >
                        <Link href="/auth/login">
                          Zaloguj się
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                    <p className="mt-6 text-sm opacity-75">
                      Bez zobowiązań &bull; Elastyczne terminy &bull; Lekcje online
                    </p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-10">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-orange-500 text-primary-foreground">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-semibold">Korepetycje Matematyka</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/auth/login" className="transition-colors hover:text-foreground">Zaloguj się</Link>
              <Link href="#jak-to-dziala" className="transition-colors hover:text-foreground">Jak to działa</Link>
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

/* ========================= Sub-components ========================= */

function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="glass-card group rounded-2xl p-5 text-center transition-all hover:shadow-lg hover:shadow-primary/5">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
        {icon}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
  iconBg,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
}) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${gradient} p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5`}>
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} transition-transform group-hover:scale-110`}
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
  color,
}: {
  number: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="group text-center">
      <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-2xl font-bold text-white shadow-lg transition-transform group-hover:scale-110`}>
        {number}
      </div>
      <h3 className="mb-2 text-lg font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function ExamCard({
  title,
  emoji,
  items,
  highlight = false,
}: {
  title: string;
  emoji: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`group rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-xl ${
        highlight
          ? 'border-primary/30 bg-gradient-to-b from-primary/5 via-orange-50/50 to-transparent ring-1 ring-primary/20 shadow-lg shadow-primary/10'
          : 'bg-card hover:shadow-primary/5'
      }`}
    >
      <div className="mb-3 text-3xl">{emoji}</div>
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      {highlight && (
        <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
          Najpopularniejszy
        </span>
      )}
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

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex gap-4 rounded-2xl border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
        {icon}
      </div>
      <div>
        <h3 className="mb-1.5 font-semibold">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
