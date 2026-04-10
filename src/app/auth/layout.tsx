import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-lg font-bold"
      >
        <GraduationCap className="h-6 w-6 text-primary" />
        Korepetycje Matematyka
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
