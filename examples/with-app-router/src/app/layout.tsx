import { dynamicEnv } from '@/dynamic-env';
import { DynamicEnvScript } from 'next-dynamic-env';
import './globals.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang='en'>
      <head>
        <DynamicEnvScript env={dynamicEnv} />
      </head>
      <body>{children}</body>
    </html>
  );
}
