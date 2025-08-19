export type LogLevel = 'log' | 'warn' | 'error';

export interface Logger {
  log: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string, details?: unknown) => void;
}
