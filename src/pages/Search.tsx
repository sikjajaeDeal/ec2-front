
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search as SearchIcon, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { salePostService, SalePost, SalePostsResponse, getStateText, getStateColor } from '@/services/salePostService';
import Header from '@/components/Header';

interface SearchParams {
  keyword?: string;
  minPrice?: string;
  maxPrice?: string;
  distance?: string;
  categoryPk?: string;
  page?: string;
}

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [distance, setDistance] = useState(3);
  const [categoryPk, setCategoryPk] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<SalePost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('keyword') || '');
    setMinPrice(params.get('minPrice') || '');
    setMaxPrice(params.get('maxPrice') || '');
    setDistance(Number(params.get('distance')) || 3);
    setCategoryPk(Number(params.get('categoryPk')) || null);

    handleSearch();
  }, [location.search]);

  const formatNumberInput = (value: string) => {
    const number = value.replace(/[^0-9]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchParams: SearchParams = {};
      if (searchQuery) searchParams.keyword = searchQuery;
      if (minPrice) searchParams.minPrice = minPrice;
      if (maxPrice) searchParams.maxPrice = maxPrice;
      searchParams.distance = distance.toString();
      if (categoryPk) searchParams.categoryPk = categoryPk.toString();

      const latitude = 37.5665;
      const longitude = 126.9780;

      const searchRequest = {
        latitude: latitude,
        longitude: longitude,
        minPrice: minPrice ? parseInt(minPrice.replace(/,/g, '')) : 0,
        maxPrice: maxPrice ? parseInt(maxPrice.replace(/,/g, '')) : 100000000,
        keyword: searchQuery,
        distance: distance,
        categoryPk: categoryPk,
        page: 0,
        size: 100
      };

      const response: SalePostsResponse = await salePostService.searchByLocation(searchRequest);
      setSearchResults(response.content);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
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
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 pr-4 py-3 text-lg"
                />
                <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              {/* 거리 및 카테고리 선택 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">검색 반경</Label>
                  <Select value={distance.toString()} onValueChange={(value) => setDistance(parseInt(value))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1km 이내</SelectItem>
                      <SelectItem value="3">3km 이내</SelectItem>
                      <SelectItem value="5">5km 이내</SelectItem>
                      <SelectItem value="10">10km 이내</SelectItem>
                      <SelectItem value="20">20km 이내</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">카테고리</Label>
                  <Select value={categoryPk?.toString() || ''} onValueChange={(value) => setCategoryPk(value ? parseInt(value) : null)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="전체" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">전체</SelectItem>
                      <SelectItem value="1">식자재</SelectItem>
                      <SelectItem value="2">곡물/잡곡</SelectItem>
                      <SelectItem value="3">채소류</SelectItem>
                      <SelectItem value="4">축산물</SelectItem>
                      <SelectItem value="5">수산물</SelectItem>
                      <SelectItem value="6">과일류</SelectItem>
                      <SelectItem value="7">유제품</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleSearch}
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
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              검색 결과 ({searchResults.length}개)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((product) => (
                <Card key={product.postPk} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <Link to={`/product/${product.postPk}`}>
                      <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden relative">
                        <img
                          src={product.thumbnailUrl || '/placeholder.svg'}
                          alt={product.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                        <Badge className={`absolute top-2 left-2 ${getStateColor(product.state)}`}>
                          {getStateText(product.state)}
                        </Badge>
                        <div className="absolute top-2 right-2 flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                          <Heart className="h-4 w-4 text-red-500" />
                          <span className="text-sm font-medium">{product.likeCount}</span>
                        </div>
                      </div>
                    </Link>
                    <div className="space-y-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.categoryName}
                      </span>
                      <h3 className="font-semibold text-lg truncate">{product.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{product.content}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(product.hopePrice)}원
                        </span>
                        <span className="text-xs text-gray-500">
                          조회 {product.viewCount}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
