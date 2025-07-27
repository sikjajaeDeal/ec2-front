interface LoginRequest {
  memberId: string;
  password: string;
}

interface MemberResponse {
  memberId: string;
  email: string;
  nickname: string;
  provider: string;
  role: string;
  latitude: number;
  longitude: number;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  memberResponse: MemberResponse;
}

interface SocialLoginResponse {
  accessToken: string;
  refreshToken?: string;
  memberResponse: MemberResponse;
}

interface SignupRequest {
  memberId: string;
  nickname: string;
  email: string;
  password: string;
  latitude: string;
  longitude: string;
}

// 환경변수에서 URL 가져오기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://beanba.store';
const OAUTH2_BASE_URL = import.meta.env.VITE_OAUTH2_BASE_URL || 'https://beanba.store';

export const authService = {
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      throw new Error('로그인에 실패했습니다.');
    }

    return response.json();
  },

  async processSocialLogin(callbackUrl: string): Promise<SocialLoginResponse> {
    // 콜백 URL을 서버로 전달하여 소셜 로그인 처리
    const response = await fetch(callbackUrl, {
      method: 'GET',
      credentials: 'include', // 쿠키 포함하여 요청
    });

    if (!response.ok) {
      throw new Error('소셜 로그인 처리에 실패했습니다.');
    }

    // 응답이 JSON인지 텍스트인지 확인
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      // 텍스트 응답인 경우 JSON으로 파싱
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (error) {
        console.error('JSON 파싱 오류:', error);
        throw new Error('서버 응답 파싱에 실패했습니다.');
      }
    }
  },

  async logout(): Promise<void> {
    const accessToken = this.getAccessToken();
    
    if (accessToken) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          console.error('로그아웃 API 호출 실패');
        }
      } catch (error) {
        console.error('로그아웃 API 오류:', error);
      }
    }

    // access token과 refresh token 모두 삭제
    this.clearStorage();
  },

  async sendEmailVerification(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup/email?email=${encodeURIComponent(email)}`, {
      method: 'POST',
    });

    if (response.status === 409) {
      throw new Error('이미 가입된 이메일입니다.');
    }

    if (!response.ok) {
      throw new Error('이메일 전송에 실패했습니다.');
    }

    return;
  },

  async verifyEmailCode(email: string, code: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup/verify?email=${encodeURIComponent(email)}&code=${code}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes('잘못된 인증코드')) {
        throw new Error('인증코드가 올바르지 않습니다.');
      } else if (errorText.includes('만료된 인증코드')) {
        throw new Error('인증코드가 만료되었습니다. 새로운 코드를 요청해주세요.');
      }
      throw new Error('인증에 실패했습니다.');
    }

    return;
  },

  async signup(signupData: SignupRequest): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(signupData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes('이미 사용중인 아이디')) {
        throw new Error('이미 사용중인 아이디입니다.');
      } else if (errorText.includes('이미 가입된 이메일')) {
        throw new Error('이미 가입된 이메일입니다.');
      }
      throw new Error('회원가입에 실패했습니다.');
    }

    return;
  },

  saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  },

  saveMemberInfo(memberInfo: MemberResponse) {
    localStorage.setItem('memberInfo', JSON.stringify(memberInfo));
  },

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  getMemberInfo(): MemberResponse | null {
    const memberInfo = localStorage.getItem('memberInfo');
    return memberInfo ? JSON.parse(memberInfo) : null;
  },

  async getMemberInfoFromServer(): Promise<MemberResponse> {
    const response = await fetch(`${API_BASE_URL}/api/member/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('회원 정보 조회에 실패했습니다.');
    }

    return response.json();
  },

  clearStorage() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('memberInfo');
  },

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  },

  async findId(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/member/findId?email=${email}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.error) {
        throw new Error(errorData.error);
      }
      throw new Error('아이디 찾기에 실패했습니다.');
    }

    return;
  },

  async findPassword(memberId: string, email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/member/findPassword?memberId=${memberId}&email=${email}`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.error) {
        throw new Error(errorData.error);
      }
      throw new Error('비밀번호 찾기에 실패했습니다.');
    }

    return;
  },

  async verifyPasswordCode(memberId: string, email: string, code: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/member/findPassword/verify?memberId=${memberId}&email=${email}&code=${code}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes('잘못된 인증코드')) {
        throw new Error('인증코드가 올바르지 않습니다.');
      } else if (errorText.includes('만료된 인증코드')) {
        throw new Error('인증코드가 만료되었습니다. 새로운 코드를 요청해주세요.');
      }
      throw new Error('인증에 실패했습니다.');
    }

    return;
  },

  async changePassword(password: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/member/changePwd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      throw new Error('비밀번호 변경에 실패했습니다.');
    }

    return;
  },

  getKakaoLoginUrl(): string {
    return `${OAUTH2_BASE_URL}/oauth2/authorization/kakao`;
  },

  getGoogleLoginUrl(): string {
    return `${OAUTH2_BASE_URL}/oauth2/authorization/google`;
  }
};
