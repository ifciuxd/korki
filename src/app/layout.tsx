import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Korepetycje Matematyka',
  description:
    'Platforma do zarządzania korepetycjami z matematyki — lekcje, materiały, postępy.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
