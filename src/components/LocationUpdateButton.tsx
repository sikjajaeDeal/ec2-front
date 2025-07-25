
import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

interface LocationUpdateButtonProps {
  onLocationUpdate?: (latitude: number, longitude: number) => void;
}

const LocationUpdateButton = ({ onLocationUpdate }: LocationUpdateButtonProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleUpdateLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: '위치 서비스 불가',
        description: '브라우저가 위치 서비스를 지원하지 않습니다.',
        variant: 'destructive'
      });
      return;
    }

    setIsUpdating(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;

      // 서버에 위치 정보 업데이트
      const response = await fetch('https://beanba.store/api/member/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getAccessToken()}`
        },
        body: JSON.stringify({
          latitude,
          longitude
        })
      });

      if (!response.ok) {
        throw new Error('위치 업데이트에 실패했습니다.');
      }

      // 콜백 함수 호출
      onLocationUpdate?.(latitude, longitude);

      toast({
        title: '위치 업데이트 완료',
        description: '현재 위치로 업데이트되었습니다.',
      });

    } catch (error) {
      console.error('위치 업데이트 오류:', error);
      toast({
        title: '위치 업데이트 실패',
        description: error instanceof Error ? error.message : '위치를 가져올 수 없습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Button
      onClick={handleUpdateLocation}
      disabled={isUpdating}
      className="bg-green-600 hover:bg-green-700 text-white"
      size="sm"
    >
      {isUpdating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          위치 업데이트 중...
        </>
      ) : (
        <>
          <MapPin className="h-4 w-4 mr-2" />
          현재 위치로 변경하기
        </>
      )}
    </Button>
  );
};

export default LocationUpdateButton;
