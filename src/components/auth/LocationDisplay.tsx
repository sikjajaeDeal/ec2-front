
import React, { useEffect, useState, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';

declare global {
  interface Window {
    kakao: any;
  }
}

interface LocationDisplayProps {
  isOpen: boolean;
}

const LocationDisplay = ({ isOpen }: LocationDisplayProps) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setLocation({ lat, lng });
            setLocationError(null);
            console.log('Location detected:', lat, lng);
            
            // Initialize Kakao Map
            initializeKakaoMap(lat, lng);
          },
          (error) => {
            console.error('Location error:', error);
            setLocationError('위치 정보를 가져올 수 없습니다. 브라우저 설정을 확인해주세요.');
          }
        );
      } else {
        setLocationError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      }
    }
  }, [isOpen]);

  const initializeKakaoMap = (lat: number, lng: number) => {
    const loadKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          const container = mapContainer.current;
          const options = {
            center: new window.kakao.maps.LatLng(lat, lng),
            level: 4
          };
          
          const kakaoMap = new window.kakao.maps.Map(container, options);
          setMap(kakaoMap);

          // Add user location marker
          const userMarkerPosition = new window.kakao.maps.LatLng(lat, lng);
          const userMarkerContent = `
            <div style="
              width: 20px;
              height: 20px;
              background-color: #EF4444;
              border: 4px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              position: relative;
            ">
              <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 8px;
                height: 8px;
                background-color: white;
                border-radius: 50%;
              "></div>
            </div>
          `;
          
          const userCustomMarker = new window.kakao.maps.CustomOverlay({
            map: kakaoMap,
            position: userMarkerPosition,
            content: userMarkerContent,
            yAnchor: 0.5,
            xAnchor: 0.5
          });
        });
      }
    };

    // Check if Kakao Maps script is already loaded
    if (window.kakao && window.kakao.maps) {
      loadKakaoMap();
    } else {
      // Load Kakao Maps script if not already loaded
      const script = document.createElement('script');
      script.async = true;
      // TODO: Move this API key to Spring Boot properties later
      // Current API key: ac095486b0af57d713dacf3da83fb961
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=ac095486b0af57d713dacf3da83fb961&autoload=false`;
      document.head.appendChild(script);

      script.onload = () => {
        loadKakaoMap();
      };

      script.onerror = () => {
        console.error('Failed to load Kakao Maps script');
      };
    }
  };

  return (
    <div className="flex-1 space-y-4">
      <div className="space-y-2">
        <Label className="text-lg font-semibold">내 위치</Label>
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
          <MapPin className="h-5 w-5 text-green-600" />
          {location ? (
            <span className="text-sm text-green-600">
              위치가 자동으로 감지되었습니다
            </span>
          ) : locationError ? (
            <span className="text-sm text-red-500">{locationError}</span>
          ) : (
            <span className="text-sm text-gray-500">위치 정보를 가져오는 중...</span>
          )}
        </div>
      </div>
      
      {/* Kakao Map Display - 100m radius */}
      <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden border-2 border-green-200 relative">
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Distance Label */}
        <div className="absolute bottom-4 right-4 bg-green-600/90 text-white px-3 py-1 rounded-full text-sm font-medium">
          반경 100m
        </div>
      </div>
    </div>
  );
};

export default LocationDisplay;
