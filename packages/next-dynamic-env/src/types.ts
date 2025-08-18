export type EnvVars = Record<string, string | undefined>;

declare global {
  interface Window {
    __NEXT_DYNAMIC_ENV__?: EnvVars;
  }
}
