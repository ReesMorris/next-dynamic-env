import { RUNTIME_ENV } from '@/env.runtime';
import { PublicEnvScript } from 'next-public-env';
import './globals.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang='en'>
      <head>
        <PublicEnvScript env={RUNTIME_ENV} />
      </head>
      <body>{children}</body>
    </html>
  );
}
