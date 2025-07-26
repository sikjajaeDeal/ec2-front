
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { RefreshCw } from 'lucide-react';

interface EmailCodeVerificationProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

const EmailCodeVerification = ({ email, onVerified, onBack }: EmailCodeVerificationProps) => {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3분 = 180초
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast({
        title: "오류",
        description: "6자리 인증코드를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      await authService.verifyEmailCode(email, code);
      
      toast({
        title: "성공",
        description: "이메일 인증이 완료되었습니다.",
      });
      onVerified();
    } catch (error: any) {
      console.error('인증코드 확인 오류:', error);
      toast({
        title: "오류",
        description: error.message || "인증코드가 올바르지 않습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    
    try {
      await authService.sendEmailVerification(email);
      setTimeLeft(180);
      setCode('');
      toast({
        title: "성공",
        description: "인증코드를 다시 전송했습니다.",
      });
    } catch (error: any) {
      console.error('인증코드 재전송 오류:', error);
      toast({
        title: "오류",
        description: error.message || "인증코드 재전송 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          계정 인증
        </h3>
        <p className="text-sm text-gray-600">
          <span className="font-medium">{email}</span>로 발송한 6자리 인증코드를 입력해주세요.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-center block">이메일 인증 코드</Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        {timeLeft > 0 && (
          <div className="text-center text-sm text-gray-600">
            이메일 재전송 &gt; {formatTime(timeLeft)}
          </div>
        )}

        <Button
          onClick={handleVerifyCode}
          disabled={code.length !== 6 || isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          {isLoading ? '확인 중...' : '확인'}
        </Button>

        <div className="flex space-x-2">
          {timeLeft === 0 ? (
            <Button
              onClick={handleResendCode}
              disabled={isResending}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
              {isResending ? '재전송 중...' : '인증코드 재전송'}
            </Button>
          ) : (
            <Button
              onClick={onBack}
              variant="outline"
              className="flex-1"
            >
              이메일 변경
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailCodeVerification;
