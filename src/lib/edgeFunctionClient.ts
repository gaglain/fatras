/**
 * Centralized Edge Function client with consistent error handling,
 * retries, and logging.
 */
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface EdgeFunctionOptions {
  /** Function name (e.g. 'send-email') */
  functionName: string;
  /** Request body */
  body?: Record<string, unknown>;
  /** If true, errors are logged but not thrown (fire-and-forget) */
  nonBlocking?: boolean;
  /** Number of retry attempts on failure (default 0) */
  retries?: number;
  /** Custom headers */
  headers?: Record<string, string>;
}

interface EdgeFunctionResult<T = unknown> {
  data: T | null;
  error: string | null;
  success: boolean;
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Invoke a Supabase Edge Function with centralized error handling.
 */
export async function invokeEdgeFunction<T = unknown>(
  options: EdgeFunctionOptions
): Promise<EdgeFunctionResult<T>> {
  const { functionName, body, nonBlocking = false, retries = 0, headers } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
        headers,
      });

      if (error) {
        const errorMsg = typeof error === 'object' && 'message' in error
          ? (error as { message: string }).message
          : String(error);

        // Retry on server errors
        if (attempt < retries) {
          logger.warn(`Edge function "${functionName}" attempt ${attempt + 1} failed:`, errorMsg);
          await sleep(1000 * (attempt + 1)); // exponential-ish backoff
          continue;
        }

        if (nonBlocking) {
          logger.warn(`Edge function "${functionName}" failed (non-blocking):`, errorMsg);
          return { data: null, error: errorMsg, success: false };
        }

        throw new Error(`Edge function "${functionName}" failed: ${errorMsg}`);
      }

      return { data: data as T, error: null, success: true };
    } catch (err) {
      if (attempt < retries) {
        logger.warn(`Edge function "${functionName}" attempt ${attempt + 1} threw:`, err);
        await sleep(1000 * (attempt + 1));
        continue;
      }

      const errorMsg = err instanceof Error ? err.message : String(err);

      if (nonBlocking) {
        logger.warn(`Edge function "${functionName}" error (non-blocking):`, errorMsg);
        return { data: null, error: errorMsg, success: false };
      }

      logger.error(`Edge function "${functionName}" error:`, errorMsg);
      return { data: null, error: errorMsg, success: false };
    }
  }

  // Should never reach here, but TypeScript needs it
  return { data: null, error: 'Unexpected error', success: false };
}
