
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
      await authService.logout();
    } catch (error) {
      console.error('로그아웃 중 오류:', error);
    } finally {
      setIsLoggedIn(false);
      setMemberInfo(null);
    }
  };

  const updateMemberInfo = async () => {
    try {
      // 로컬 스토리지에서 현재 저장된 정보를 먼저 확인
      const storedMemberInfo = authService.getMemberInfo();
      const storedToken = authService.getAccessToken();
      
      if (storedMemberInfo && storedToken) {
        setIsLoggedIn(true);
        setMemberInfo(storedMemberInfo);
        return;
      }
      
      // 서버에서 최신 정보를 가져오는 경우
      const updatedMemberInfo = await authService.getMemberInfoFromServer();
      authService.saveMemberInfo(updatedMemberInfo);
      setMemberInfo(updatedMemberInfo);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('회원 정보 업데이트 오류:', error);
      // 오류 발생시 로컬 스토리지 정보라도 확인
      const storedMemberInfo = authService.getMemberInfo();
      const storedToken = authService.getAccessToken();
      
      if (storedMemberInfo && storedToken) {
        setIsLoggedIn(true);
        setMemberInfo(storedMemberInfo);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, memberInfo, user: memberInfo, login, logout, updateMemberInfo }}>
      {children}
    </AuthContext.Provider>
  );
};
