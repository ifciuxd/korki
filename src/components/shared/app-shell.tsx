import { GraduationCap, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SidebarNav, type NavItem } from '@/components/shared/sidebar-nav';
import { logoutAction } from '@/server/actions/auth';

interface AppShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  userName: string;
  userRole: string;
}

export function AppShell({
  children,
  navItems,
  userName,
  userRole,
}: AppShellProps) {
  const roleLabels: Record<string, string> = {
    admin: 'Korepetytor',
    parent: 'Rodzic',
    student: 'Uczeń',
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-card md:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-4">
            <GraduationCap className="h-5 w-5 text-primary" />
            <Link href="/" className="font-bold">
              Korepetycje
            </Link>
          </div>

          {/* Nav */}
          <div className="flex-1 overflow-y-auto p-4">
            <SidebarNav items={navItems} />
          </div>

          {/* User info + Logout */}
          <div className="border-t p-4">
            <div className="mb-2">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">
                {roleLabels[userRole] ?? userRole}
              </p>
            </div>
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                <LogOut className="h-4 w-4" />
                Wyloguj się
              </Button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl p-6">{children}</div>
      </main>
    </div>
  );
}
