
declare global {
  interface Window {
    kakao: any;
  }
}

export const convertCoordsToAddress = (latitude: number, longitude: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!window.kakao || !window.kakao.maps) {
      reject(new Error('카카오맵이 로드되지 않았습니다.'));
      return;
    }

    window.kakao.maps.load(() => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      
      geocoder.coord2Address(longitude, latitude, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          // 도로명 주소가 있으면 도로명 주소를, 없으면 지번 주소를 반환
          const addressName = result[0].road_address 
            ? result[0].road_address.address_name 
            : result[0].address.address_name;
          
          // 간단한 주소로 변환 (시/구 정도만)
          const parts = addressName.split(' ');
          const shortAddress = parts.length >= 2 ? `${parts[0]} ${parts[1]}` : addressName;
          
          resolve(shortAddress);
        } else {
          reject(new Error('주소 변환에 실패했습니다.'));
        }
      });
    });
  });
};

export const loadKakaoMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${import.meta.env.VITE_KAKAOMAP_KEY}&libraries=services&autoload=false`;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('카카오맵 스크립트 로드 실패'));
    
    document.head.appendChild(script);
  });
};
