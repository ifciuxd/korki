import { AvailabilityManager } from '@/components/admin/availability-manager';
import { listAvailabilitySlots } from '@/db/queries/availability';

export default async function AvailabilityPage() {
  const slots = await listAvailabilitySlots();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dostępność</h1>
        <p className="text-sm text-muted-foreground">
          Skonfiguruj cykliczne okna w których przyjmujesz uczniów. Te sloty
          będą widoczne dla rodziców przy rezerwacji lekcji.
        </p>
      </div>
      <AvailabilityManager slots={slots} />
    </div>
  );
}
