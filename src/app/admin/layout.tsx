import {
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  Wallet,
} from 'lucide-react';
import { requireRole } from '@/lib/auth/session';
import { AppShell } from '@/components/shared/app-shell';
import type { NavItem } from '@/components/shared/sidebar-nav';

const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Uczniowie', href: '/admin/students', icon: Users },
  { title: 'Kalendarz', href: '/admin/calendar', icon: Calendar },
  { title: 'Materiały', href: '/admin/materials', icon: BookOpen },
  { title: 'Finanse', href: '/admin/finances', icon: Wallet },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole('admin');

  return (
    <AppShell
      navItems={adminNavItems}
      userName={`${session.firstName} ${session.lastName}`}
      userRole={session.role}
    >
      {children}
    </AppShell>
  );
}
