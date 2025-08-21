'use client';

import { clientEnv } from '@/env';

export const Client = () => {
  return (
    <div className='container'>
      <span className='client-indicator client'>Client Component</span>

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
        <span className='client-indicator client small'>Client Variable</span>
        <strong>FEATURES:</strong> {clientEnv.FEATURES.join(', ')}
      </div>
    </div>
  );
};
