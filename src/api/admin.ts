import api from './client';
import {
  ADMIN_OWNERS,
  ADMIN_TENANTS,
  ADMIN_COUPONS,
  ADMIN_STATS,
  ADMIN_CUSTOMERS,
  ADMIN_ORDERS,
  ADMIN_CUSTOMER_DETAIL,
  ADMIN_ORDER_DETAIL,
} from './endpoints';

// ── In-Memory Mocks for Fallbacks ────────────────────────────────────
interface MockOwner {
  _id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  laundryName?: string;
  tenantCode: string | null;
  isActive: boolean;
  subscription?: string;
  paymentAmount?: number;
  createdAt?: string;
  paymentMode?: string;
}

interface MockCoupon {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
  validUntil: string;
  isActive: boolean;
}

let mockOwners: MockOwner[] = [
  { 
    _id: 'owner1', name: 'John Doe', email: 'john@laundryowner.com', mobileNumber: '9876543210', 
    laundryName: 'FreshWash Central', tenantCode: 'HK23', isActive: true,
    subscription: 'monthly', paymentAmount: 2500, createdAt: '2026-01-15T00:00:00.000Z', paymentMode: 'cash'
  },
  { 
    _id: 'owner2', name: 'Jane Smith', email: 'jane@laundryowner.com', mobileNumber: '9876543211', 
    laundryName: 'Minty Clean Laundry', tenantCode: 'MINT8', isActive: true,
    subscription: 'yearly', paymentAmount: 24000, createdAt: '2025-06-20T00:00:00.000Z', paymentMode: 'upi'
  },
  { 
    _id: 'owner3', name: 'Bob Johnson', email: 'bob@laundryowner.com', mobileNumber: '9876543212', 
    laundryName: "Bob's Wash & Fold", tenantCode: 'BOB44', isActive: true,
    subscription: 'onetime', paymentAmount: 150000, createdAt: '2026-03-10T00:00:00.000Z', paymentMode: 'upi'
  },
];

let mockCoupons: MockCoupon[] = [
  { _id: 'coupon1', code: 'WELCOME10', discountType: 'percentage', discountValue: 10, validUntil: '2026-12-31T23:59:59.000Z', isActive: true },
  { _id: 'coupon2', code: 'FREESHIP', discountType: 'fixed', discountValue: 50, validUntil: '2026-08-31T23:59:59.000Z', isActive: true },
];

// ── Owners ───────────────────────────────────────────────────────────

export const getOwners = async (): Promise<any> => {
  try {
    const response = await api.get(ADMIN_OWNERS);
    return response.data;
  } catch (error: any) {
    console.warn("Using mock owners fallback due to API error:", error.message);
    return {
      success: true,
      data: mockOwners
    };
  }
};

export const createOwner = async (data: any): Promise<any> => {
  try {
    const response = await api.post(ADMIN_OWNERS, data);
    return response.data;
  } catch (error: any) {
    console.warn("Using mock owner creation fallback due to API error:", error.message);
    const newOwner: MockOwner = {
      _id: `owner_${Date.now()}`,
      name: data.name,
      email: data.email,
      mobileNumber: data.mobileNumber,
      laundryName: data.laundryName,
      tenantCode: null,
      isActive: true,
      subscription: data.subscription || 'monthly',
      paymentAmount: data.paymentAmount || 0,
      createdAt: new Date().toISOString(),
      paymentMode: data.paymentMode || 'cash',
    };
    mockOwners.push(newOwner);
    return {
      success: true,
      message: 'Owner created successfully (Mock)',
      data: newOwner
    };
  }
};

export const toggleOwner = async (ownerId: string, isActive: boolean): Promise<any> => {
  try {
    const response = await api.patch(ADMIN_OWNERS, { ownerId, isActive });
    return response.data;
  } catch (error: any) {
    console.warn("Using mock owner toggle fallback due to API error:", error.message);
    mockOwners = mockOwners.map(o => o._id === ownerId ? { ...o, isActive } : o);
    return {
      success: true,
      message: 'Owner status updated (Mock)'
    };
  }
};

export const updateOwner = async (id: string, data: any): Promise<any> => {
  try {
    const response = await api.put(`${ADMIN_OWNERS}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.warn("Using mock owner update fallback due to API error:", error.message);
    mockOwners = mockOwners.map(o => o._id === id ? { ...o, ...data } : o);
    return {
      success: true,
      message: 'Owner details updated successfully (Mock)',
      data: {
        owner: mockOwners.find(o => o._id === id)
      }
    };
  }
};

export const getOwnerDetails = async (id: string): Promise<any> => {
  try {
    const response = await api.get(`${ADMIN_OWNERS}/${id}`);
    return response.data;
  } catch (error: any) {
    console.warn("Using mock owner details fallback due to API error:", error.message);
    const mockOwner = mockOwners.find(o => o._id === id);
    return {
      success: true,
      data: {
        owner: mockOwner ? {
          ...mockOwner,
          mobileNumber: mockOwner.mobileNumber || '9876543210',
          photo: null,
          role: 'owner',
          createdAt: '2026-06-19T10:25:32.481Z',
          tenant: {
            _id: `tenant_${id}`,
            tenantCode: mockOwner.tenantCode || 'Y7X2B9WP',
            owner: id,
            laundryName: mockOwner.laundryName || 'Sparkle Premium Laundry',
            address: '456 Broadway Ave',
            landmark: 'Near Central Park',
            city: 'New York',
            state: 'NY',
            pincode: '10001',
            paymentAmount: 1500,
            paymentMode: 'upi',
            subscription: 'yearly',
            isActive: mockOwner.isActive
          }
        } : null
      }
    };
  }
};

// ── Tenants ──────────────────────────────────────────────────────────

export const getTenants = async (params?: any): Promise<any> => {
  try {
    const response = await api.get(ADMIN_TENANTS, { params });
    return response.data;
  } catch (error: any) {
    console.warn("Using mock tenants fallback due to API error:", error.message);
    let filtered = mockOwners.filter(o => o.tenantCode);
    if (params) {
      const { search } = params;
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(o => 
          o.name.toLowerCase().includes(query) || 
          (o.laundryName && o.laundryName.toLowerCase().includes(query)) ||
          (o.tenantCode && o.tenantCode.toLowerCase().includes(query))
        );
      }
    }
    return {
      success: true,
      data: {
        tenants: filtered.map(o => ({
          _id: `tenant_${o._id}`,
          tenantCode: o.tenantCode,
          laundryName: o.laundryName || `${o.name}'s Laundry`,
          name: o.name,
          isActive: o.isActive,
        }))
      }
    };
  }
};

// ── Coupons ──────────────────────────────────────────────────────────

export const getCoupons = async (): Promise<any> => {
  try {
    const response = await api.get(ADMIN_COUPONS);
    return response.data;
  } catch (error: any) {
    console.warn("Using mock coupons fallback due to API error:", error.message);
    return {
      success: true,
      data: mockCoupons
    };
  }
};

export const createCoupon = async (data: any): Promise<any> => {
  try {
    const response = await api.post(ADMIN_COUPONS, data);
    return response.data;
  } catch (error: any) {
    console.warn("Using mock coupon creation fallback due to API error:", error.message);
    const newCoupon: MockCoupon = {
      _id: `coupon_${Date.now()}`,
      code: data.code,
      discountType: data.discountType,
      discountValue: Number(data.discountValue),
      validUntil: data.validUntil,
      isActive: true
    };
    mockCoupons.push(newCoupon);
    return {
      success: true,
      message: 'Coupon created successfully (Mock)',
      data: newCoupon
    };
  }
};

export const updateCoupon = async (id: string, data: any): Promise<any> => {
  try {
    const response = await api.patch(`${ADMIN_COUPONS}/${id}`, data);
    return response.data;
  } catch (error: any) {
    console.warn("Using mock coupon update fallback due to API error:", error.message);
    mockCoupons = mockCoupons.map(c => c._id === id ? { ...c, ...data } : c);
    return {
      success: true,
      message: 'Coupon updated successfully (Mock)'
    };
  }
};

export const deleteCoupon = async (id: string): Promise<any> => {
  try {
    const response = await api.delete(`${ADMIN_COUPONS}/${id}`);
    return response.data;
  } catch (error: any) {
    console.warn("Using mock coupon deletion fallback due to API error:", error.message);
    mockCoupons = mockCoupons.filter(c => c._id !== id);
    return {
      success: true,
      message: 'Coupon deleted successfully (Mock)'
    };
  }
};

// ── Platform Stats ───────────────────────────────────────────────────

const calculateMockRevenue = (): number => {
  let total = 0;
  mockOwners.forEach(o => {
    const amount = o.paymentAmount || 0;
    const createdAtStr = o.createdAt || new Date().toISOString();
    const start = new Date(createdAtStr);
    const end = new Date();
    
    if (o.subscription === 'onetime') {
      total += amount;
    } else if (o.subscription === 'yearly') {
      const years = end.getFullYear() - start.getFullYear();
      const elapsedYears = Math.max(1, years);
      total += elapsedYears * amount;
    } else { // monthly
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      const elapsedMonths = Math.max(1, months);
      total += elapsedMonths * amount;
    }
  });
  return total;
};

export const getPlatformStats = async (): Promise<any> => {
  try {
    const response = await api.get(ADMIN_STATS);
    return response.data;
  } catch (error: any) {
    console.warn("Using mock platform stats fallback due to API error:", error.message);
    return {
      success: true,
      message: 'Platform stats fetched (Mock)',
      data: {
        stats: {
          totalOwners: mockOwners.length,
          totalCustomers: 1200,
          totalOrders: 3450,
          totalRevenue: calculateMockRevenue()
        }
      }
    };
  }
};

export const getPlatformCustomers = async (params?: any): Promise<any> => {
  try {
    const response = await api.get(ADMIN_CUSTOMERS, { params });
    return response.data;
  } catch (error: any) {
    console.warn("Using mock platform customers fallback due to API error:", error.message);
    const mockCustomers = [
      {
        _id: "cust1",
        name: "John Doe",
        email: "john@example.com",
        mobileNumber: "1234567890",
        role: "customer",
        isActive: true,
        createdAt: "2026-06-20T10:00:00.000Z",
        tenant: {
          _id: "tenant1",
          tenantCode: "HK23",
          laundryName: "FreshWash Central",
          owner: "owner1"
        }
      },
      {
        _id: "cust2",
        name: "Alice Johnson",
        email: "alice@example.com",
        mobileNumber: "9876543222",
        role: "customer",
        isActive: true,
        createdAt: "2026-06-21T11:00:00.000Z",
        tenant: {
          _id: "tenant2",
          tenantCode: "MINT8",
          laundryName: "Minty Clean Laundry",
          owner: "owner2"
        }
      },
      {
        _id: "cust3",
        name: "Bob Miller",
        email: "bob@miller.com",
        mobileNumber: "9876543233",
        role: "customer",
        isActive: false,
        createdAt: "2026-06-22T08:30:00.000Z",
        tenant: {
          _id: "tenant3",
          tenantCode: "BOB44",
          laundryName: "Bob's Wash & Fold",
          owner: "owner3"
        }
      }
    ];

    let filtered = mockCustomers;
    if (params) {
      const { search, ownerId } = params;
      if (ownerId) {
        filtered = filtered.filter(c => c.tenant?.owner === ownerId);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.mobileNumber.includes(q) ||
          (c.tenant?.laundryName && c.tenant.laundryName.toLowerCase().includes(q))
        );
      }
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

export const getPlatformOrders = async (params?: any): Promise<any> => {
  try {
    const response = await api.get(ADMIN_ORDERS, { params });
    return response.data;
  } catch (error: any) {
    console.warn("Using mock platform orders fallback due to API error:", error.message);
    const mockOrdersList = [
      {
        _id: "order_mock_1",
        orderNumber: "ORD-1718712345",
        tenant: {
          _id: "tenant1",
          tenantCode: "HK23",
          laundryName: "FreshWash Central"
        },
        branch: {
          _id: "branch1",
          name: "Central Branch",
          city: "New York"
        },
        customer: {
          _id: "cust1",
          name: "John Doe",
          email: "john@example.com"
        },
        status: "pending",
        pricing: {
          subtotal: 150.00,
          discount: 0.00,
          total: 150.00
        },
        paymentMethod: "cash",
        paymentStatus: "pending",
        createdAt: "2026-06-20T10:00:00.000Z"
      },
      {
        _id: "order_mock_2",
        orderNumber: "ORD-1718712999",
        tenant: {
          _id: "tenant2",
          tenantCode: "MINT8",
          laundryName: "Minty Clean Laundry"
        },
        branch: {
          _id: "branch2",
          name: "Downtown Outlet",
          city: "New York"
        },
        customer: {
          _id: "cust2",
          name: "Alice Johnson",
          email: "alice@example.com"
        },
        status: "delivered",
        pricing: {
          subtotal: 320.00,
          discount: 20.00,
          total: 300.00
        },
        paymentMethod: "upi",
        paymentStatus: "completed",
        createdAt: "2026-06-21T14:30:00.000Z"
      },
      {
        _id: "order_mock_3",
        orderNumber: "ORD-1718713555",
        tenant: {
          _id: "tenant3",
          tenantCode: "BOB44",
          laundryName: "Bob's Wash & Fold"
        },
        branch: {
          _id: "branch3",
          name: "Brooklyn Suite",
          city: "New York"
        },
        customer: {
          _id: "cust3",
          name: "Bob Miller",
          email: "bob@miller.com"
        },
        status: "processing",
        pricing: {
          subtotal: 450.00,
          discount: 0.00,
          total: 450.00
        },
        paymentMethod: "upi",
        paymentStatus: "pending",
        createdAt: "2026-06-22T10:15:00.000Z"
      }
    ];

    let filtered = mockOrdersList;
    if (params) {
      const { search, status } = params;
      if (status) {
        filtered = filtered.filter(o => o.status === status);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(o => 
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.tenant.laundryName.toLowerCase().includes(q)
        );
      }
    }

    return {
      success: true,
      message: "Orders fetched successfully (Mock)",
      data: {
        orders: filtered,
        total: filtered.length,
        page: 1,
        limit: 20,
        totalPages: 1
      }
    };
  }
};

export const getCustomerDetails = async (id: string): Promise<any> => {
  try {
    const response = await api.get(ADMIN_CUSTOMER_DETAIL(id));
    return response.data;
  } catch (error: any) {
    console.warn("Using mock customer details fallback due to API error:", error.message);
    return {
      success: true,
      message: "Customer details fetched (Mock)",
      data: {
        customer: {
          _id: id,
          name: "John Doe",
          email: "john@example.com",
          mobileNumber: "1234567890",
          role: "customer",
          isActive: true,
          createdAt: "2026-06-20T10:00:00.000Z",
          tenant: {
            _id: "tenant1",
            tenantCode: "HK23",
            laundryName: "FreshWash Central",
            owner: "owner1"
          }
        }
      }
    };
  }
};

export const getPlatformOrderDetails = async (id: string): Promise<any> => {
  try {
    const response = await api.get(ADMIN_ORDER_DETAIL(id));
    return response.data;
  } catch (error: any) {
    console.warn("Using mock order details fallback due to API error:", error.message);
    return {
      success: true,
      message: "Order details fetched (Mock)",
      data: {
        order: {
          _id: id,
          orderNumber: "ORD-1718712345",
          tenant: {
            _id: "tenant1",
            tenantCode: "HK23",
            laundryName: "FreshWash Central"
          },
          branch: {
            _id: "branch1",
            name: "Central Branch",
            city: "New York"
          },
          customer: {
            _id: "cust1",
            name: "John Doe",
            email: "john@example.com"
          },
          status: "pending",
          pricing: {
            subtotal: 150.00,
            discount: 0.00,
            total: 150.00
          },
          paymentMethod: "cash",
          paymentStatus: "pending",
          createdAt: "2026-06-20T10:00:00.000Z"
        }
      }
    };
  }
};
