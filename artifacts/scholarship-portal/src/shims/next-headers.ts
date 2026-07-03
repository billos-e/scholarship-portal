export function cookies() {
  return {
    get: (_name: string) => undefined,
    getAll: () => [],
    set: (..._args: unknown[]) => {},
    delete: (..._args: unknown[]) => {},
    has: (_name: string) => false,
  };
}

export function headers() {
  return new Map<string, string>();
}
