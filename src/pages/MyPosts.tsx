import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { salePostService, SalePost, MyPostsResponse, getStateText, getStateColor } from '@/services/salePostService';
import { chatService } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PostChatRoomList from '@/components/chat/PostChatRoomList';
import ProductChatWindow from '@/components/chat/ProductChatWindow';
import { Client } from '@stomp/stompjs';

const MyPosts = () => {
  const [postsData, setPostsData] = useState<MyPostsResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<Set<number>>(new Set());
  
  // 채팅 관련 상태
  const [showChatRoomList, setShowChatRoomList] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [selectedPostPk, setSelectedPostPk] = useState<number | null>(null);
  const [selectedRoomPk, setSelectedRoomPk] = useState<number | null>(null);
  const [selectedChatWith, setSelectedChatWith] = useState<number | null>(null);
  const [selectedMemberPk, setSelectedMemberPk] = useState<number | null>(null);
  const [selectedNickname, setSelectedNickname] = useState<string>('');
  const [stompClient, setStompClient] = useState<Client | null>(null);
  
  const { toast } = useToast();
  const { memberInfo } = useAuth();

  useEffect(() => {
    if (!memberInfo) {
      toast({
        title: "오류",
        description: "로그인이 필요합니다.",
        variant: "destructive"
      });
      return;
    }

    fetchMyPosts(currentPage);
  }, [memberInfo, currentPage]);

  const fetchMyPosts = async (page: number) => {
    try {
      setLoading(true);
      const data = await salePostService.getMyPosts(page);
      setPostsData(data);
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "내 게시글을 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postPk: number) => {
    try {
      await salePostService.deleteSalePost(postPk);
      toast({
        title: "성공",
        description: "게시글이 삭제되었습니다.",
      });
      fetchMyPosts(currentPage);
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "게시글 삭제에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (postPk: number, newStatus: string) => {
    if (updatingStatus.has(postPk)) return;

    setUpdatingStatus(prev => new Set(prev).add(postPk));
    
    try {
      await salePostService.updateSalePostStatus(postPk, newStatus);
      toast({
        title: "성공",
        description: `상태가 "${getStateText(newStatus)}"로 변경되었습니다.`,
      });
      fetchMyPosts(currentPage);
    } catch (error) {
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "상태 변경에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(postPk);
        return newSet;
      });
    }
  };

  const handleChatButtonClick = (postPk: number) => {
    setSelectedPostPk(postPk);
    setShowChatRoomList(true);
  };

  const handleSelectChatRoom = async (roomPk: number, chatWith: number, postPk: number, memberPk: number, chatWithNickname: string) => {
    try {
      setSelectedRoomPk(roomPk);
      setSelectedChatWith(chatWith);
      setSelectedPostPk(postPk);
      setSelectedMemberPk(memberPk);
      setSelectedNickname(chatWithNickname);
      
      // STOMP 클라이언트 생성 및 연결
      const client = await chatService.createStompClient(memberPk);
      setStompClient(client);
      
      setShowChatRoomList(false);
      setShowChatWindow(true);
    } catch (error) {
      toast({
        title: '채팅방 연결 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive'
      });
    }
  };

  const handleCloseChatRoomList = () => {
    setShowChatRoomList(false);
    setSelectedPostPk(null);
  };

  const handleCloseChatWindow = () => {
    setShowChatWindow(false);
    setSelectedRoomPk(null);
    setSelectedChatWith(null);
    setSelectedPostPk(null);
    setSelectedMemberPk(null);
    setSelectedNickname('');
    if (stompClient) {
      stompClient.deactivate();
      setStompClient(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const renderPagination = () => {
    if (!postsData || postsData.totalPage <= 1) return null;

    const pages = [];
    for (let i = 0; i < postsData.totalPage; i++) {
      pages.push(i);
    }

    return (
      <Pagination className="mt-8">
        <PaginationContent>
          {currentPage > 0 && (
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
              />
            </PaginationItem>
          )}
          
          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(page);
                }}
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          {!postsData.last && (
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">내 게시글 관리</h1>
        </div>
        <div className="text-center py-8">로딩 중...</div>
      </div>
    );
  }

  const posts = postsData?.content || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-300 to-green-200">
      <div className="container mx-auto p-4">
        <div className="flex items-center mb-6">
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="mr-4">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">내 게시글 관리</h1>
        </div>

        {/* 게시글 통계 정보 */}
        {postsData && (
          <div className="mb-4 p-3 bg-white rounded-lg shadow">
            <span className="text-sm text-gray-600">
              전체 {postsData.totalElements}개의 게시글 (페이지 {currentPage + 1}/{postsData.totalPage})
            </span>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            아직 등록한 게시글이 없습니다.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Card key={post.postPk} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="relative">
                      <Link to={`/product/${post.postPk}`}>
                        <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                          {post.thumbnailUrl ? (
                            <img
                              src={post.thumbnailUrl}
                              alt={post.title}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              이미지 없음
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      {/* 삭제 및 수정 버튼 */}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "알림",
                              description: "수정 기능은 곧 구현될 예정입니다.",
                            });
                          }}
                        >
                          수정
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeletePost(post.postPk)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* 현재 상태 표시 */}
                      <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(post.state)}`}>
                          {getStateText(post.state)}
                        </span>
                      </div>
                    </div>

                    {/* 판매 상태 선택 */}
                    <div className="mb-3">
                      <Select 
                        value={post.state}
                        onValueChange={(value) => handleStatusChange(post.postPk, value)}
                        disabled={updatingStatus.has(post.postPk)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="판매 상태 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="S">판매중</SelectItem>
                          <SelectItem value="H">판매보류</SelectItem>
                          <SelectItem value="R">예약중</SelectItem>
                          <SelectItem 
                            value="C" 
                            className="bg-orange-100 text-orange-800 font-semibold hover:bg-orange-200 focus:bg-orange-200 data-[state=checked]:bg-orange-200"
                          >
                            판매완료
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {updatingStatus.has(post.postPk) && (
                        <p className="text-xs text-gray-500 mt-1">상태 변경 중...</p>
                      )}
                    </div>

                    {/* 채팅하기 버튼 */}
                    <div className="mb-3">
                      <Button
                        onClick={() => handleChatButtonClick(post.postPk)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        size="sm"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        채팅하기
                      </Button>
                    </div>

                    <Link to={`/product/${post.postPk}`}>
                      <div className="space-y-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {post.categoryName}
                        </span>
                        <h3 className="font-semibold text-lg truncate hover:text-green-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-600">
                            {formatPrice(post.hopePrice)}원
                          </span>
                          <span className="text-xs text-gray-500">
                            조회 {post.viewCount} · 좋아요 {post.likeCount}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>{post.sellerNickname}</span>
                          <span>{formatDate(post.postAt)}</span>
                        </div>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {renderPagination()}
          </>
        )}
      </div>

      {/* 채팅방 목록 모달 */}
      {selectedPostPk && (
        <PostChatRoomList
          isOpen={showChatRoomList}
          onClose={handleCloseChatRoomList}
          postPk={selectedPostPk}
          onSelectChatRoom={handleSelectChatRoom}
        />
      )}

      {/* 채팅창 */}
      {showChatWindow && selectedRoomPk && selectedChatWith && selectedPostPk && selectedMemberPk && (
        <ProductChatWindow
          isOpen={showChatWindow}
          onClose={handleCloseChatWindow}
          roomPk={selectedRoomPk}
          memberPk={selectedMemberPk}
          chatWith={selectedChatWith}
          postPk={selectedPostPk}
          productTitle=""
          sellerName={selectedNickname}
          stompClient={stompClient}
        />
      )}
    </div>
  );
};

export default MyPosts;
