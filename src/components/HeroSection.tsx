import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Leaf, Users, Award } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const HeroSection = () => {
  const { isLoggedIn } = useAuth();
  const { toast } = useToast();

  const handleSellClick = () => {
    if (!isLoggedIn) {
      toast({
        title: '로그인 필요',
        description: '상품 등록을 위해 로그인해주세요.',
        variant: 'destructive'
      });
      // 로그인 모달을 띄우는 로직은 Header에서 처리하도록 함
      const authModal = document.querySelector('[data-auth-modal]') as HTMLElement;
      if (authModal) {
        authModal.click();
      }
      return;
    }
    window.location.href = '/sell';
  };

  return (
    <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              신선한 식재료,
              <br />
              <span className="text-green-200">믿을 수 있는 거래</span>
            </h1>
            <p className="text-xl mb-8 text-green-100 leading-relaxed">
              전국의 우수한 농가와 식당, 유통업체를 연결하는 
              대한민국 최대 식재료 거래 플랫폼입니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-white text-green-700 hover:bg-green-50 transition-all transform hover:scale-105"
                onClick={() => window.location.href = '/products'}
              >
                상품 보기
              </Button>
              <Button 
                size="lg" 
                className="bg-white text-green-700 hover:bg-green-50 transition-all transform hover:scale-105"
                onClick={handleSellClick}
              >
                판매하기
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <Leaf className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">신선한 품질</h3>
                    <p className="text-green-100">엄선된 국내산 식재료</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">신뢰할 수 있는 파트너</h3>
                    <p className="text-green-100">검증된 판매자와 구매자</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 rounded-full p-3">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">투명한 거래</h3>
                    <p className="text-green-100">안전하고 공정한 거래 시스템</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
