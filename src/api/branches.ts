import api from './client';
import { BRANCHES_NEAREST } from './endpoints';

export const getNearestBranch = async (
  lat: number,
  lng: number,
  tenantCode?: string
): Promise<any> => {
  try {
    const params: Record<string, any> = { lat, lng };
    if (tenantCode) {
      params.tenantCode = tenantCode;
    }
    const response = await api.get(BRANCHES_NEAREST, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};
