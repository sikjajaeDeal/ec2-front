
import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AuthFormProps {
  isLogin: boolean;
  onSubmit: (formData: any) => void;
  prefilledEmail?: string;
  onClose: () => void;
  onFindId?: () => void;
  onFindPassword?: () => void;
}

const AuthForm = ({ isLogin, onSubmit, prefilledEmail = '', onClose, onFindId, onFindPassword }: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    nickname: '',
    password: '',
    confirmPassword: ''
  });
  
  const { login } = useAuth();
  const { toast } = useToast();

  // 이메일 인증 후 이메일 미리 채우기 (회원가입에서만)
  useEffect(() => {
    if (prefilledEmail && !isLogin) {
      setFormData(prev => ({
        ...prev,
        email: prefilledEmail
      }));
    }
  }, [prefilledEmail, isLogin]);

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
      if (isLogin) {
        // TODO: 백엔드 API 연동 - 로그인 처리
        await login(formData.userId, formData.password);
        toast({
          title: "로그인 성공",
          description: "환영합니다!",
        });
        onClose();
      } else {
        // 회원가입 처리
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "오류",
            description: "비밀번호가 일치하지 않습니다.",
            variant: "destructive"
          });
          return;
        }
        
        // TODO: 백엔드 API 연동 - 회원가입 API 호출
        console.log('Signup data:', formData);
        onSubmit(formData);
      }
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "요청 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="userId">아이디</Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            id="userId"
            name="userId"
            type="text"
            placeholder="아이디를 입력하세요"
            value={formData.userId}
            onChange={handleInputChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      {/* 이메일 입력은 회원가입에서만 표시 */}
      {!isLogin && (
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
              disabled={!!prefilledEmail}
              required
            />
          </div>
        </div>
      )}

      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="nickname">닉네임</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              id="nickname"
              name="nickname"
              type="text"
              placeholder="닉네임을 입력하세요"
              value={formData.nickname}
              onChange={handleInputChange}
              className="pl-10"
              required
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">비밀번호</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호를 입력하세요"
            value={formData.password}
            onChange={handleInputChange}
            className="pl-10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">비밀번호 확인</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        disabled={isLoading}
      >
        {isLoading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
      </Button>

      {isLogin && (
        <div className="space-y-2 text-center">
          <div className="flex justify-center space-x-4 text-sm">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={onFindId}
            >
              아이디 찾기
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={onFindPassword}
            >
              비밀번호 찾기
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default AuthForm;
