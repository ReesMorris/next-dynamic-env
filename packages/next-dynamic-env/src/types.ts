export type EnvVars = Record<string, string | undefined>;

/**
 * Dynamic environment variable object with raw values
 */
export type DynamicEnv<T> = Readonly<T> & { readonly __raw: T };
