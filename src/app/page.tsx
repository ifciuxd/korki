import Link from 'next/link';
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll';
import { CountUp } from '@/components/landing/count-up';
import { StickyCTA } from '@/components/landing/sticky-cta';
import {
  ArrowRight,
  Check,
  Calendar,
  BookOpen,
  ClipboardList,
  TrendingUp,
  MessageCircle,
  GraduationCap,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <>
      <StickyCTA />

      {/* NAV — minimal */}
      <nav className="fixed top-0 z-50 w-full border-b border-transparent bg-background/70 backdrop-blur-xl transition-colors">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background text-sm font-black">M</span>
            <span className="font-bold tracking-tight">matma.online</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
              Zaloguj
            </Link>
            <Link href="/auth/login" className="rounded-lg bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-all hover:opacity-90">
              Umów lekcję
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ===================== HERO ===================== */}
        <section className="relative overflow-hidden pt-14">
          {/* Grid paper bg */}
          <div className="grid-paper absolute inset-0 -z-10 opacity-40" />
          {/* Gradient blobs */}
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            <div className="absolute -left-32 top-24 h-[420px] w-[420px] rounded-full bg-orange-300/20 blur-3xl" />
            <div className="absolute -right-20 top-48 h-[350px] w-[350px] rounded-full bg-amber-200/25 blur-3xl" />
          </div>

          {/* Floating math */}
          <div className="pointer-events-none absolute inset-0 -z-5 select-none overflow-hidden" aria-hidden="true">
            <span className="absolute left-[8%] top-[22%] font-mono text-5xl font-light text-foreground/[0.04] animate-float">x²</span>
            <span className="absolute right-[12%] top-[18%] font-mono text-6xl font-light text-foreground/[0.04] animate-float-delayed">&pi;</span>
            <span className="absolute left-[70%] top-[55%] font-mono text-4xl font-light text-foreground/[0.04] animate-float-slow">&radic;</span>
            <span className="absolute left-[18%] top-[65%] font-mono text-5xl font-light text-foreground/[0.04] animate-float-delayed">&sum;</span>
            <span className="absolute left-[45%] top-[12%] font-mono text-4xl font-light text-foreground/[0.04] animate-float-slow">&int;</span>
          </div>

          <div className="mx-auto max-w-3xl px-5 pb-20 pt-20 text-center sm:pb-28 sm:pt-28">
            {/* Badge */}
            <div className="hero-enter hero-d0 mb-8 inline-flex items-center gap-2 rounded-full bg-foreground/[0.04] px-4 py-1.5 text-[13px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Zapisy otwarte — pierwsza lekcja gratis
            </div>

            {/* Heading */}
            <h1 className="hero-enter hero-d1 text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight">
              Matematyka?{' '}
              <span className="grad-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-400">
                Ogarniamy.
              </span>
            </h1>

            {/* Sub */}
            <p className="hero-enter hero-d2 mx-auto mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Korepetycje 1:1 online z matematyki. Egzamin ósmoklasisty, matura,
              studia — bez stresu, w Twoim tempie.
            </p>

            {/* CTA */}
            <div className="hero-enter hero-d3 mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/auth/login"
                className="cta-ring inline-flex h-12 items-center gap-2 rounded-xl bg-foreground px-7 text-[15px] font-semibold text-background transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Umów pierwszą lekcję
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#jak-to-dziala"
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border px-7 text-[15px] font-medium transition-all hover:border-foreground/20 hover:bg-foreground/[0.03]"
              >
                Jak to działa?
              </Link>
            </div>

            {/* Trust line */}
            <div className="hero-enter hero-d4 mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-600" /> Lekcja próbna za darmo</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-600" /> Zero zobowiązań</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-green-600" /> Online z dowolnego miejsca</span>
            </div>
          </div>
        </section>

        {/* ===================== SOCIAL PROOF MARQUEE ===================== */}
        <section className="border-y bg-foreground py-4 text-background" aria-hidden="true">
          <div className="overflow-hidden">
            <div className="marquee-track animate-marquee">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex shrink-0 items-center gap-12 px-6 text-sm font-medium tracking-wide opacity-60">
                  <span>EGZAMIN ÓSMOKLASISTY</span><span className="text-orange-400">/</span>
                  <span>MATURA PODSTAWOWA</span><span className="text-orange-400">/</span>
                  <span>MATURA ROZSZERZONA</span><span className="text-orange-400">/</span>
                  <span>STUDIA</span><span className="text-orange-400">/</span>
                  <span>KOREPETYCJE 1:1</span><span className="text-orange-400">/</span>
                  <span>ONLINE</span><span className="text-orange-400">/</span>
                  <span>ZADANIA DOMOWE</span><span className="text-orange-400">/</span>
                  <span>MATERIAŁY 24/7</span><span className="text-orange-400">/</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===================== NUMBERS ===================== */}
        <section className="py-20 sm:py-24">
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-5 sm:grid-cols-4">
            <AnimateOnScroll animation="fade-up" delay={0}>
              <NumberBlock value={<CountUp target={100} suffix="%" />} label="Online" />
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={100}>
              <NumberBlock value="1:1" label="Indywidualnie" />
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={200}>
              <NumberBlock value={<CountUp target={60} suffix="min" />} label="Lekcja" />
            </AnimateOnScroll>
            <AnimateOnScroll animation="fade-up" delay={300}>
              <NumberBlock value={<CountUp target={24} suffix="/7" />} label="Dostęp do materiałów" />
            </AnimateOnScroll>
          </div>
        </section>

        {/* ===================== BENTO FEATURES ===================== */}
        <section id="jak-to-dziala" className="border-t py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <AnimateOnScroll animation="fade-up">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Platforma</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
                Wszystko w <span className="hand-ul">jednym miejscu</span>
              </h2>
            </AnimateOnScroll>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimateOnScroll animation="fade-up" delay={0}>
                <BentoCard
                  icon={<Calendar className="h-6 w-6" />}
                  color="bg-blue-500"
                  title="Rezerwacja online"
                  desc="Wybierz termin z kalendarza, potwierdź jednym kliknięciem. Odwołanie do 24h przed."
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={80}>
                <BentoCard
                  icon={<BookOpen className="h-6 w-6" />}
                  color="bg-emerald-500"
                  title="Materiały"
                  desc="PDFy, filmy, linki — dopasowane do Twojego poziomu. Zawsze pod ręką."
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={160}>
                <BentoCard
                  icon={<ClipboardList className="h-6 w-6" />}
                  color="bg-violet-500"
                  title="Zadania domowe"
                  desc="Dostajesz zadania, przesyłasz rozwiązania, dostajesz ocenę i feedback."
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={240}>
                <BentoCard
                  icon={<TrendingUp className="h-6 w-6" />}
                  color="bg-amber-500"
                  title="Raporty po lekcji"
                  desc="Rodzic widzi co było na lekcji, jakie tematy, jaka ocena, co dalej."
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={320}>
                <BentoCard
                  icon={<MessageCircle className="h-6 w-6" />}
                  color="bg-rose-500"
                  title="Q&A"
                  desc="Utknąłeś? Pytaj między lekcjami. Odpisuję w ciągu kilku godzin."
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={400}>
                <BentoCard
                  icon={<GraduationCap className="h-6 w-6" />}
                  color="bg-foreground"
                  title="Cel: Twój egzamin"
                  desc="Plan nauki pod konkretny egzamin. Ósmoklasisty, matura P, matura R."
                />
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ===================== HOW IT WORKS ===================== */}
        <section className="border-t bg-foreground text-background py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-5">
            <AnimateOnScroll animation="fade-up">
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">Jak zacząć</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Trzy kroki</h2>
            </AnimateOnScroll>

            <div className="mt-14 space-y-12">
              <AnimateOnScroll animation="fade-up" delay={0}>
                <Step num="01" title="Napisz do mnie" desc="Umów się na darmową lekcję próbną. Sprawdzimy poziom, poznamy się, ustalimy plan." />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={120}>
                <Step num="02" title="Wybierz pakiet" desc="Kup pakiet godzin — przelew, gotówka, jak Ci wygodnie. Bez abonamentów." />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={240}>
                <Step num="03" title="Ucz się i rośnij" desc="Rezerwuj lekcje, rób zadania, śledź postępy. Materiały i pomoc non-stop." />
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ===================== EXAM LEVELS ===================== */}
        <section className="border-t py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-5">
            <AnimateOnScroll animation="fade-up">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">Poziomy</p>
              <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Na każdy egzamin</h2>
            </AnimateOnScroll>

            <div className="mt-14 grid gap-5 sm:grid-cols-3">
              <AnimateOnScroll animation="fade-up" delay={0}>
                <ExamCard
                  level="Ósmoklasisty"
                  tag="Klasa 7-8"
                  items={['Arytmetyka i algebra', 'Geometria płaska', 'Statystyka', 'Zadania z treścią']}
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={120}>
                <ExamCard
                  level="Matura P"
                  tag="Najpopularniejszy"
                  highlight
                  items={['Funkcje', 'Ciągi', 'Trygonometria', 'Stereometria']}
                />
              </AnimateOnScroll>
              <AnimateOnScroll animation="fade-up" delay={240}>
                <ExamCard
                  level="Matura R"
                  tag="Ambitni"
                  items={['Analiza', 'Liczby zespolone', 'Pochodne i całki', 'Dowody']}
                />
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ===================== FINAL CTA ===================== */}
        <section className="border-t py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <AnimateOnScroll animation="scale-in">
              <div className="relative overflow-hidden rounded-3xl bg-foreground px-8 py-16 text-center text-background sm:px-16 sm:py-20">
                {/* bg decoration */}
                <div className="pointer-events-none absolute inset-0 grid-paper opacity-[0.03]" />
                <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

                <div className="relative">
                  <h2 className="text-3xl font-bold sm:text-5xl">
                    Gotowy na lepsze oceny?
                  </h2>
                  <p className="mx-auto mt-4 max-w-md text-lg text-background/60">
                    Pierwsza lekcja za darmo. Zero ryzyka, zero zobowiązań.
                    Przekonaj się sam.
                  </p>
                  <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                    <Link
                      href="/auth/login"
                      className="cta-ring inline-flex h-13 items-center gap-2 rounded-xl bg-orange-500 px-8 text-base font-semibold text-white transition-all hover:bg-orange-400 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Umów pierwszą lekcję
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/auth/login"
                      className="inline-flex h-13 items-center gap-2 rounded-xl border border-background/20 px-8 text-base font-medium text-background/70 transition-all hover:border-background/40 hover:text-background"
                    >
                      Zaloguj się
                    </Link>
                  </div>
                  <p className="mt-6 text-sm text-background/40">
                    Online &bull; 1:1 &bull; Elastyczne terminy &bull; Bez umów
                  </p>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-[11px] font-black text-background">M</span>
            <span className="text-sm font-semibold">matma.online</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#jak-to-dziala" className="hover:text-foreground transition-colors">Jak to działa</Link>
            <Link href="/auth/login" className="hover:text-foreground transition-colors">Zaloguj</Link>
          </div>
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </>
  );
}

/* =========== COMPONENTS =========== */

function NumberBlock({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-extrabold tracking-tight sm:text-5xl">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function BentoCard({ icon, color, title, desc }: { icon: React.ReactNode; color: string; title: string; desc: string }) {
  return (
    <div className="bento group rounded-2xl border bg-card p-6">
      <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${color} text-white`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
    </div>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex gap-6">
      <span className="shrink-0 font-mono text-4xl font-black text-orange-400/40">{num}</span>
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-1 text-background/60 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ExamCard({ level, tag, items, highlight = false }: { level: string; tag: string; items: string[]; highlight?: boolean }) {
  return (
    <div className={`bento rounded-2xl border p-6 ${highlight ? 'border-primary/30 ring-2 ring-primary/10 shadow-lg' : 'bg-card'}`}>
      <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${highlight ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
        {tag}
      </span>
      <h3 className="mt-3 text-xl font-bold">{level}</h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 shrink-0 text-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
