import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search as SearchIcon, Heart, Eye, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { salePostService, SalePost, SalePostsResponse, getStateText, getStateColor } from '@/services/salePostService';
import { likeService } from '@/services/likeService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ReportButton from '@/components/ReportButton';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface SearchParams {
  keyword?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
}

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchResults, setSearchResults] = useState<SalePost[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [likingPosts, setLikingPosts] = useState<Set<number>>(new Set());

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get('keyword') || '';
    const minPriceParam = params.get('minPrice') || '';
    const maxPriceParam = params.get('maxPrice') || '';
    const pageParam = parseInt(params.get('page') || '0');
    
    setSearchQuery(keyword);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
    setCurrentPage(pageParam);

    if (keyword || minPriceParam || maxPriceParam) {
      handleSearch(keyword, minPriceParam, maxPriceParam, pageParam);
    }
  }, [location.search]);

  const formatNumberInput = (value: string) => {
    const number = value.replace(/[^0-9]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

  const handleSearch = async (keyword?: string, minPriceParam?: string, maxPriceParam?: string, page: number = 0) => {
    setLoading(true);
    try {
      const searchRequest = {
        latitude: null,
        longitude: null,
        minPrice: minPriceParam ? parseInt(minPriceParam.replace(/,/g, '')) : 0,
        maxPrice: maxPriceParam ? parseInt(maxPriceParam.replace(/,/g, '')) : 100000000,
        keyword: keyword || searchQuery,
        distance: null,
        categoryPk: null,
        page: page,
        size: 20
      };

      const response: SalePostsResponse = await salePostService.searchByLocation(searchRequest);
      setSearchResults(response.content);
      setTotalPages(response.totalPage);
      setTotalElements(response.totalElements);
      setCurrentPage(response.page);
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: '검색 실패',
        description: error instanceof Error ? error.message : '검색에 실패했습니다.',
        variant: 'destructive'
      });
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('keyword', searchQuery);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    params.set('page', '0');
    
    navigate(`/search?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    if (page >= 0 && page < totalPages) {
      const params = new URLSearchParams();
      if (searchQuery) params.set('keyword', searchQuery);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      params.set('page', page.toString());
      
      navigate(`/search?${params.toString()}`);
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

    const product = searchResults.find(p => p.postPk === postPk);
    const isCurrentlyLiked = product?.salePostLiked;

    setLikingPosts(prev => new Set(prev).add(postPk));
    try {
      if (isCurrentlyLiked) {
        await likeService.unlikeProduct(postPk);
      } else {
        await likeService.likeProduct(postPk);
      }
      // 현재 검색 결과 다시 로드
      await handleSearch(searchQuery, minPrice, maxPrice, currentPage);
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">식재료 검색</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minPrice" className="text-sm font-medium text-gray-700">최소 가격</Label>
                  <Input
                    id="minPrice"
                    type="text"
                    placeholder="0원"
                    value={minPrice}
                    onChange={(e) => setMinPrice(formatNumberInput(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="maxPrice" className="text-sm font-medium text-gray-700">최대 가격</Label>
                  <Input
                    id="maxPrice"
                    type="text"
                    placeholder="최대 1억원"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(formatNumberInput(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="relative">
                <Input
                  type="text"
                  placeholder="어떤 식재료를 찾고 계신가요?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                  className="pl-12 pr-4 py-3 text-lg"
                />
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <Button 
                onClick={handleSearchSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? '검색 중...' : '검색하기'}
              </Button>
            </div>
          </div>
        </div>

        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                검색 결과 ({totalElements})
              </h2>
              <div className="text-sm text-gray-500">
                페이지 {currentPage + 1} / {totalPages}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((product) => (
                <Link to={`/product/${product.postPk}`} key={product.postPk}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative">
                      <img
                        src={product.thumbnailUrl || '/placeholder.svg'}
                        alt={product.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute top-2 right-2 flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleLike(product.postPk, e)}
                          disabled={likingPosts.has(product.postPk)}
                          className="p-2 bg-white/80 hover:bg-white"
                        >
                          <Heart className={`h-4 w-4 ${product.salePostLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <ReportButton postId={product.postPk} reporteePk={product.sellerPk} className="bg-white/80 hover:bg-white" />
                      </div>
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
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            {renderPagination()}
          </div>
        )}

        {!loading && searchResults.length === 0 && (searchQuery || minPrice || maxPrice) && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-4">검색 결과가 없습니다.</p>
            <p className="text-gray-400">다른 키워드로 검색해보세요.</p>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Search;
