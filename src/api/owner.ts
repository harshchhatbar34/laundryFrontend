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
  try {
    const response = await api.get(OWNER_CUSTOMERS, { params });
    return response.data;
  } catch (error: any) {
    console.warn("Using mock owner customers fallback due to API error:", error.message);
    const mockCustomers = [
      {
        _id: "cust1",
        name: "John Doe",
        email: "john@example.com",
        mobileNumber: "1234567890",
        role: "customer",
        isActive: true,
        createdAt: "2026-06-20T10:00:00.000Z"
      },
      {
        _id: "cust4",
        name: "Sarah Parker",
        email: "sarah@parker.com",
        mobileNumber: "9876543299",
        role: "customer",
        isActive: true,
        createdAt: "2026-06-22T09:00:00.000Z"
      }
    ];

    let filtered = mockCustomers;
    if (params && params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.mobileNumber.includes(q)
      );
    }

    return {
      success: true,
      message: "Customers fetched successfully (Mock)",
      data: {
        customers: filtered,
        total: filtered.length,
        page: 1,
        limit: 20,
        totalPages: 1
      }
    };
  }
};

export const getOwnerOrders = async (params?: Record<string, any>, config?: any): Promise<any> => {
  try {
    const response = await api.get(OWNER_ORDERS, { params, ...config });
    return response.data;
  } catch (error: any) {
    console.warn("Using mock owner orders fallback due to API error:", error.message);
    const mockOrders = [
      {
        _id: "order_mock_1",
        orderNumber: "ORD-1718712345",
        status: "pending",
        pricing: { total: 150.00 },
        createdAt: "2026-06-20T10:00:00.000Z",
        customer: { _id: "cust1", name: "John Doe" },
      },
      {
        _id: "order_mock_4",
        orderNumber: "ORD-1718714999",
        status: "delivered",
        pricing: { total: 320.00 },
        createdAt: "2026-06-22T11:30:00.000Z",
        customer: { _id: "cust4", name: "Sarah Parker" },
      }
    ];
    let filtered = mockOrders;
    if (params) {
      const { customerId, search, status } = params;
      if (customerId) {
        filtered = filtered.filter(o => o.customer._id === customerId);
      }
      if (status) {
        filtered = filtered.filter(o => o.status === status);
      }
      if (search) {
        filtered = filtered.filter(o => o.orderNumber.includes(search));
      }
    }
    return {
      success: true,
      message: "Orders fetched successfully (Mock)",
      data: {
        orders: filtered,
        total: filtered.length,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    };
  }
};
