import api from './client';
import { RATINGS } from './endpoints';

export const submitRating = async (orderId: string, rating: number, review: string): Promise<any> => {
  try {
    const response = await api.post(RATINGS, { orderId, rating, review });
    return response.data;
  } catch (error) {
    throw error;
  }
};
