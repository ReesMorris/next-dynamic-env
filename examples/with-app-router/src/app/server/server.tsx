import 'server-only';

import { load } from '../../../.astilba/env/serverDeployment.server';
import {
  databaseUrlSchema,
  deploymentSource,
  parseConfiguration
} from '../../env-source';

export const Server = async () => {
  const configuration = await load(deploymentSource(), {
    databaseUrl: databaseUrlSchema
  });
  const customConfiguration = parseConfiguration(configuration.configText);

  return (
    <div className='container'>
      <span className='client-indicator server'>Server Component</span>

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
        <span className='client-indicator server small'>
          Server Configuration
        </span>
        <strong>DATABASE_URL:</strong> validated
      </div>

      <div className='env-var'>
        <span className='client-indicator server small'>
          Server Configuration
        </span>
        <strong>SECRET_KEY:</strong>{' '}
        {configuration.secretKey === undefined ? 'not set' : 'configured'}
      </div>

      <div className='env-var'>
        <span className='client-indicator server small'>
          Server Configuration
        </span>
        <strong>MAX_CONNECTIONS:</strong> {configuration.maxConnections}
      </div>

      <div className='env-var'>
        <span className='client-indicator server small'>
          Server Configuration
        </span>
        <strong>CONFIG:</strong> {Object.keys(customConfiguration).length}{' '}
        configured key(s)
      </div>
    </div>
  );
};
