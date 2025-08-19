export type EnvVars = Record<string, string | undefined>;

/**
 * Dynamic environment variable object with raw values
 */
export type DynamicEnv<T extends EnvVars> = Readonly<T> & { readonly __raw: T };
