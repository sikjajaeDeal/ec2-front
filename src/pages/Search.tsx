
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Eye, MapPin, ChevronLeft, ChevronRight, Search } from 'lucide-react';
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

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductWithAddress[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [likingPosts, setLikingPosts] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [priceError, setPriceError] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  // URL 파라미터에서 검색 조건 가져오기
  useEffect(() => {
    const keywordParam = searchParams.get('keyword') || '';
    const minPriceParam = searchParams.get('minPrice') || '';
    const maxPriceParam = searchParams.get('maxPrice') || '';
    const pageParam = parseInt(searchParams.get('page') || '0');

    setKeyword(keywordParam);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
    setCurrentPage(pageParam);

    if (keywordParam || minPriceParam || maxPriceParam) {
      performSearch(keywordParam, minPriceParam, maxPriceParam, pageParam);
    }
  }, [searchParams]);

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

  const formatNumberInput = (value: string) => {
    const number = value.replace(/[^0-9]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleMinPriceChange = (value: string) => {
    setMinPrice(value);
    setPriceError('');
  };

  const handleMaxPriceChange = (value: string) => {
    const numValue = parseInt(value.replace(/,/g, ''));
    if (value && numValue > 100000000) {
      setPriceError('최대 거래금액을 초과했습니다.');
      return;
    }
    setMaxPrice(value);
    setPriceError('');
  };

  const performSearch = async (searchKeyword: string, searchMinPrice: string, searchMaxPrice: string, page: number = 0) => {
    if (priceError) return;

    try {
      setIsLoading(true);
      await loadKakaoMapScript();
      
      const minPriceValue = searchMinPrice ? parseInt(searchMinPrice.replace(/,/g, '')) : 0;
      const maxPriceValue = searchMaxPrice ? parseInt(searchMaxPrice.replace(/,/g, '')) : 100000000;

      const response: SalePostsResponse = await salePostService.searchByLocation({
        latitude: null,
        longitude: null,
        minPrice: minPriceValue,
        maxPrice: maxPriceValue,
        keyword: searchKeyword,
        distance: null,
        categoryPk: null,
        page: page,
        size: 20
      });
      
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
        description: error instanceof Error ? error.message : '검색에 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (priceError) return;

    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    params.set('page', '0');

    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      const params = new URLSearchParams(searchParams);
      params.set('page', page.toString());
      setSearchParams(params);
    }
  };

  const handleLike = async (postPk: number, e: React.MouseEvent) => {
    e.preventDefault();
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
      await performSearch(keyword, minPrice, maxPrice, currentPage);
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
                {page + 1}
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      {/* Search Section */}
      <section className="py-8 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">식재료 검색</h1>
            
            {/* Price Range Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">최소 가격</Label>
                <Input
                  type="text"
                  placeholder="0원 (무료 나눔 포함)"
                  value={minPrice}
                  onChange={(e) => handleMinPriceChange(formatNumberInput(e.target.value))}
                  className="border-green-200 focus:border-green-400"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">최대 가격</Label>
                <Input
                  type="text"
                  placeholder="최대 1억원"
                  value={maxPrice}
                  onChange={(e) => handleMaxPriceChange(formatNumberInput(e.target.value))}
                  className="border-green-200 focus:border-green-400"
                />
              </div>
            </div>

            {/* Price Error Message */}
            {priceError && (
              <div className="text-red-500 text-sm font-medium">{priceError}</div>
            )}

            {/* Main Search Bar */}
            <div className="relative">
              <Input
                type="text"
                placeholder="어떤 식재료를 찾고 계신가요?"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-14 pr-4 py-6 w-full border-green-200 focus:border-green-400 text-xl placeholder:text-gray-400 rounded-xl"
              />
              <Search className="absolute left-4 top-6 h-6 w-6 text-gray-400" />
            </div>

            {/* Search Button */}
            <Button 
              className="w-full py-6 text-lg font-semibold bg-green-600 hover:bg-green-700"
              onClick={handleSearch}
              disabled={isLoading}
            >
              <Search className="h-5 w-5 mr-2" />
              {isLoading ? '검색 중...' : '식재료 검색'}
            </Button>
          </div>
        </div>
      </section>

      {/* Search Results */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[40vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">검색 중...</p>
              </div>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  검색 결과 ({totalElements})
                </h2>
                <div className="text-sm text-gray-500">
                  페이지 {currentPage + 1} / {totalPages}
                </div>
              </div>

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
          ) : (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-500 mb-4">다른 키워드로 검색해보세요.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SearchPage;
