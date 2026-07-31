import type { AppProps } from 'next/app';
import '@/globals.css';
import { EnvironmentProvider } from '../environment-provider';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <EnvironmentProvider>
      <Component {...pageProps} />
    </EnvironmentProvider>
  );
}
