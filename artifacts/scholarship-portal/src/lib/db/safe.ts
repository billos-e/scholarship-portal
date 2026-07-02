import { isDatabaseUnavailable } from "@/lib/db/errors";

export type SafeDbResult<T> =
  | { data: T; error?: undefined }
  | { data?: undefined; error: "unavailable" };

/** Runs a DB call and maps connectivity failures to a soft error instead of throwing. */
export async function safeDb<T>(fn: () => Promise<T>): Promise<SafeDbResult<T>> {
  try {
    return { data: await fn() };
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return { error: "unavailable" };
    }
    throw error;
  }
}
