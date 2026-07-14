export const Role = { STUDENT: "STUDENT", ADMIN: "ADMIN" } as const;
export type Role = (typeof Role)[keyof typeof Role];

export const StudentStatus = {
  ACTIVE: "ACTIVE",
  GRADUATED: "GRADUATED",
  INACTIVE: "INACTIVE",
} as const;
export type StudentStatus = (typeof StudentStatus)[keyof typeof StudentStatus];

export const RequestStatus = {
  SUBMITTED: "SUBMITTED",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  PAID: "PAID",
  REJECTED: "REJECTED",
} as const;
export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export const TermCode = {
  FALL: "FALL",
  SPRING: "SPRING",
  SUMMER: "SUMMER",
  WINTER: "WINTER",
} as const;
export type TermCode = (typeof TermCode)[keyof typeof TermCode];

function deepStub(): unknown {
  const target = function () {} as unknown as Record<string, unknown>;
  return new Proxy(target, {
    get: (_t, prop) => {
      if (prop === "then") return undefined;
      if (
        typeof prop === "string" &&
        [
          "findMany",
          "findFirst",
          "findUnique",
          "findUniqueOrThrow",
          "findFirstOrThrow",
          "count",
          "aggregate",
          "groupBy",
        ].includes(prop)
      ) {
        return async (..._args: unknown[]) => (prop === "findMany" || prop === "groupBy" ? [] : prop === "count" ? 0 : null);
      }
      if (typeof prop === "string" && ["create", "update", "upsert", "delete", "createMany", "updateMany", "deleteMany"].includes(prop)) {
        return async (..._args: unknown[]) => ({});
      }
      if (prop === "$transaction") return async (arg: unknown) => (Array.isArray(arg) ? [] : typeof arg === "function" ? (arg as (t: unknown) => unknown)(deepStub()) : undefined);
      if (["$connect", "$disconnect", "$executeRaw", "$queryRaw", "$executeRawUnsafe", "$queryRawUnsafe"].includes(String(prop))) {
        return async () => undefined;
      }
      return deepStub();
    },
    apply: () => deepStub(),
  });
}

export class PrismaClient {
  constructor(..._args: unknown[]) {
    return deepStub() as PrismaClient;
  }
}

export const Prisma = {
  PrismaClientKnownRequestError: class extends Error {},
  PrismaClientUnknownRequestError: class extends Error {},
  PrismaClientValidationError: class extends Error {},
  Decimal: class {
    value: string;
    constructor(v: unknown) {
      this.value = String(v);
    }
    toString() {
      return this.value;
    }
    toNumber() {
      return Number(this.value);
    }
  },
};

// Type-only namespace merge — provides loose structural types for the
// handful of Prisma-generated filter/where-input types still referenced by
// (mostly dead/legacy) code paths ported from the original Next.js app.
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Prisma {
  export type TuitionPaymentRequestWhereInput = Record<string, unknown>;
  export type StudentWhereInput = Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BankInformation = Record<string, any> | null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Student = Record<string, any>;
