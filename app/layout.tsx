import Providers from '@/components/Providers';
import './globals.css';

export const metadata = {
  title: 'ADHD Coach',
  description: 'Manage your tasks with ADHD-friendly classifications',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}