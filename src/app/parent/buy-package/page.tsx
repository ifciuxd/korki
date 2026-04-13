import { requireRole } from '@/lib/auth/session';
import { listActivePackages } from '@/db/queries/packages';
import { getChildrenWithHoursForParent } from '@/db/queries/purchases';
import { BuyPackageFlow } from '@/components/parent/buy-package-flow';

export default async function BuyPackagePage() {
  const session = await requireRole('parent');

  const [pkgs, children] = await Promise.all([
    listActivePackages(),
    getChildrenWithHoursForParent(session.userId),
  ]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Kup pakiet</h1>
        <p className="text-sm text-muted-foreground">
          Wybierz pakiet godzin i przypisz go do dziecka
        </p>
      </div>
      <BuyPackageFlow
        packages={pkgs.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          hoursIncluded: p.hoursIncluded,
          priceCents: p.priceCents,
          validityDays: p.validityDays,
        }))}
        studentList={children}
      />
    </div>
  );
}
