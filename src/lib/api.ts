
import { salePostService } from '@/services/salePostService';
import { likeService } from '@/services/likeService';

export const getProductDetail = async (postPk: string | undefined) => {
  if (!postPk) {
    throw new Error('Product ID is required');
  }
  return salePostService.getSalePostDetail(Number(postPk));
};

export const likeProduct = async (postPk: number) => {
  return likeService.likeProduct(postPk);
};

export const unlikeProduct = async (postPk: number) => {
  return likeService.unlikeProduct(postPk);
};
