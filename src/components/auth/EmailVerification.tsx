
import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

interface EmailVerificationProps {
  onEmailSent: (email: string) => void;
}

const EmailVerification = ({ onEmailSent }: EmailVerificationProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // 이메일 형식 검증
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSendEmail = async () => {
    if (!email) {
      toast({
        title: "오류",
        description: "이메일을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "오류",
        description: "올바른 이메일 형식을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.sendEmailVerification(email);
      
      toast({
        title: "성공",
        description: "인증코드가 전송되었습니다.",
      });
      console.log('이메일 전송 성공');
      onEmailSent(email);
    } catch (error: any) {
      console.error('이메일 전송 오류:', error);
      toast({
        title: "오류",
        description: error.message || "이메일 전송 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          이메일 인증
        </h3>
        <p className="text-sm text-gray-600">
          회원가입을 위해 이메일 인증을 진행해주세요
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">이메일 주소</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        <Button
          onClick={handleSendEmail}
          disabled={!email || isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? '전송 중...' : '인증코드 전송'}
        </Button>
      </div>
    </div>
  );
};

export default EmailVerification;
