import { BOOTSTRAP_PROTOCOL } from '@astilba/env/browser';
import { NextResponse } from 'next/server';
import { projection } from '../../../../.astilba/env/browser/browser.deployment';
import { check } from '../../../../.astilba/env/browserDeployment.server';
import { deploymentSource } from '../../../env-source';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = (): NextResponse => {
  const result = check(deploymentSource());
  const headers = { 'Cache-Control': 'private, no-store' };

  if (!result.ok) {
    return NextResponse.json(
      { diagnostics: result.diagnostics, ok: false },
      { headers, status: 500 }
    );
  }

  return NextResponse.json(
    {
      audience: { origin: result.value.applicationOrigin },
      consumer: projection.consumer,
      contract: projection.contract,
      lifecycle: projection.lifecycle,
      projection: projection.digest,
      protocol: BOOTSTRAP_PROTOCOL,
      values: result.value
    },
    { headers }
  );
};
