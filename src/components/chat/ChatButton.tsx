
import React, { useState } from 'react';
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
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const { isLoggedIn, memberInfo } = useAuth();
  const { toast } = useToast();

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
  };

  const handleSelectChat = async (roomPk: number, chatWith: number, nickname: string, postPk: number, memberPk: number) => {
    if (!memberInfo) return;

    try {
      console.log('채팅방 선택:', { roomPk, chatWith, nickname, postPk, memberPk });
      
      setSelectedRoomPk(roomPk);
      setSelectedChatWith(chatWith);
      setSelectedNickname(nickname);
      setSelectedPostPk(postPk);
      setSelectedMemberPk(memberPk);
      
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

  const handleCloseAll = () => {
    setShowChatList(false);
    setShowChatWindow(false);
    setSelectedRoomPk(null);
    setSelectedChatWith(null);
    setSelectedNickname('');
    setSelectedPostPk(null);
    setSelectedMemberPk(null);
    if (stompClient) {
      stompClient.deactivate();
      setStompClient(null);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={handleChatButtonClick}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg z-30"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>

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
          productTitle=""
          sellerName={selectedNickname}
          stompClient={stompClient}
        />
      )}
    </>
  );
};

export default ChatButton;
