
import React from 'react';
import { X, MapPin, User, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  price: string;
  category: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  seller: string;
  description: string;
  image: string;
}

interface ProductInfoPanelProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductInfoPanel = ({ product, isOpen, onClose }: ProductInfoPanelProps) => {
  if (!product) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '곡물/두류': return 'bg-amber-100 text-amber-800';
      case '채소류': return 'bg-emerald-100 text-emerald-800';
      case '특용작물': return 'bg-violet-100 text-violet-800';
      case '과일류': return 'bg-red-100 text-red-800';
      case '축산물': return 'bg-orange-100 text-orange-800';
      case '수산물': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`fixed top-0 right-0 h-full w-2/3 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">상품 정보</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-gray-200">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Product Image */}
            <div className="mb-6">
              <img
                src={`https://images.unsplash.com/${product.image}?w=600&h=400&fit=crop`}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            </div>
            
            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h3>
                <div className={`inline-block px-3 py-1 text-sm font-medium rounded-full mb-4 ${getCategoryColor(product.category)}`}>
                  {product.category}
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600 mb-2">{product.price}</div>
                <p className="text-sm text-green-700">가격은 협의 가능할 수 있습니다</p>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-600 py-3 border-b border-gray-100">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-500">판매자</span>
                  <div className="font-medium text-gray-900">{product.seller}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-gray-600 py-3 border-b border-gray-100">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-500">거래 장소</span>
                  <div className="font-medium text-gray-900">{product.location.address}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Package className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">상품 설명</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            </div>
          </div>
          
          {/* Footer Actions */}
          <div className="border-t p-6 space-y-3 bg-gray-50">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3">
              판매자에게 연락하기
            </Button>
            <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50 font-medium py-3">
              찜하기 ♡
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductInfoPanel;
