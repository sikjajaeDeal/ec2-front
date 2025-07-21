
import React, { useState, useEffect } from 'react';
import { Mail, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

interface EmailVerificationProps {
  onVerified: (email: string) => void;
}

const EmailVerification = ({ onVerified }: EmailVerificationProps) => {
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

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
      // TODO: 백엔드 API 연동 - 이메일 인증 전송 API 호출
      await authService.sendEmailVerification(email);
      
      setIsEmailSent(true);
      setTimeLeft(180); // 3분 = 180초
      toast({
        title: "성공",
        description: "이메일 인증 메일을 전송했습니다.",
      });
      console.log('이메일 전송 성공');
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

  const handleResendEmail = () => {
    setTimeLeft(180);
    handleSendEmail();
  };

  const handleEmailChange = () => {
    setIsEmailSent(false);
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
              disabled={isEmailSent}
              required
            />
          </div>
        </div>

        {!isEmailSent ? (
          <Button
            onClick={handleSendEmail}
            disabled={!email || isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {isLoading ? '전송 중...' : '이메일 전송'}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-800">
                  {email}로 인증 이메일을 전송했습니다.
                </p>
              </div>
              <p className="text-xs text-green-600 mt-1">
                이메일을 확인하고 인증 링크를 클릭해주세요.
              </p>
            </div>

            {timeLeft > 0 ? (
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Timer className="h-4 w-4" />
                <span>재전송 가능 시간: {formatTime(timeLeft)}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  이메일 재전송
                </Button>
                <Button
                  onClick={handleEmailChange}
                  variant="ghost"
                  className="w-full text-sm"
                >
                  다른 이메일로 변경
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
