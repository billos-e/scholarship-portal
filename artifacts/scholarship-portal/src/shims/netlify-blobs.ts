export function getStore(..._args: unknown[]) {
  return {
    get: async (..._a: unknown[]) => null,
    getWithMetadata: async (..._a: unknown[]) => null,
    getMetadata: async (..._a: unknown[]) => null,
    set: async (..._a: unknown[]) => {},
    setJSON: async (..._a: unknown[]) => {},
    delete: async (..._a: unknown[]) => {},
    list: async (..._a: unknown[]) => ({ blobs: [] as unknown[], directories: [] as string[] }),
  };
}

export function getDeployStore(..._args: unknown[]) {
  return getStore();
}

export default { getStore, getDeployStore };
