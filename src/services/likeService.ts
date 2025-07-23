
import { authService } from './authService';

// 환경변수에서 API URL 가져오기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://beanba.store';

export interface LikedProduct {
  postPk: number;
  sellerNickname: string;
  categoryName: string;
  title: string;
  content: string;
  hopePrice: number;
  viewCount: number;
  likeCount: number;
  postAt: string;
  stateAt: string;
  state: string;
  latitude: number;
  longitude: number;
  thumbnailUrl: string;
  salePostLiked: boolean;
}

export interface LikedProductsResponse {
  content: LikedProduct[];
  page: number;
  size: number;
  totalElements: number;
  totalPage: number;
  last: boolean;
}

class LikeService {
  private baseURL = `${API_BASE_URL}/api/like`;

  async likeProduct(postPk: number): Promise<void> {
    const token = authService.getAccessToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${this.baseURL}/${postPk}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('좋아요 등록에 실패했습니다.');
    }
  }

  async unlikeProduct(postPk: number): Promise<void> {
    const token = authService.getAccessToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${this.baseURL}/${postPk}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('좋아요 취소에 실패했습니다.');
    }
  }

  async getLikedProducts(page: number = 0): Promise<LikedProductsResponse> {
    const token = authService.getAccessToken();
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${this.baseURL}/mypage?page=${page}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('찜한 상품 목록을 불러오는데 실패했습니다.');
    }

    return response.json();
  }
}

export const likeService = new LikeService();
