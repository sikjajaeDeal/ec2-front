
import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { chatService } from '@/services/chatService';
import ChatList from './ChatList';
import ProductChatWindow from './ProductChatWindow';
import { Client } from '@stomp/stompjs';

const ChatButton = () => {
  const [showChatList, setShowChatList] = useState(false);
  const [showChatWindow, setShowChatWindow] = useState(false);
  const [selectedRoomPk, setSelectedRoomPk] = useState<number | null>(null);
  const [selectedChatWith, setSelectedChatWith] = useState<number | null>(null);
  const [selectedNickname, setSelectedNickname] = useState<string>('');
  const [selectedPostPk, setSelectedPostPk] = useState<number | null>(null);
  const [selectedMemberPk, setSelectedMemberPk] = useState<number | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>('');
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const { isLoggedIn, memberInfo } = useAuth();
  const { toast } = useToast();

  // 읽지 않은 메시지 확인
  const checkUnreadMessages = async () => {
    if (!isLoggedIn) {
      setHasUnreadMessages(false);
      setUnreadCount(0);
      setShowNotification(false);
      return;
    }

    try {
      const response = await chatService.checkUnreadMessages();
      const hasUnread = response.readYn === 'N';
      setHasUnreadMessages(hasUnread);
      setUnreadCount(response.unreadCnt);
      
      if (hasUnread) {
        setShowNotification(true);
        // 1.5초 후 알림 문구 숨기기
        setTimeout(() => {
          setShowNotification(false);
        }, 1500);
      }
    } catch (error) {
      console.error('읽지 않은 메시지 확인 오류:', error);
      setHasUnreadMessages(false);
      setUnreadCount(0);
      setShowNotification(false);
    }
  };

  useEffect(() => {
    checkUnreadMessages();
    
    // 로그인 상태일 때만 주기적으로 확인 (30초마다)
    let interval: NodeJS.Timeout;
    if (isLoggedIn) {
      interval = setInterval(checkUnreadMessages, 30000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isLoggedIn]);

  const handleChatButtonClick = () => {
    if (!isLoggedIn) {
      toast({
        title: '로그인 필요',
        description: '채팅 기능을 사용하려면 로그인이 필요합니다.',
        variant: 'destructive'
      });
      return;
    }
    setShowChatList(true);
    // 채팅 리스트를 열 때 읽지 않은 메시지 상태 업데이트
    setHasUnreadMessages(false);
    setUnreadCount(0);
    setShowNotification(false);
  };

  const handleSelectChat = async (roomPk: number, chatWith: number, nickname: string, postPk: number, memberPk: number, title: string) => {
    if (!memberInfo) return;

    try {
      console.log('채팅방 선택:', { roomPk, chatWith, nickname, postPk, memberPk, title });
      
      setSelectedRoomPk(roomPk);
      setSelectedChatWith(chatWith);
      setSelectedNickname(nickname);
      setSelectedPostPk(postPk);
      setSelectedMemberPk(memberPk);
      setSelectedTitle(title);
      
      // STOMP 클라이언트 생성 및 연결
      const client = await chatService.createStompClient(memberPk);
      setStompClient(client);
      
      setShowChatList(false);
      setShowChatWindow(true);
      
    } catch (error) {
      console.error('채팅방 연결 실패:', error);
      toast({
        title: '채팅방 연결 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive'
      });
    }
  };

  const handleBackToList = () => {
    setShowChatWindow(false);
    setShowChatList(true);
    if (stompClient) {
      stompClient.deactivate();
      setStompClient(null);
    }
  };

  const handleCloseAll = async () => {
    setShowChatList(false);
    setShowChatWindow(false);
    setSelectedRoomPk(null);
    setSelectedChatWith(null);
    setSelectedNickname('');
    setSelectedPostPk(null);
    setSelectedMemberPk(null);
    setSelectedTitle('');
    if (stompClient) {
      stompClient.deactivate();
      setStompClient(null);
    }
    
    // 채팅방 닫을 때 읽지 않은 메시지 상태 업데이트
    await checkUnreadMessages();
  };

  return (
    <>
      {/* Unread Message Notification */}
      {showNotification && hasUnreadMessages && (
        <div className="fixed bottom-6 right-24 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm z-30 whitespace-nowrap">
          안 읽은 메시지가 있습니다.
        </div>
      )}

      {/* Chat Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <Button
          onClick={handleChatButtonClick}
          className="relative w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          {/* Unread Count Badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </Button>
      </div>

      {/* Chat List */}
      <ChatList
        isOpen={showChatList}
        onClose={handleCloseAll}
        onSelectChat={handleSelectChat}
      />

      {/* Chat Window */}
      {showChatWindow && selectedRoomPk && selectedChatWith && selectedPostPk && selectedMemberPk && (
        <ProductChatWindow
          isOpen={showChatWindow}
          onClose={handleCloseAll}
          roomPk={selectedRoomPk}
          memberPk={selectedMemberPk}
          chatWith={selectedChatWith}
          postPk={selectedPostPk}
          productTitle={selectedTitle}
          sellerName={selectedNickname}
          stompClient={stompClient}
        />
      )}
    </>
  );
};

export default ChatButton;
