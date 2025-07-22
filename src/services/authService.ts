
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
  memberResponse: MemberResponse;
}

export const authService = {
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const response = await fetch('http://localhost:8080/api/auth/login', {
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
        const response = await fetch('http://localhost:8080/api/auth/logout', {
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

    this.clearStorage();
  },

  async sendEmailVerification(email: string): Promise<void> {
    const response = await fetch(`http://localhost:8080/api/auth/signup/email?email=${encodeURIComponent(email)}`, {
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

  saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
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
    const response = await fetch('http://localhost:8080/api/member/me', {
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
    const response = await fetch(`http://localhost:8080/api/member/findId?email=${email}`, {
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
    const response = await fetch(`http://localhost:8080/api/member/findPassword?memberId=${memberId}&email=${email}`, {
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
  }
};
