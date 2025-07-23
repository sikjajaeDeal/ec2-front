
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

export const SocialLoginButtons = () => {
  const handleKakaoLogin = () => {
    window.location.href = 'https://beanba.store/oauth2/authorization/kakao';
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://beanba.store/oauth2/authorization/google';
  };

  return (
    <div className="flex flex-col gap-3 mt-4">
      <Button
        type="button"
        variant="outline"
        onClick={handleKakaoLogin}
        className="w-full bg-yellow-300 hover:bg-yellow-400 text-black border-yellow-300"
      >
        <MessageCircle className="w-5 h-5 mr-2 text-black" />
        카카오로 로그인
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleLogin}
        className="w-full"
      >
        <img 
          src="/lovable-uploads/4ce96b34-2bb1-457e-a209-4e2aee285a06.png" 
          alt="Google" 
          className="w-5 h-5 mr-2"
        />
        구글로 로그인
      </Button>
    </div>
  );
};
