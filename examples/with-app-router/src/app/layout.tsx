import { DynamicEnvScript } from 'next-dynamic-env';
import { clientEnv } from '../../env';
import './globals.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang='en'>
      <body>
        {children}
        <DynamicEnvScript clientEnv={clientEnv} />
      </body>
    </html>
  );
}
