'use client';

import { dynamicEnv } from '@/dynamic-env';

export const Client = () => {
  return (
    <div className='container'>
      <span className='client-indicator client'>Client Component</span>

      <div className='env-var'>
        <strong>API_URL:</strong> {dynamicEnv.API_URL}
      </div>

      <div className='env-var'>
        <strong>APP_NAME:</strong> {dynamicEnv.APP_NAME}
      </div>

      <div className='env-var'>
        <strong>PORT:</strong> {dynamicEnv.PORT}
      </div>

      <div className='env-var'>
        <strong>DEBUG:</strong> {dynamicEnv.DEBUG ? 'true' : 'false'}
      </div>

      <div className='env-var'>
        <strong>FEATURES:</strong> {dynamicEnv.FEATURES.join(', ')}
      </div>
    </div>
  );
};
