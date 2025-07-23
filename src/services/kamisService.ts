
// 환경변수에서 API URL 가져오기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface KamisPriceData {
  itemCode: string;
  itemName: string;
  baseDate: string;
  price: number;
  updatedAt: string;
}

export const kamisService = {
  getAllPrices: async (): Promise<KamisPriceData[]> => {
    const response = await fetch(`${API_BASE_URL}/api/kamis/all`);
    if (!response.ok) {
      throw new Error('Failed to fetch kamis price data');
    }
    return response.json();
  }
};

export type { KamisPriceData };
