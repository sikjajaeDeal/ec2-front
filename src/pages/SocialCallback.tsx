
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

// 환경변수에서 API URL 가져오기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://beanba.store';

const SocialCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateMemberInfo } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleSocialLogin = async () => {
      try {
        console.log('소셜 로그인 처리 시작');
        
        // URL 파라미터에서 accessToken 추출
        const accessToken = searchParams.get('accessToken');
        console.log('받은 accessToken:', accessToken);
        
        if (!accessToken) {
          throw new Error('액세스 토큰이 없습니다.');
        }
        
        // accessToken을 로컬스토리지에 저장
        authService.saveTokens(accessToken, '');
        console.log('accessToken 저장 완료');
        
        // 회원 정보 조회
        const response = await fetch(`${API_BASE_URL}/api/member/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('회원 정보 조회에 실패했습니다.');
        }

        const memberInfo = await response.json();
        console.log('회원 정보 조회 완료:', memberInfo);
        
        // 회원 정보를 로컬스토리지에 저장
        authService.saveMemberInfo(memberInfo);
        console.log('회원 정보 저장 완료');
        
        // AuthContext 업데이트
        await updateMemberInfo();
        console.log('AuthContext 업데이트 완료, 메인 페이지로 이동');
        
        // 메인 페이지로 리다이렉트
        navigate('/', { replace: true });
        
      } catch (error) {
        console.error('소셜 로그인 처리 중 오류:', error);
        setError('소셜 로그인에 실패했습니다. 다시 시도해주세요.');
        setIsLoading(false);
        
        // 5초 후 메인 페이지로 이동
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 5000);
      }
    };

    handleSocialLogin();
  }, [searchParams, navigate, updateMemberInfo]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-lg font-semibold mb-4">로그인 실패</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <div className="text-sm text-gray-500">잠시 후 메인 페이지로 이동합니다...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <div className="text-lg font-semibold text-gray-700 mb-2">로그인 처리 중...</div>
        <div className="text-sm text-gray-500">잠시만 기다려주세요.</div>
      </div>
    </div>
  );
};

export default SocialCallback;
