const handler: ProxyHandler<Record<string, unknown>> = {
  get: (_t, prop) => {
    if (prop === "__esModule") return true;
    if (prop === "default") return emptyProxy;
    if (typeof prop === "string" && ["from", "alloc", "isBuffer", "concat", "byteLength", "compare"].includes(prop)) {
      return (...args: unknown[]) => {
        if (prop === "from" && args[0] instanceof ArrayBuffer) return new Uint8Array(args[0]);
        if (prop === "alloc") return new Uint8Array((args[0] as number) || 0);
        if (prop === "concat") {
          const arrays = args[0] as Uint8Array[];
          const total = arrays.reduce((s, a) => s + a.length, 0);
          const out = new Uint8Array(total);
          let offset = 0;
          for (const a of arrays) { out.set(a, offset); offset += a.length; }
          return out;
        }
        return new Uint8Array(0);
      };
    }
    return () => undefined;
  },
  apply: () => undefined,
};

const emptyProxy: Record<string, unknown> = new Proxy(function () {} as unknown as Record<string, unknown>, handler);

// Minimal Buffer stand-in for browser builds
// @ts-expect-error — Uint8Array.from overloads are stricter; we match runtime usage.
export class Buffer extends Uint8Array {
  static from(value: ArrayBuffer | string, encoding?: string): Buffer {
    if (typeof value === "string") {
      const encoder = new TextEncoder();
      const buf = encoder.encode(value);
      return new Buffer(buf.buffer, buf.byteOffset, buf.byteLength);
    }
    return new Buffer(value);
  }

  toString(encoding?: string): string {
    if (encoding === "hex") {
      return Array.from(this).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    return new TextDecoder().decode(this);
  }

  static isBuffer(obj: unknown): boolean {
    return obj instanceof Uint8Array;
  }

  static alloc(size: number): Buffer {
    return new Buffer(size);
  }

  static concat(list: Uint8Array[], totalLength?: number): Buffer {
    const total = totalLength ?? list.reduce((s, a) => s + a.length, 0);
    const out = new Buffer(total);
    let offset = 0;
    for (const a of list) {
      const len = Math.min(a.length, total - offset);
      out.set(a.subarray(0, len), offset);
      offset += len;
    }
    return out;
  }
}

export default emptyProxy;
