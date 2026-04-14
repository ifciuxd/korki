export const dynamic = 'force-dynamic';

import {
  LayoutDashboard,
  Users,
  UserCog,
  Clock,
  Calendar,
  BookOpen,
  ClipboardList,
  MessageCircle,
  Wallet,
} from 'lucide-react';
import { requireRole } from '@/lib/auth/session';
import { AppShell } from '@/components/shared/app-shell';
import type { NavItem } from '@/components/shared/sidebar-nav';

const adminNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Uczniowie', href: '/admin/students', icon: Users },
  { title: 'Rodzice', href: '/admin/parents', icon: UserCog },
  { title: 'Dostępność', href: '/admin/availability', icon: Clock },
  { title: 'Kalendarz', href: '/admin/calendar', icon: Calendar },
  { title: 'Materiały', href: '/admin/materials', icon: BookOpen },
  { title: 'Zadania', href: '/admin/tasks', icon: ClipboardList },
  { title: 'Q&A', href: '/admin/qa', icon: MessageCircle },
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
