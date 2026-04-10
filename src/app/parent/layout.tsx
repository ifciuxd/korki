import {
  LayoutDashboard,
  CalendarPlus,
  Package,
  CreditCard,
} from 'lucide-react';
import { requireRole } from '@/lib/auth/session';
import { AppShell } from '@/components/shared/app-shell';
import type { NavItem } from '@/components/shared/sidebar-nav';

const parentNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/parent/dashboard', icon: LayoutDashboard },
  { title: 'Zarezerwuj lekcję', href: '/parent/book-lesson', icon: CalendarPlus },
  { title: 'Kup pakiet', href: '/parent/buy-package', icon: Package },
  { title: 'Płatności', href: '/parent/payments', icon: CreditCard },
];

export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole('parent');

  return (
    <AppShell
      navItems={parentNavItems}
      userName={`${session.firstName} ${session.lastName}`}
      userRole={session.role}
    >
      {children}
    </AppShell>
  );
}
