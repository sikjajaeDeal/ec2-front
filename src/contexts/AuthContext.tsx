
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';

interface MemberInfo {
  memberId: string;
  email: string;
  nickname: string;
  provider: string;
  role: string;
  latitude: number;
  longitude: number;
}

interface AuthContextType {
  isLoggedIn: boolean;
  memberInfo: MemberInfo | null;
  user: MemberInfo | null; // user 별칭 추가
  login: (memberId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateMemberInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);

  console.log('AuthProvider initialized');

  useEffect(() => {
    const loggedIn = authService.isLoggedIn();
    const member = authService.getMemberInfo();
    
    setIsLoggedIn(loggedIn);
    setMemberInfo(member);
  }, []);

  const login = async (memberId: string, password: string) => {
    try {
      // TODO: 백엔드 API 연동 - 로그인 처리
      const response = await authService.login({ memberId, password });
      
      authService.saveTokens(response.accessToken, response.refreshToken);
      authService.saveMemberInfo(response.memberResponse);
      
      setIsLoggedIn(true);
      setMemberInfo(response.memberResponse);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // TODO: 백엔드 API 연동 - 로그아웃 처리
      await authService.logout();
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    } finally {
      // TODO: 로그아웃 후 상태 초기화 (매우 중요!)
      setIsLoggedIn(false);
      setMemberInfo(null);
    }
  };

  const updateMemberInfo = async () => {
    try {
      // TODO: 백엔드 API 연동 - 최신 회원 정보 조회
      const updatedMemberInfo = await authService.getMemberInfoFromServer();
      authService.saveMemberInfo(updatedMemberInfo);
      setMemberInfo(updatedMemberInfo);
    } catch (error) {
      console.error('회원 정보 업데이트 오류:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, memberInfo, user: memberInfo, login, logout, updateMemberInfo }}>
      {children}
    </AuthContext.Provider>
  );
};
