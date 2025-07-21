
import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <div className="text-2xl font-bold text-green-400 mb-4">콩바구니</div>
            <p className="text-gray-300 mb-4">
              신선한 식재료와 믿을 수 있는 거래를 연결하는 
              대한민국 최대 식재료 거래 플랫폼
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">빠른 링크</h3>
            <ul className="space-y-2">
              <li><a href="/products" className="text-gray-300 hover:text-white transition-colors">상품 보기</a></li>
              <li><a href="/sell" className="text-gray-300 hover:text-white transition-colors">판매하기</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">카테고리</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">곡물/잡곡</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">채소류</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">축산물</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">수산물</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">연락처</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-green-400" />
                <span className="text-gray-300">1588-1234</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-green-400" />
                <span className="text-gray-300">info@kongbaguini.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-green-400" />
                <span className="text-gray-300">서울시 강남구 테헤란로 123</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 콩바구니. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">이용약관</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">개인정보처리방침</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">고객센터</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
