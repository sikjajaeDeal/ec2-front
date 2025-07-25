
import React from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportButtonProps {
  postId: number;
  className?: string;
}

const ReportButton = ({ postId, className = '' }: ReportButtonProps) => {
  const handleReport = () => {
    // 나중에 신고 API가 추가되면 여기에 구현
    console.log('신고하기 클릭:', postId);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleReport}
      className={`text-gray-500 hover:text-red-500 p-1 h-auto ${className}`}
      title="신고하기"
    >
      <Flag className="h-4 w-4" />
    </Button>
  );
};

export default ReportButton;
