
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Chrome, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import KakaoMap from '@/components/KakaoMap';

const ProfileSettings = () => {
  const { memberInfo, updateMemberInfo } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    nickname: memberInfo?.nickname || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    latitude: memberInfo?.latitude || null,
    longitude: memberInfo?.longitude || null
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentAddress, setCurrentAddress] = useState<string>('');

  if (!memberInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <p className="text-center text-gray-500">로그인이 필요합니다.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationChange = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude
          }));
          setIsGettingLocation(false);
          toast({
            title: "위치 정보 업데이트",
            description: "현재 위치로 업데이트되었습니다. 저장 버튼을 눌러 변경사항을 저장하세요.",
          });
        },
        (error) => {
          console.error('위치 정보 오류:', error);
          setIsGettingLocation(false);
          toast({
            title: "오류",
            description: "위치 정보를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.",
            variant: "destructive"
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setIsGettingLocation(false);
      toast({
        title: "오류",
        description: "이 브라우저는 위치 서비스를 지원하지 않습니다.",
        variant: "destructive"
      });
    }
  };

  const handleAddressChange = (address: string) => {
    setCurrentAddress(address);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'G':
        return <Chrome className="h-4 w-4" />;
      case 'K':
        return <div className="h-4 w-4 bg-yellow-400 rounded-sm flex items-center justify-center text-xs font-bold">K</div>;
      default:
        return null;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'G':
        return '구글';
      case 'K':
        return '카카오';
      case 'R':
        return '일반 회원가입';
      default:
        return '일반 회원가입';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "오류",
        description: "새 비밀번호가 일치하지 않습니다.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // 변경된 필드만 포함하는 요청 바디 구성
      const updateData: any = {};
      
      if (formData.nickname !== memberInfo.nickname) {
        updateData.nickname = formData.nickname;
      }
      
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          toast({
            title: "오류",
            description: "현재 비밀번호를 입력해주세요.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
        updateData.password = formData.newPassword;
      }

      // 위치 정보 변경 확인
      if (formData.latitude !== memberInfo.latitude || formData.longitude !== memberInfo.longitude) {
        updateData.latitude = formData.latitude;
        updateData.longitude = formData.longitude;
      }

      if (Object.keys(updateData).length === 0) {
        toast({
          title: "알림",
          description: "변경된 정보가 없습니다.",
        });
        setIsLoading(false);
        return;
      }

      // TODO: 백엔드 API 연동 - 개인정보 수정 API 호출
      const response = await fetch('http://localhost:8080/api/member/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        // TODO: 백엔드 API 연동 - 개인정보 수정 후 최신 정보 조회
        await updateMemberInfo();
        
        toast({
          title: "성공",
          description: "프로필이 업데이트되었습니다.",
        });
        
        // 비밀번호 필드 초기화
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        throw new Error('프로필 업데이트 실패');
      }
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      toast({
        title: "오류",
        description: "프로필 업데이트 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              프로필로
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">개인정보 수정</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="memberId">아이디</Label>
                <Input
                  id="memberId"
                  value={memberInfo.memberId}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500">아이디는 변경할 수 없습니다.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  value={memberInfo.email}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-sm text-gray-500">이메일은 변경할 수 없습니다.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임</Label>
                <Input
                  id="nickname"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  placeholder="닉네임을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <Label>가입 방식</Label>
                <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  {getProviderIcon(memberInfo.provider)}
                  <span className="text-sm">{getProviderName(memberInfo.provider)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 위치 정보 카드 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>위치 정보</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.latitude && formData.longitude ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    {formData.latitude !== memberInfo.latitude || formData.longitude !== memberInfo.longitude 
                      ? '변경된 위치 (저장하지 않음)' 
                      : '현재 설정된 위치'
                    }
                  </p>
                  <KakaoMap 
                    latitude={formData.latitude} 
                    longitude={formData.longitude}
                    height="250px"
                    level={4}
                    className="shadow-sm"
                    showAddress={true}
                    onAddressChange={handleAddressChange}
                  />
                  {currentAddress && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-medium text-blue-800">📍 {currentAddress}</p>
                    </div>
                  )}
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleLocationChange}
                    disabled={isGettingLocation}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    {isGettingLocation ? '위치 가져오는 중...' : '현재 위치로 변경하기'}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">위치 정보가 설정되지 않았습니다.</p>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleLocationChange}
                    disabled={isGettingLocation}
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    {isGettingLocation ? '위치 가져오는 중...' : '현재 위치로 설정하기'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {memberInfo.provider === 'R' && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>비밀번호 변경</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">현재 비밀번호</Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="현재 비밀번호를 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">새 비밀번호</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="새 비밀번호를 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="새 비밀번호를 다시 입력하세요"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
            type="submit" 
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? '저장 중...' : '변경사항 저장'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
