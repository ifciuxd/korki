import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  BookOpen,
  MessageCircle,
} from 'lucide-react';
import { requireRole } from '@/lib/auth/session';
import { AppShell } from '@/components/shared/app-shell';
import type { NavItem } from '@/components/shared/sidebar-nav';

const studentNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { title: 'Lekcje', href: '/student/lessons', icon: Calendar },
  { title: 'Zadania', href: '/student/tasks', icon: ClipboardList },
  { title: 'Materiały', href: '/student/materials', icon: BookOpen },
  { title: 'Pytania', href: '/student/qa', icon: MessageCircle },
];

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole('student');

  return (
    <AppShell
      navItems={studentNavItems}
      userName={`${session.firstName} ${session.lastName}`}
      userRole={session.role}
    >
      {children}
    </AppShell>
  );
}
