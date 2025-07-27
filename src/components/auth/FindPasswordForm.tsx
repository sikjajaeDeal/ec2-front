
import React, { useState } from 'react';
import { Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

interface FindPasswordFormProps {
  onBack: () => void;
  onCodeSent: (memberId: string, email: string) => void;
}

const FindPasswordForm = ({ onBack, onCodeSent }: FindPasswordFormProps) => {
  const [formData, setFormData] = useState({
    memberId: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await authService.findPassword(formData.memberId, formData.email);
      toast({
        title: "인증코드 전송",
        description: "입력하신 이메일로 6자리 인증코드를 전송했습니다.",
      });
      onCodeSent(formData.memberId, formData.email);
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "비밀번호 찾기에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center text-sm text-gray-600">
        가입 시 사용한 아이디와 이메일을 입력하시면<br />
        6자리 인증코드를 이메일로 발송해드립니다.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="memberId">아이디</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              id="memberId"
              name="memberId"
              type="text"
              placeholder="아이디를 입력하세요"
              value={formData.memberId}
              onChange={handleInputChange}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : '인증코드 전송'}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onBack}
          >
            로그인으로 돌아가기
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FindPasswordForm;
