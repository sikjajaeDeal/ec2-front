
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Eye, MapPin, ArrowLeft } from 'lucide-react';
import { likeService, LikedProduct, LikedProductsResponse } from '@/services/likeService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

const LikedProducts = () => {
  const [likedProductsData, setLikedProductsData] = useState<LikedProductsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [likingPosts, setLikingPosts] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      toast({
        title: '로그인 필요',
        description: '찜한 상품을 보려면 로그인이 필요합니다.',
        variant: 'destructive'
      });
      return;
    }

    loadLikedProducts(currentPage);
  }, [user, currentPage, toast]);

  const loadLikedProducts = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await likeService.getLikedProducts(page);
      setLikedProductsData(data);
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '찜한 상품 목록을 불러오는데 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatPrice = (price: number) => {
    return price === 0 ? '무료나눔' : `${price.toLocaleString()}원`;
  };

  const getStateText = (state: string) => {
    switch (state) {
      case 'S': return '판매중';
      case 'C': return '거래완료';
      case 'R': return '예약중';
      default: return '알 수 없음';
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'S': return 'bg-green-100 text-green-800';
      case 'C': return 'bg-gray-100 text-gray-800';
      case 'R': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUnlike = async (postPk: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (likingPosts.has(postPk)) return;

    setLikingPosts(prev => new Set(prev).add(postPk));
    try {
      await likeService.unlikeProduct(postPk);
      // 현재 페이지 다시 로드
      await loadLikedProducts(currentPage);
      toast({
        title: '찜 취소',
        description: '찜한 상품에서 제거되었습니다.'
      });
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '찜 취소에 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setLikingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postPk);
        return newSet;
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">로그인이 필요합니다</h1>
            <Link 
              to="/products" 
              className="inline-flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>상품 목록으로 돌아가기</span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">찜한 상품 목록을 불러오는 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const likedProducts = likedProductsData?.content || [];
  const totalElements = likedProductsData?.totalElements || 0;
  const totalPages = likedProductsData?.totalPage || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/profile" 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>프로필로 돌아가기</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">찜한 상품</h1>
          <p className="text-gray-600">
            총 {totalElements}개의 상품을 찜했습니다.
          </p>
        </div>

        {/* Products Grid */}
        {likedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-500 mb-4">
              <Heart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">찜한 상품이 없습니다</h3>
              <p>마음에 드는 상품을 찜해보세요!</p>
            </div>
            <Link to="/products">
              <Button className="mt-4">
                상품 둘러보기
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {likedProducts.map((product) => (
                <Link 
                  key={product.postPk} 
                  to={`/product/${product.postPk}`}
                  className="block group"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                    <div className="relative">
                      <img
                        src={product.thumbnailUrl}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleUnlike(product.postPk, e)}
                        disabled={likingPosts.has(product.postPk)}
                        className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white"
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                        {product.title}
                      </h3>
                      
                      <div className="text-lg font-bold text-green-600 mb-3">
                        {formatPrice(product.hopePrice)}
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                        <MapPin className="h-4 w-4" />
                        <span>{product.sellerNickname}</span>
                        <span>•</span>
                        <span>{product.categoryName}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{product.viewCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{product.likeCount}</span>
                          </div>
                        </div>
                        <Badge className={getStateColor(product.state)}>
                          {getStateText(product.state)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 0 && handlePageChange(currentPage - 1)}
                        className={currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          onClick={() => handlePageChange(i)}
                          isActive={currentPage === i}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages - 1 && handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default LikedProducts;
