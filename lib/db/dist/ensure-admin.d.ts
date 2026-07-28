/**
 * Guarantees at least one ADMIN account exists — both as a Clerk user (used
 * for the real admin login flow) and as a local `users` row (role=ADMIN) —
 * so a freshly provisioned (empty) database/deployment is always usable.
 *
 * Safe to run on every server boot, in every environment (dev + production):
 * - If the local DB row already exists, its password is left untouched.
 * - If a Clerk account with this email already exists, it is reused as-is.
 * - Otherwise both are created so the account works end-to-end.
 */
export declare function ensureDefaultAdmin(): Promise<void>;
//# sourceMappingURL=ensure-admin.d.ts.map