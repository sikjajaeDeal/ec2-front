
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { kamisService, KamisPriceData } from '@/services/kamisService';

const PriceTicker = () => {
  const { data: priceData = [], isLoading, error } = useQuery({
    queryKey: ['kamisPrices'],
    queryFn: kamisService.getAllPrices,
    refetchInterval: 60000, // 1분마다 새로고침
  });

  const formatPrice = (price: number) => {
    if (price === 0) return "정보 없음";
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  // 랜덤 시작 위치로 데이터 섞기
  const shuffledData = useMemo(() => {
    if (priceData.length === 0) return [];
    const startIndex = Math.floor(Math.random() * priceData.length);
    return [...priceData.slice(startIndex), ...priceData.slice(0, startIndex)];
  }, [priceData]);

  if (isLoading || error || priceData.length === 0) {
    return (
      <section className="py-8 bg-gradient-to-r from-green-50 to-blue-50 overflow-hidden">
        <div className="flex animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="flex-shrink-0 mx-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-sm">
              <div className="h-4 bg-gray-300 rounded mb-2 w-16"></div>
              <div className="h-3 bg-gray-300 rounded w-20"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // 섞인 데이터를 두 번 복사하여 무한 스크롤 효과 생성
  const duplicatedData = [...shuffledData, ...shuffledData];

  return (
    <section className="py-8 bg-gradient-to-r from-green-50 to-blue-50 overflow-hidden">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">실시간 농산물 가격 정보</h2>
        <p className="text-sm text-gray-600">KAMIS 도매가격 정보 ({priceData[0]?.baseDate})</p>
      </div>
      
      <div className="relative">
        <div className="flex animate-scroll-left">
          {duplicatedData.map((item, index) => (
            <div
              key={`${item.itemCode}-${index}`}
              className="flex-shrink-0 mx-3 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-white/20 hover:bg-green-500 hover:text-white transition-all duration-300 cursor-pointer"
              style={{ minWidth: '120px' }}
            >
              <div className="text-center">
                <div className="text-sm font-semibold mb-1">
                  {item.itemName}
                </div>
                <div className="text-xs font-bold text-red-600 group-hover:text-white hover:text-white">
                  {item.price === 0 ? "정보 없음" : `${formatPrice(item.price)}원`}
                </div>
                <div className="text-xs text-gray-500 hover:text-white/80 mt-1">
                  {item.baseDate}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 좌우 그라데이션 효과 */}
        <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-green-50 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-blue-50 to-transparent pointer-events-none"></div>
      </div>
    </section>
  );
};

export default PriceTicker;
