import api from './client';
import {
  OWNER_BRANCHES,
  OWNER_BRANCH_STATUS,
  OWNER_HELPERS,
  OWNER_ORDER,
  OWNER_ORDERS,
  OWNER_PROFILE,
  OWNER_SERVICES,
  OWNER_STATS,
  OWNER_CUSTOMERS,
} from './endpoints';

// ── Branches ─────────────────────────────────────────────────────────

export const getBranches = async (): Promise<any> => {
  try {
    const response = await api.get(OWNER_BRANCHES);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createBranch = async (data: any): Promise<any> => {
  try {
    const response = await api.post(OWNER_BRANCHES, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateBranch = async (id: string, data: any): Promise<any> => {
  try {
    const response = await api.patch(`${OWNER_BRANCHES}/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleBranchStatus = async (id: string, isLive: boolean): Promise<any> => {
  try {
    const response = await api.patch(OWNER_BRANCH_STATUS(id), { isLive });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ── Helpers ──────────────────────────────────────────────────────────

export const getHelpers = async (): Promise<any> => {
  try {
    const response = await api.get(OWNER_HELPERS);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createHelper = async (data: any): Promise<any> => {
  try {
    const response = await api.post(OWNER_HELPERS, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const toggleHelper = async (helperId: string, isActive: boolean): Promise<any> => {
  try {
    const response = await api.patch(`${OWNER_HELPERS}/${helperId}`, {
      isActive,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ── Orders ───────────────────────────────────────────────────────────

export const respondToOrder = async (id: string, action: string, note?: string): Promise<any> => {
  try {
    const body: { action: string; note?: string } = { action };
    if (note) {
      body.note = note;
    }
    const response = await api.patch(OWNER_ORDER(id), body);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ── Services ─────────────────────────────────────────────────────────

export const getServices = async (): Promise<any> => {
  try {
    const response = await api.get(OWNER_SERVICES);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createServiceElement = async (type: string, data: any): Promise<any> => {
  try {
    const response = await api.post(OWNER_SERVICES, { type, data });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateServiceElement = async (id: string, type: string, data: any): Promise<any> => {
  try {
    const response = await api.patch(OWNER_SERVICES, { id, type, data });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteServiceElement = async (id: string, type: string): Promise<any> => {
  try {
    const response = await api.delete(OWNER_SERVICES, {
      params: { id, type }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ── Stats ────────────────────────────────────────────────────────────

export const getStats = async (branchId?: string, config?: any): Promise<any> => {
  try {
    const params: { branchId?: string } = {};
    if (branchId) {
      params.branchId = branchId;
    }
    const response = await api.get(OWNER_STATS, { params, ...config });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ── Owner Profile (Laundry Info + UPI ID) ────────────────────────────

export const getOwnerProfile = async (): Promise<any> => {
  try {
    const response = await api.get(OWNER_PROFILE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOwnerProfile = async (data: { laundryName?: string; upiId?: string; city?: string; state?: string }): Promise<any> => {
  try {
    const response = await api.patch(OWNER_PROFILE, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOwnerCustomers = async (params?: any): Promise<any> => {
  const response = await api.get(OWNER_CUSTOMERS, { params });
  return response.data;
};

export const getOwnerOrders = async (params?: Record<string, any>, config?: any): Promise<any> => {
  const response = await api.get(OWNER_ORDERS, { params, ...config });
  return response.data;
};

export const getOwnerReviews = async (params?: { branchId?: string; page?: number; limit?: number }): Promise<any> => {
  const response = await api.get('/api/owner/ratings', { params });
  return response.data;
};
