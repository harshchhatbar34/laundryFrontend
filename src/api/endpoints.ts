// ── Auth ─────────────────────────────────────────────────────────────
export const AUTH_LOGIN = '/api/auth/login';
export const AUTH_REGISTER = '/api/auth/register';

// ── Branches ─────────────────────────────────────────────────────────
export const BRANCHES_NEAREST = '/api/branches/nearest';

// ── Masters & Services ───────────────────────────────────────────────
export const MASTERS = '/api/masters';
export const SERVICES = '/api/services';

// ── Customer Orders ──────────────────────────────────────────────────
export const ORDERS = '/api/orders';
export const ORDER_DETAIL = (id: string) => `/api/orders/${id}`;
export const ORDER_RESCHEDULE = (id: string) => `/api/orders/${id}/reschedule`;

// ── Helper ───────────────────────────────────────────────────────────
export const HELPER_ORDERS = '/api/helper/orders';
export const HELPER_ORDER_DETAIL = (id: string) => `/api/helper/orders/${id}`;
export const HELPER_BILL = (id: string) => `/api/helper/bill/${id}`;

// ── Owner — Branches ────────────────────────────────────────────────
export const OWNER_BRANCHES = '/api/owner/branches';
export const OWNER_BRANCH_STATUS = (id: string) => `/api/owner/branches/${id}/status`;

// ── Owner — Helpers ──────────────────────────────────────────────────
export const OWNER_HELPERS = '/api/owner/helpers';

// ── Owner — Orders ───────────────────────────────────────────────────
export const OWNER_ORDERS = '/api/owner/orders';
export const OWNER_ORDER = (id: string) => `/api/owner/orders/${id}`;

// ── Owner — Services ────────────────────────────────────────────────
export const OWNER_SERVICES = '/api/owner/services';

// ── Owner — Stats ────────────────────────────────────────────────────
export const OWNER_STATS = '/api/owner/stats';

// ── Owner — Profile (Laundry Info + UPI ID) ──────────────────────────
export const OWNER_PROFILE = '/api/owner/profile';

// ── Super-admin — Owners ─────────────────────────────────────────────
export const ADMIN_OWNERS = '/api/superadmin/owners';

// ── Super-admin — Tenants ────────────────────────────────────────────
export const ADMIN_TENANTS = '/api/superadmin/tenants';

// ── Super-admin — Coupons ────────────────────────────────────────────
export const ADMIN_COUPONS = '/api/superadmin/coupons';

// ── Super-admin — Stats ──────────────────────────────────────────────
export const ADMIN_STATS = '/api/superadmin/stats';

// ── Super-admin — Orders ─────────────────────────────────────────────
export const ADMIN_ORDERS = '/api/superadmin/orders';
export const ADMIN_ORDER_DETAIL = (id: string) => `/api/superadmin/orders/${id}`;

// ── Ratings ──────────────────────────────────────────────────────────
export const RATINGS = '/api/ratings';

// ── Notifications ────────────────────────────────────────────────────
export const NOTIFICATIONS = '/api/notifications';

// ── User ─────────────────────────────────────────────────────────────
export const USER_PROFILE = '/api/users/profile';
export const USER_ADDRESSES = '/api/users/addresses';
export const USER_ADDRESS = (id: string) => `/api/users/addresses/${id}`;

// ── Customer Lists ───────────────────────────────────────────────────
export const OWNER_CUSTOMERS = '/api/owner/customers';
export const ADMIN_CUSTOMERS = '/api/superadmin/customers';
export const ADMIN_CUSTOMER_DETAIL = (id: string) => `/api/superadmin/customers/${id}`;

