import type { AppProps } from 'next/app';
import { DynamicEnvScript } from 'next-dynamic-env';
import { clientEnv } from '../../dynamic-env';
import '@/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <DynamicEnvScript clientEnv={clientEnv} />
      <Component {...pageProps} />
    </>
  );
}
