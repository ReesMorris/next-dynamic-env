'use client';

import { createContext, useEffect, useState } from 'react';
import type { Configuration } from '../.astilba/env/browser/browser.deployment';
import { loadDeploymentEnvironment } from './environment-bootstrap';

export const EnvironmentContext = createContext<
  Readonly<Configuration> | undefined
>(undefined);

type EnvironmentState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly values: Readonly<Configuration> }
  | { readonly status: 'error' };

export const EnvironmentProvider = ({
  children
}: Readonly<{ children: React.ReactNode }>) => {
  const [state, setState] = useState<EnvironmentState>({ status: 'loading' });

  useEffect(() => {
    if (state.status !== 'loading') {
      return;
    }

    let active = true;

    loadDeploymentEnvironment().then(
      ({ values }) => {
        if (active) {
          setState({ status: 'ready', values });
        }
      },
      () => {
        if (active) {
          setState({ status: 'error' });
        }
      }
    );

    return () => {
      active = false;
    };
  }, [state.status]);

  if (state.status === 'loading') {
    return (
      <output aria-live='polite'>Loading deployment configuration.</output>
    );
  }

  if (state.status === 'error') {
    return (
      <div>
        <p role='alert'>Deployment configuration is unavailable.</p>
        <button
          onClick={() => {
            setState({ status: 'loading' });
          }}
          type='button'
        >
          Retry deployment configuration
        </button>
      </div>
    );
  }

  return (
    <EnvironmentContext.Provider value={state.values}>
      {children}
    </EnvironmentContext.Provider>
  );
};
