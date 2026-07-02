const UNAVAILABLE_CODES = new Set([
  "P1001", // Can't reach database server
  "P1002", // Database server timed out
  "P1008", // Operations timed out
  "P1017", // Server closed the connection
  "P2024", // Timed out fetching connection from pool
]);

export class DatabaseUnavailableError extends Error {
  constructor(message = "Database is temporarily unavailable.") {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

/** Works on server and in client error boundaries (no Prisma import). */
export function isDatabaseUnavailable(error: unknown): boolean {
  if (error instanceof DatabaseUnavailableError) return true;

  if (typeof error === "object" && error !== null) {
    const record = error as { code?: string; name?: string };
    if (record.code && UNAVAILABLE_CODES.has(record.code)) {
      return true;
    }
    if (record.name === "PrismaClientInitializationError") {
      return true;
    }
  }

  if (error instanceof Error) {
    return /P1001|P1002|P1008|P1017|P2024|Can't reach database server|connection.*(refused|timeout|closed)/i.test(
      error.message,
    );
  }

  return false;
}
