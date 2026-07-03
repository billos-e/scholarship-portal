const handler: ProxyHandler<Record<string, unknown>> = {
  get: (_t, prop) => {
    if (prop === "__esModule") return true;
    if (prop === "default") return emptyProxy;
    return () => undefined;
  },
  apply: () => undefined,
};

const emptyProxy: Record<string, unknown> = new Proxy(function () {} as unknown as Record<string, unknown>, handler);

export default emptyProxy;
