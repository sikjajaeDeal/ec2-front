
import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReportModal from '../ReportModal';

interface ChatReportButtonProps {
  postPk: number;
  reporteePk: number; // chatWith 값
  targetName?: string; // chatWithNickname
  className?: string;
}

const ChatReportButton = ({ postPk, reporteePk, targetName, className = '' }: ChatReportButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReport}
        className={`text-gray-500 hover:text-red-500 ${className}`}
        title="신고하기"
      >
        <Flag className="h-4 w-4" />
      </Button>

      <ReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        postPk={postPk}
        reporteePk={reporteePk}
        targetName={targetName}
      />
    </>
  );
};

export default ChatReportButton;
