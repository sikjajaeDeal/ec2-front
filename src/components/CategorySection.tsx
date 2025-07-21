
import React from 'react';
import { Card } from '@/components/ui/card';

const CategorySection = () => {
  const categories = [
    {
      name: '곡물/잡곡',
      image: 'photo-1618160702438-9b02ab6515c9',
      count: '1,234개 상품'
    },
    {
      name: '채소류',
      image: 'photo-1465146344425-f00d5f5c8f07',
      count: '2,567개 상품'
    },
    {
      name: '축산물',
      image: 'photo-1493962853295-0fd70327578a',
      count: '892개 상품'
    },
    {
      name: '수산물',
      image: 'photo-1506744038136-46273834b3fb',
      count: '1,456개 상품'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            카테고리별 상품 보기
          </h2>
          <p className="text-lg text-gray-600">
            다양한 식재료를 카테고리별로 쉽게 찾아보세요
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Card key={category.name} className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative">
                <img
                  src={`https://images.unsplash.com/${category.image}?w=400&h=300&fit=crop`}
                  alt={category.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                  <p className="text-sm text-white/90">{category.count}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
