import React, { useState } from 'react';
import { Search, Menu, User, Heart, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import AuthModal from './AuthModal';
import { useAuth } from '@/contexts/AuthContext';

interface SearchResult {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [priceError, setPriceError] = useState('');
  const navigate = useNavigate();

  // 임시 검색 결과 데이터 (나중에 백엔드 API로 교체)
  const mockSearchResults: SearchResult[] = [
    { id: 1, name: '유기농 토마토', category: '채소', price: 15000, image: '/placeholder.svg' },
    { id: 2, name: '국산 양파', category: '채소', price: 8000, image: '/placeholder.svg' },
    { id: 3, name: '친환경 상추', category: '채소', price: 12000, image: '/placeholder.svg' },
    { id: 4, name: '제주 감귤', category: '과일', price: 25000, image: '/placeholder.svg' },
    { id: 5, name: '무료 나눔 배추', category: '채소', price: 0, image: '/placeholder.svg' },
  ];
  
  const { isLoggedIn, memberInfo, logout } = useAuth();

  const formatPrice = (price: number) => {
    if (price === 0) return '무료 나눔';
    return `${price.toLocaleString()}원`;
  };

  const formatNumberInput = (value: string) => {
    const number = value.replace(/[^0-9]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleMinPriceChange = (value: string) => {
    setMinPrice(value);
    setPriceError('');
    console.log('Min price changed:', value);
  };

  const handleMaxPriceChange = (value: string) => {
    const numValue = parseInt(value.replace(/,/g, ''));
    if (value && numValue > 100000000) {
      setPriceError('최대 거래금액을 초과했습니다.');
      return;
    }
    setMaxPrice(value);
    setPriceError('');
    console.log('Max price changed:', value);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSearchResults(value.length > 0);
    console.log('Search query:', value);
  };

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('keyword', searchQuery);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    
    navigate(`/search?${params.toString()}`);
    setShowSearchResults(false);
  };

  const handleLoginClick = () => {
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b-2 border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-green-700">콩바구니</Link>
              <div className="ml-2 text-sm text-gray-600 hidden sm:block">식재료 거래 플랫폼</div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/products" className="text-gray-700 hover:text-green-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-50">상품 보기</Link>
              <Link to="/sell" className="text-gray-700 hover:text-green-600 transition-colors px-3 py-2 rounded-md hover:bg-gray-50">판매하기</Link>
              <Button 
                variant="ghost" 
                onClick={() => setShowSearchResults(!showSearchResults)}
                className="text-gray-700 hover:text-green-600"
              >
                <Search className="h-4 w-4 mr-1" />
                검색
              </Button>
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {isLoggedIn && memberInfo ? (
                <div className="flex items-center space-x-3">
                  <Link to="/profile">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                          {memberInfo.nickname.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:block">{memberInfo.nickname}</span>
                    </Button>
                  </Link>
                  <Link to="/liked-products">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        if (window.location.pathname === '/liked-products') {
                          window.location.reload();
                        }
                      }}
                    >
                      <Heart className="h-4 w-4" />
                      <span className="hidden sm:block ml-1">찜</span>
                    </Button>
                  </Link>
                  <Link to="/my-posts">
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:block ml-1">내글</span>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:block">
                    로그아웃
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden sm:flex items-center space-x-2"
                  onClick={handleLoginClick}
                >
                  <User className="h-4 w-4" />
                  <span>로그인</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search Section - Collapsible */}
        {showSearchResults && (
          <div className="bg-green-600 py-12">
            <div className="max-w-3xl mx-auto px-4">
              <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
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
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    className="pl-14 pr-4 py-6 w-full border-green-200 focus:border-green-400 text-xl placeholder:text-gray-400 rounded-xl"
                  />
                  <Search className="absolute left-4 top-6 h-6 w-6 text-gray-400" />

                  {/* Search Results Dropdown */}
                  {searchQuery.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto z-50">
                      <div className="p-2">
                        <div className="text-sm text-gray-500 px-3 py-2 border-b">연관 거래 가능 물품</div>
                        {mockSearchResults
                          .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((item) => (
                            <div 
                              key={item.id}
                              className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                            >
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover mr-3"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">{item.name}</div>
                                <div className="text-sm text-gray-500">{item.category}</div>
                              </div>
                              <div className="text-lg font-bold text-red-500 ml-4">
                                {formatPrice(item.price)}
                              </div>
                            </div>
                          ))}
                        {mockSearchResults.filter(item => 
                          item.name.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length === 0 && (
                          <div className="p-4 text-center text-gray-500">
                            검색 결과가 없습니다.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <Button 
                  className="w-full py-6 text-lg font-semibold bg-green-600 hover:bg-green-700"
                  onClick={handleSearchSubmit}
                >
                  <Search className="h-5 w-5 mr-2" />
                  식재료 검색
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};

export default Header;
