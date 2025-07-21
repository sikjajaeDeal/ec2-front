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
    // TODO: 백엔드 API 연동 - 로그인 API 호출
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

    return response.json();
  },

  async logout(): Promise<void> {
    const accessToken = this.getAccessToken();
    
    if (accessToken) {
      try {
        // TODO: 백엔드 API 연동 - 로그아웃 API 호출
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

    // TODO: 로컬 스토리지에서 토큰과 사용자 정보 제거 (매우 중요!)
    this.clearStorage();
  },

  async sendEmailVerification(email: string): Promise<void> {
    // TODO: 백엔드 API 연동 - 이메일 인증 전송 API 호출 (request param으로 변경)
    const response = await fetch(`http://localhost:8080/api/auth/signup/email?email=${encodeURIComponent(email)}`, {
      method: 'POST',
    });

    if (response.status === 409) {
      // 이미 가입된 이메일
      throw new Error('이미 가입된 이메일입니다.');
    }

    if (!response.ok) {
      throw new Error('이메일 전송에 실패했습니다.');
    }

    // 성공 응답 처리 (raw body: "이메일 인증 메일을 전송했습니다.")
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
    // TODO: 백엔드 API 연동 - 회원 정보 조회 API 호출
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
    // TODO: 로컬스토리지에서 모든 인증 관련 데이터 삭제
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

    // Success response is raw text: "가입시 이메일로 아이디 발송."
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

    // Success response is raw text: "가입시 이메일로 아이디 발송."
    return;
  }
};
