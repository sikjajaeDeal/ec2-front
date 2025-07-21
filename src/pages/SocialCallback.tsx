
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

const SocialCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateMemberInfo } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleSocialLogin = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        
        if (!code) {
          throw new Error('인증 코드가 없습니다.');
        }

        // 현재 URL의 전체 경로를 서버로 전달하여 토큰 교환
        const currentUrl = window.location.href;
        const response = await authService.processSocialLogin(currentUrl);
        
        // 로그인 정보 저장
        authService.saveTokens(response.accessToken, ''); // refresh token은 쿠키로 관리
        authService.saveMemberInfo(response.memberResponse);
        
        // AuthContext 업데이트
        await updateMemberInfo();
        
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
