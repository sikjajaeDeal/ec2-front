
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Package, Heart } from 'lucide-react';
import { salePostService, getStateText, getStateColor } from '@/services/salePostService';

const FeaturedProducts = () => {
  const navigate = useNavigate();

  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['topViewPosts'],
    queryFn: salePostService.getTopViewPosts,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const handleProductClick = (postPk: number) => {
    navigate(`/product/${postPk}`);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">인기 상품</h2>
            <p className="text-lg text-gray-600">많은 구매자들이 선택한 믿을 수 있는 식재료입니다</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-white animate-pulse">
                <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2 w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded mb-3 w-1/2"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">인기 상품</h2>
            <p className="text-lg text-gray-600">상품을 불러오는 중 오류가 발생했습니다.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">인기 상품</h2>
          <p className="text-lg text-gray-600">많은 구매자들이 선택한 믿을 수 있는 식재료입니다</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card 
              key={product.postPk} 
              className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white cursor-pointer"
              onClick={() => handleProductClick(product.postPk)}
            >
              <div className="relative overflow-hidden rounded-t-lg">
                <img
                  src={product.thumbnailUrl || `https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop`}
                  alt={product.title}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <Badge className={`absolute top-3 left-3 ${getStateColor(product.state)}`}>
                  {getStateText(product.state)}
                </Badge>
                <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">{product.likeCount}</span>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2 text-gray-900 line-clamp-2">{product.title}</h3>
                
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="truncate">{product.categoryName}</span>
                </div>
                
                <div className="flex items-center mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">조회 {product.viewCount}</span>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <Package className="h-4 w-4 mr-1" />
                  <span className="truncate">{formatDate(product.postAt)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-green-600">
                    {product.hopePrice === 0 ? '무료나눔' : `${formatPrice(product.hopePrice)}원`}
                  </span>
                </div>
                
                <div className="mt-2 text-sm text-gray-500">
                  판매자: {product.sellerNickname}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline" 
            className="px-8"
            onClick={() => navigate('/products')}
          >
            상품 보기
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
