
import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import KakaoMap from './KakaoMap';
import { salePostService, SalePost } from '@/services/salePostService';
import { authService } from '@/services/authService';

const MapSection = () => {
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 37.5636, // 기본값: 서울 중구
    longitude: 126.9975
  });
  const [locationName, setLocationName] = useState('서울 중구');
  const [nearbyProducts, setNearbyProducts] = useState<SalePost[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  useEffect(() => {
    // 현재 위치 가져오기
    const getCurrentLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("현재 위치 - 위도:", latitude, "경도:", longitude);
            
            setCurrentLocation({ latitude, longitude });
            
            // 주변 상품 검색
            searchNearbyProducts(latitude, longitude);
          },
          (error) => {
            console.error('위치 정보를 가져올 수 없습니다:', error.message);
            // 기본 위치로 주변 상품 검색
            searchNearbyProducts(37.5636, 126.9975);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5분간 캐시
          }
        );
      } else {
        console.log("브라우저가 위치 서비스를 지원하지 않습니다.");
        // 기본 위치로 주변 상품 검색
        searchNearbyProducts(37.5636, 126.9975);
      }
    };

    getCurrentLocation();
  }, []);

  const searchNearbyProducts = async (latitude: number, longitude: number) => {
    setIsLoadingProducts(true);
    try {
      const token = authService.getAccessToken();
      
      const searchRequest = {
        latitude,
        longitude,
        minPrice: 0,
        maxPrice: 100000000,
        keyword: "",
        distance: 2,
        categoryPk: null,
        page: 0,
        size: 100
      };

      console.log('API 요청 시작:', searchRequest);
      
      const response = await fetch('http://localhost:8080/api/sale-post/elasticsearch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(searchRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '주변 상품 검색에 실패했습니다.');
      }

      const data = await response.json();
      console.log('API 응답 성공:', data);
      
      setNearbyProducts(data.content || []);
    } catch (error) {
      console.error('주변 상품 검색 실패:', error);
      setNearbyProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleAddressChange = (address: string) => {
    setCurrentAddress(address);
    // 주소에서 시/구 정보 추출
    const parts = address.split(' ');
    const shortAddress = parts.length >= 2 ? `${parts[0]} ${parts[1]}` : address;
    setLocationName(shortAddress);
  };

  return (
    <section className="py-16 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            내 주변 농산물 거래 현황
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            지도에서 확인하는 실시간 거래 정보
          </p>
          
          {/* 현재 위치 표시 */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white rounded-full px-6 py-3 shadow-lg border-2 border-green-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
                <span className="text-2xl font-semibold text-gray-800">
                  📍 현재 위치: {locationName}
                </span>
              </div>
            </div>
          </div>

          {/* 주변 상품 수 표시 */}
          <div className="mb-8">
            <div className="bg-green-100 rounded-lg px-4 py-2 inline-block">
              <span className="text-green-800 font-medium">
                {isLoadingProducts ? '검색 중...' : `주변 2km 내 상품 ${nearbyProducts.length}개`}
              </span>
            </div>
          </div>
        </div>

        {/* 16:9 비율의 지도 컨테이너 */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full h-[600px]">
          <KakaoMap
            latitude={currentLocation.latitude}
            longitude={currentLocation.longitude}
            width="100%"
            height="600px"
            level={4}
            showAddress={false}
            onAddressChange={handleAddressChange}
            className="w-full h-full"
            showCurrentLocationMarker={true}
            nearbyProducts={nearbyProducts}
          />
        </div>

        {/* 지도 설명 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            지도를 클릭하거나 드래그하여 다른 지역의 거래 현황을 확인해보세요
          </p>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
