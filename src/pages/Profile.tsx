
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, User, Settings, LogOut, Chrome, Heart, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import KakaoMap from '@/components/KakaoMap';

const Profile = () => {
  const { memberInfo, logout } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('로그아웃 오류:', error);
      navigate('/');
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              홈으로
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">내 프로필</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-green-100 text-green-700 text-xl">
                  {memberInfo.nickname.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{memberInfo.nickname}</h2>
                <p className="text-gray-500">@{memberInfo.memberId}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <span>{memberInfo.email}</span>
            </div>
            
            {memberInfo.latitude && memberInfo.longitude ? (
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span>내 위치</span>
                </div>
                <div className="ml-8">
                  <KakaoMap 
                    latitude={memberInfo.latitude} 
                    longitude={memberInfo.longitude}
                    height="250px"
                    level={4}
                    className="shadow-sm"
                    showAddress={true}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-gray-500">위치 정보가 설정되지 않았습니다.</span>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">가입방식:</span>
                {getProviderIcon(memberInfo.provider)}
                <span className="text-sm text-gray-500">{getProviderName(memberInfo.provider)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Link to="/profile/settings">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-3" />
              개인정보 수정
            </Button>
          </Link>
          
          <Link to="/liked-products">
            <Button variant="outline" className="w-full justify-start">
              <Heart className="h-4 w-4 mr-3" />
              찜한 상품 보기
            </Button>
          </Link>
          
          <Link to="/my-posts">
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-3" />
              내 게시글 관리
            </Button>
          </Link>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            로그아웃
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => {
              alert('탈퇴 기능은 곧 구현될 예정입니다.');
            }}
          >
            <User className="h-4 w-4 mr-3" />
            탈퇴하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
