import { BOOTSTRAP_PROTOCOL } from '@astilba/env/browser';
import type { NextApiRequest, NextApiResponse } from 'next';
import { projection } from '../../../.astilba/env/browser/browser.deployment';
import { check } from '../../../.astilba/env/browserDeployment.server';
import { deploymentSource } from '../../env-source';

export const config = { runtime: 'nodejs' };

export default function handler(
  _request: NextApiRequest,
  response: NextApiResponse
): void {
  const result = check(deploymentSource());
  response.setHeader('Cache-Control', 'private, no-store');

  if (!result.ok) {
    console.error(
      'Astilba Env bootstrap validation failed.',
      result.diagnostics
    );
    response.status(500).json({ ok: false });
    return;
  }

  response.status(200).json({
    audience: { origin: result.value.applicationOrigin },
    consumer: projection.consumer,
    contract: projection.contract,
    lifecycle: projection.lifecycle,
    projection: projection.digest,
    protocol: BOOTSTRAP_PROTOCOL,
    values: result.value
  });
}
