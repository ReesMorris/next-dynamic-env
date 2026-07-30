import { loadDeploymentEnvironment } from './app/environment-bootstrap';

loadDeploymentEnvironment()
  .then(({ values }) => {
    // Only Env-dependent instrumentation waits for this validated bootstrap.
    console.log('Environment is ready for instrumentation:', values.apiOrigin);
  })
  .catch(() => {
    console.error(
      'Astilba Env bootstrap failed; environment-dependent instrumentation was not started.'
    );
  });
