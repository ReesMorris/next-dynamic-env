'use client';

import { env } from '@/env.runtime';

export const Client = () => {
  return (
    <div className='container'>
      <span className='client-indicator client'>Client Component</span>

      <div className='env-var'>
        <strong>API_URL:</strong> {env('API_URL')}
      </div>

      <div className='env-var'>
        <strong>APP_NAME:</strong> {env('APP_NAME')}
      </div>

      <div className='env-var'>
        <strong>NOT_EXPOSED:</strong> {env('NOT_EXPOSED' as never)}
      </div>
    </div>
  );
};
