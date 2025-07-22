
interface KamisPriceData {
  itemCode: string;
  itemName: string;
  baseDate: string;
  price: number;
  updatedAt: string;
}

export const kamisService = {
  getAllPrices: async (): Promise<KamisPriceData[]> => {
    const response = await fetch('http://beanba.store/api/kamis/all');
    if (!response.ok) {
      throw new Error('Failed to fetch kamis price data');
    }
    return response.json();
  }
};

export type { KamisPriceData };
