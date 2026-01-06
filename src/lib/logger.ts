/**
 * Production-safe logger utility
 * Only logs in development mode to prevent performance issues and info leaks
 */

const isDev = import.meta.env.DEV;

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

interface Logger {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

const createLogger = (): Logger => {
  const createLogFn = (level: LogLevel) => (...args: unknown[]) => {
    // Always log errors, even in production
    if (level === 'error') {
      console[level](...args);
      return;
    }
    
    // Only log other levels in development
    if (isDev) {
      console[level](...args);
    }
  };

  return {
    log: createLogFn('log'),
    warn: createLogFn('warn'),
    error: createLogFn('error'),
    info: createLogFn('info'),
    debug: createLogFn('debug'),
  };
};

export const logger = createLogger();

// Named exports for convenient usage
export const { log, warn, error, info, debug } = logger;
