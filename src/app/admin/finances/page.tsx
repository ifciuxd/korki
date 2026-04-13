import { PackageManager } from '@/components/admin/package-manager';
import { listPackages } from '@/db/queries/packages';

export default async function FinancesPage() {
  const allPackages = await listPackages();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Finanse</h1>
        <p className="text-sm text-muted-foreground">
          Zarządzaj pakietami godzin i śledź przychody.
        </p>
      </div>
      <PackageManager packages={allPackages} />
    </div>
  );
}
