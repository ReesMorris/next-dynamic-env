import 'server-only';

import { clientEnv, serverEnv } from '@/env';

export const Server = () => {
  return (
    <div className='container'>
      <span className='client-indicator server'>Server Component</span>

      <div className='env-var'>
        <span className='client-indicator client small'>Client Variable</span>
        <strong>API_URL:</strong> {clientEnv.API_URL}
      </div>

      <div className='env-var'>
        <span className='client-indicator client small'>Client Variable</span>
        <strong>PORT:</strong> {clientEnv.PORT}
      </div>

      <div className='env-var'>
        <span className='client-indicator client small'>Client Variable</span>
        <strong>DEBUG:</strong> {clientEnv.DEBUG ? 'true' : 'false'}
      </div>

      <div className='env-var'>
        <span className='client-indicator server small'>Server Variable</span>
        <strong>DATABASE_URL:</strong> {serverEnv.DATABASE_URL}
      </div>

      <div className='env-var'>
        <span className='client-indicator server small'>Server Variable</span>
        <strong>SECRET_KEY:</strong> {serverEnv.SECRET_KEY}
      </div>
    </div>
  );
};
