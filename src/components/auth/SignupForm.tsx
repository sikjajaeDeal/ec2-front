
import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, MapPin, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

interface SignupFormProps {
  email: string;
  onSuccess: () => void;
}

const SignupForm = ({ email, onSuccess }: SignupFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(true);
  const [formData, setFormData] = useState({
    memberId: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    latitude: '',
    longitude: ''
  });
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setIsLocationLoading(true);
    setLocationError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          setIsLocationLoading(false);
          console.log('Location detected:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error('Location error:', error);
          setLocationError('위치 정보를 가져올 수 없습니다.');
          setIsLocationLoading(false);
        }
      );
    } else {
      setLocationError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      setIsLocationLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "오류",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      toast({
        title: "오류",
        description: "위치 정보가 필요합니다. 위치 새로고침을 눌러주세요.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const signupData = {
        memberId: formData.memberId,
        nickname: formData.nickname,
        email: email,
        password: formData.password,
        latitude: formData.latitude,
        longitude: formData.longitude
      };
      
      await authService.signup(signupData);
      
      toast({
        title: "회원가입 성공",
        description: "회원가입이 완료되었습니다. 환영합니다!",
      });
      
      onSuccess();
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      toast({
        title: "오류",
        description: error.message || "회원가입 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          value={email}
          className="bg-gray-100"
          disabled
        />
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">비밀번호 확인</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호를 다시 입력하세요"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>위치 정보</Label>
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
          <MapPin className="h-5 w-5 text-green-600" />
          {isLocationLoading ? (
            <span className="text-sm text-gray-500">위치 정보를 가져오는 중...</span>
          ) : locationError ? (
            <span className="text-sm text-red-500">{locationError}</span>
          ) : (
            <span className="text-sm text-green-600">현재 위치가 감지되었습니다</span>
          )}
          <Button
            type="button"
            onClick={getCurrentLocation}
            variant="ghost"
            size="sm"
            disabled={isLocationLoading}
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLocationLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white"
        disabled={isLoading || isLocationLoading}
      >
        {isLoading ? '가입 중...' : '회원가입'}
      </Button>
    </form>
  );
};

export default SignupForm;
