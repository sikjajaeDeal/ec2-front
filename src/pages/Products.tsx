
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Eye, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { salePostService, SalePost, SalePostsResponse, getStateText, getStateColor } from '@/services/salePostService';
import { likeService } from '@/services/likeService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { convertCoordsToAddress, loadKakaoMapScript } from '@/utils/addressUtils';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface ProductWithAddress extends SalePost {
  addressName?: string;
}

const Products = () => {
  const [products, setProducts] = useState<ProductWithAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [likingPosts, setLikingPosts] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(0); // 0-based index
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadProducts = async (page: number) => {
    try {
      setIsLoading(true);
      // 카카오맵 스크립트 로드
      await loadKakaoMapScript();
      
      const response: SalePostsResponse = await salePostService.getSalePosts(page);
      
      // 각 상품의 좌표를 주소로 변환
      const productsWithAddress = await Promise.all(
        response.content.map(async (product) => {
          try {
            const addressName = await convertCoordsToAddress(product.latitude, product.longitude);
            return { ...product, addressName };
          } catch (error) {
            console.error('주소 변환 실패:', error);
            return { ...product, addressName: '주소 정보 없음' };
          }
        })
      );
      
      setProducts(productsWithAddress);
      setTotalPages(response.totalPage);
      setTotalElements(response.totalElements);
      setCurrentPage(response.page);
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '상품 목록을 불러오는데 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(0); // 첫 페이지 로드 (0-based)
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      loadProducts(page);
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? '무료나눔' : `${price.toLocaleString()}원`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLike = async (postPk: number, e: React.MouseEvent) => {
    e.preventDefault(); // Link 클릭 방지
    e.stopPropagation();

    if (!user) {
      toast({
        title: '로그인 필요',
        description: '좋아요를 하려면 로그인이 필요합니다.',
        variant: 'destructive'
      });
      return;
    }

    if (likingPosts.has(postPk)) return;

    const product = products.find(p => p.postPk === postPk);
    const isCurrentlyLiked = product?.salePostLiked;

    setLikingPosts(prev => new Set(prev).add(postPk));
    try {
      if (isCurrentlyLiked) {
        await likeService.unlikeProduct(postPk);
      } else {
        await likeService.likeProduct(postPk);
      }
      // 현재 페이지 다시 로드
      await loadProducts(currentPage);
      toast({
        title: isCurrentlyLiked ? '찜 취소' : '찜 등록',
        description: isCurrentlyLiked ? '찜 목록에서 제거되었습니다.' : '찜 목록에 추가되었습니다.'
      });
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '좋아요 처리에 실패했습니다.',
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

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 0; i < totalPages; i++) {
      pages.push(i);
    }

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(currentPage - 1)}
              className={currentPage === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            >
              <ChevronLeft className="h-4 w-4" />
              이전
            </PaginationPrevious>
          </PaginationItem>

          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => handlePageChange(page)}
                isActive={currentPage === page}
                className="cursor-pointer"
              >
                {page + 1} {/* 사용자에게는 1-based로 표시 */}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(currentPage + 1)}
              className={currentPage === totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">상품 목록을 불러오는 중...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            신선한 식재료 마켓
          </h1>
          <p className="text-xl text-green-100 mb-8">
            지역 생산자들이 직접 판매하는 신선한 농산물을 만나보세요
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              전체 상품 ({totalElements})
            </h2>
            <div className="text-sm text-gray-500">
              페이지 {currentPage + 1} / {totalPages}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-4">등록된 상품이 없습니다.</p>
              <Link 
                to="/sell" 
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                첫 상품 등록하기
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Link to={`/product/${product.postPk}`} key={product.postPk}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <img
                        src={product.thumbnailUrl}
                        alt={product.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleLike(product.postPk, e)}
                        disabled={likingPosts.has(product.postPk)}
                        className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white"
                      >
                        <Heart className={`h-4 w-4 ${product.salePostLiked ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Badge 
                        className={`absolute top-2 left-2 ${getStateColor(product.state)}`}
                      >
                        {getStateText(product.state)}
                      </Badge>
                    </div>
                    
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-xs">
                          {product.categoryName}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">{product.likeCount}</span>
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">
                        {product.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {product.content}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice(product.hopePrice)}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{product.viewCount}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{product.sellerNickname}</span>
                          <span>{formatDate(product.postAt)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span>{product.addressName || '주소 정보 없음'}</span>
                        </div>
                      </div>
                    </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              
              {renderPagination()}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Products;
