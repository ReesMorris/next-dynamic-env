'use client';

import { dynamicEnv } from '@/dynamic-env';

export const Client = () => {
  return (
    <div className='container'>
      <span className='client-indicator client'>Client Component</span>

      <div className='env-var'>
        <span className='client-indicator client small'>Client Variable</span>
        <strong>API_URL:</strong> {dynamicEnv.API_URL}
      </div>

      <div className='env-var'>
        <span className='client-indicator client small'>Client Variable</span>
        <strong>PORT:</strong> {dynamicEnv.PORT}
      </div>

      <div className='env-var'>
        <span className='client-indicator client small'>Client Variable</span>
        <strong>DEBUG:</strong> {dynamicEnv.DEBUG ? 'true' : 'false'}
      </div>

      <div className='env-var'>
        <span className='client-indicator client small'>Client Variable</span>
        <strong>FEATURES:</strong> {dynamicEnv.FEATURES.join(', ')}
      </div>

      <div className='env-var'>
        <span className='client-indicator server small'>Server Variable</span>
        <strong>DATABASE_URL:</strong> {dynamicEnv.DATABASE_URL}
      </div>

      <div className='env-var'>
        <span className='client-indicator server small'>Server Variable</span>
        <strong>SECRET_KEY:</strong> {dynamicEnv.SECRET_KEY}
      </div>
    </div>
  );
};
