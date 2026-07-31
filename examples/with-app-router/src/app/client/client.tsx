'use client';

import { useContext } from 'react';
import { EnvironmentContext } from '../environment-provider';

export const Client = () => {
  const configuration = useContext(EnvironmentContext);

  if (configuration === undefined) {
    return null;
  }

  return (
    <div className='container'>
      <span className='client-indicator client'>Client Component</span>

      <div className='env-var'>
        <span className='client-indicator client small'>Client Variable</span>
        <strong>API_URL:</strong> {configuration.apiOrigin}
      </div>

      <div className='env-var'>
        <span className='client-indicator client small'>Client Variable</span>
        <strong>PORT:</strong> {configuration.port}
      </div>

      <div className='env-var'>
        <span className='client-indicator client small'>Client Variable</span>
        <strong>DEBUG:</strong> {configuration.debug ? 'true' : 'false'}
      </div>

      <div className='env-var'>
        <span className='client-indicator client small'>Client Variable</span>
        <strong>FEATURES:</strong> {configuration.features.join(', ')}
      </div>
    </div>
  );
};
