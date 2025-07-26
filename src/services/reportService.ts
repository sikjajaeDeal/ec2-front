
import { authService } from './authService';

// 환경변수에서 API URL 가져오기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://beanba.store';

export interface ReportSubmitRequest {
  postPk: number;
  reporteePk: number;
  reportReason: string;
}

export const reportService = {
  // 신고 접수
  submitReport: async (reportData: ReportSubmitRequest): Promise<void> => {
    const token = authService.getAccessToken();
    
    if (!token) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/api/report/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || '신고 접수에 실패했습니다.');
    }
  },
};
