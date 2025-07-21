import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin, User, Package, Heart, Eye, Calendar, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import KakaoMap from '@/components/KakaoMap';
import Header from '@/components/Header';
import ProductChatWindow from '@/components/chat/ProductChatWindow';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProductDetail, likeProduct, unlikeProduct } from '@/lib/api';
import { getStateText, getStateColor } from '@/services/salePostService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { chatService } from '@/services/chatService';
import { Client } from '@stomp/stompjs';

const ProductDetail = () => {
  const { postPk } = useParams<{ postPk: string }>();
  const navigate = useNavigate();
  const [locationAddress, setLocationAddress] = useState<string | null>(null);
  const { isLoggedIn } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // 채팅 관련 상태
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [chatRoomPk, setChatRoomPk] = useState<number | null>(null);
  const [chatMemberPk, setChatMemberPk] = useState<number | null>(null);
  const [chatWith, setChatWith] = useState<number | null>(null);
  const [stompClient, setStompClient] = useState<Client | null>(null);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', postPk],
    queryFn: () => getProductDetail(postPk),
    enabled: !!postPk,
  });

  const likeMutation = useMutation({
    mutationFn: likeProduct,
    onSuccess: () => {
      setIsLiked(true);
      queryClient.invalidateQueries({ queryKey: ['product', postPk] });
      toast({
        title: '찜 완료',
        description: '상품이 찜 목록에 추가되었습니다.',
      });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: unlikeProduct,
    onSuccess: () => {
      setIsLiked(false);
      queryClient.invalidateQueries({ queryKey: ['product', postPk] });
      toast({
        title: '찜 해제',
        description: '상품이 찜 목록에서 제거되었습니다.',
      });
    },
  });

  const handleToggleLike = async () => {
    if (!isLoggedIn) {
      toast({
        title: '로그인 필요',
        description: '찜하기는 로그인 후 이용 가능합니다.',
        variant: 'destructive'
      });
      return;
    }

    if (!product) return;

    if (isLiked) {
      await unlikeMutation.mutateAsync(product.postPk);
    } else {
      await likeMutation.mutateAsync(product.postPk);
    }
  };

  const handleContactSeller = async () => {
    if (!isLoggedIn) {
      toast({
        title: '로그인 필요',
        description: '판매자와 채팅하려면 로그인이 필요합니다.',
        variant: 'destructive'
      });
      return;
    }

    if (!product) return;

    try {
      toast({
        title: '채팅방 연결 중',
        description: '잠시만 기다려주세요...',
      });

      // 1. 채팅방 생성
      const roomResponse = await chatService.openChattingRoom(product.postPk);
      setChatRoomPk(roomResponse.roomPk);
      setChatMemberPk(roomResponse.memberPk);
      setChatWith(product.sellerPk);

      // 2. STOMP 클라이언트 생성 및 연결
      const client = await chatService.createStompClient(roomResponse.memberPk);
      setStompClient(client);

      // 3. 채팅창 표시
      setShowChatWindow(true);

      toast({
        title: '채팅방 연결 완료',
        description: '판매자와 채팅을 시작할 수 있습니다.',
      });

    } catch (error) {
      console.error('채팅방 연결 실패:', error);
      toast({
        title: '채팅방 연결 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive'
      });
    }
  };

  const handleCloseChatWindow = () => {
    setShowChatWindow(false);
    if (stompClient) {
      stompClient.deactivate();
      setStompClient(null);
    }
  };

  const likeLoading = likeMutation.isPending || unlikeMutation.isPending;

  useEffect(() => {
    if (product) {
      setIsLiked(product.salePostLiked);
    }
  }, [product]);

  const validImageUrls = product?.imageUrls?.filter(url => url && url.trim() !== '') || [];

  const nextImage = () => {
    if (validImageUrls && currentImageIndex < validImageUrls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '곡물/두류': return 'bg-amber-100 text-amber-800';
      case '채소류': return 'bg-emerald-100 text-emerald-800';
      case '특용작물': return 'bg-violet-100 text-violet-800';
      case '과일류': return 'bg-red-100 text-red-800';
      case '축산물': return 'bg-orange-100 text-orange-800';
      case '수산물': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-200 text-lg mb-4">상품을 찾을 수 없습니다.</p>
          <Button onClick={() => navigate('/products')} className="bg-white text-green-700 hover:bg-green-50">
            상품 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-600 to-green-700">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {validImageUrls && validImageUrls.length > 0 ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={validImageUrls[currentImageIndex]}
                    alt={`${product.title} - ${currentImageIndex + 1}`}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                  
                  {validImageUrls.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        disabled={currentImageIndex === 0}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        disabled={currentImageIndex === validImageUrls.length - 1}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      
                      <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {validImageUrls.length}
                      </div>
                    </>
                  )}
                </div>

                {validImageUrls.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {validImageUrls.map((imageUrl, index) => (
                      <button
                        key={index}
                        onClick={() => selectImage(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex 
                            ? 'border-green-500 ring-2 ring-green-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt={`${product.title} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">이미지가 없습니다</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
              
              <div className="flex items-center space-x-4 mb-4 flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(product.categoryName)}`}>
                  {product.categoryName}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStateColor(product.state)} ring-2 ring-current ring-opacity-20`}>
                  {getStateText(product.state)}
                </span>
                <span className="text-2xl font-bold text-green-600">
                  {product.hopePrice.toLocaleString()}원
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>조회 {product.viewCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>좋아요 {product.likeCount.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>등록일: {formatDate(product.postAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>상태변경: {formatDate(product.stateAt)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <User className="h-5 w-5 mr-2" />
                판매자 정보
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">이름:</span> {product.sellerNickname}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Package className="h-5 w-5 mr-2" />
                상품 설명
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {product.content}
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
                disabled={product.state === 'C'}
                onClick={handleContactSeller}
              >
                {product.state === 'C' ? '판매완료' : '판매자에게 연락하기'}
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-green-300 text-green-700 hover:bg-green-50"
                size="lg"
                onClick={handleToggleLike}
                disabled={likeLoading}
              >
                <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                {isLiked ? '찜 해제' : '찜하기'}
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <MapPin className="h-6 w-6 mr-2" />
            판매 위치
          </h2>
          
          {locationAddress && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="font-semibold text-blue-800">📍 상세 주소:</span> 
              <span className="text-blue-700 ml-2">{locationAddress}</span>
            </div>
          )}
          
          <KakaoMap
            latitude={product.latitude}
            longitude={product.longitude}
            width="100%"
            height="400px"
            level={3}
            showAddress={false}
            onAddressChange={(address) => setLocationAddress(address)}
            className="shadow-md"
          />
        </div>
      </div>

      {showChatWindow && chatRoomPk && chatMemberPk && chatWith && (
        <ProductChatWindow
          isOpen={showChatWindow}
          onClose={handleCloseChatWindow}
          roomPk={chatRoomPk}
          memberPk={chatMemberPk}
          chatWith={chatWith}
          postPk={product.postPk}
          productTitle={product.title}
          sellerName={product.sellerNickname}
          stompClient={stompClient}
        />
      )}
    </div>
  );
};

export default ProductDetail;
