
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { reportService } from '@/services/reportService';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postPk: number;
  reporteePk: number;
  targetName?: string; // 신고 대상의 이름 (게시글 제목 또는 사용자명)
}

const ReportModal = ({ isOpen, onClose, postPk, reporteePk, targetName }: ReportModalProps) => {
  const [reportReason, setReportReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reportReason.trim()) {
      toast({
        title: '신고 사유 입력',
        description: '신고 사유를 입력해주세요.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await reportService.submitReport({
        postPk,
        reporteePk,
        reportReason: reportReason.trim()
      });

      toast({
        title: '신고 완료',
        description: '신고가 정상적으로 접수되었습니다.',
      });

      handleClose();
    } catch (error) {
      console.error('신고 접수 오류:', error);
      toast({
        title: '신고 실패',
        description: error instanceof Error ? error.message : '신고 접수에 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReportReason('');
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>신고하기</DialogTitle>
          <DialogDescription>
            {targetName ? `"${targetName}"를 신고하는 이유를 작성해주세요.` : '신고하는 이유를 작성해주세요.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="reportReason" className="text-sm font-medium">
              신고 사유
            </label>
            <Textarea
              id="reportReason"
              placeholder="신고 사유를 자세히 작성해주세요..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="min-h-[120px]"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !reportReason.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSubmitting ? '신고 중...' : '신고하기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
