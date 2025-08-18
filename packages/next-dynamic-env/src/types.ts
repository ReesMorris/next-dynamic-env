export type EnvVars = Record<string, string | undefined>;

declare global {
  interface Window {
    __ENV__?: EnvVars;
  }
}
