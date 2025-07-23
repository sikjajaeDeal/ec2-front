import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { chatService } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { Client } from '@stomp/stompjs';

// 환경변수에서 API URL 가져오기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://beanba.store';

interface ChatMessage {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
  senderName?: string;
}

interface ProductChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  roomPk: number;
  memberPk: number;
  chatWith: number;
  postPk: number;
  productTitle: string;
  sellerName: string;
  stompClient: Client | null;
}

const ProductChatWindow = ({ 
  isOpen, 
  onClose, 
  roomPk, 
  memberPk, 
  chatWith,
  postPk,
  productTitle, 
  sellerName,
  stompClient 
}: ProductChatWindowProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { memberInfo } = useAuth();

  // 시간 포맷팅 함수
  const formatMessageTime = (messageAt: string): string => {
    const date = new Date(messageAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // STOMP 메시지 처리 및 구독
  useEffect(() => {
    if (stompClient && stompClient.connected && memberInfo) {
      const handleMessage = (data: any) => {
        console.log('구독으로 받은 메시지:', data);
        
        if (data.from && data.message && data.messageAt && data.memberPkFrom !== undefined) {
          const newMessage: ChatMessage = {
            id: Date.now().toString(),
            text: data.message,
            time: formatMessageTime(data.messageAt),
            isOwn: data.memberPkFrom !== chatWith,
            senderName: data.from
          };
          
          setMessages(prev => [...prev, newMessage]);
          
          // 메시지 읽음 처리
          handleMarkAsRead();
        }
      };

      chatService.subscribeToRoom(stompClient, roomPk, handleMessage);
    }
  }, [stompClient, roomPk, chatWith, memberInfo]);

  // 채팅방 초기화
  useEffect(() => {
    if (isOpen && stompClient && stompClient.connected && roomPk && memberInfo) {
      initializeChatRoom();
    }
  }, [isOpen, stompClient, roomPk, memberInfo]);

  const initializeChatRoom = async () => {
    if (!stompClient || !memberInfo) return;

    try {
      setIsLoading(true);
      
      // 과거 메시지 기록 가져오기
      const messageHistory = await getMessageHistory();
      
      if (messageHistory && messageHistory.length > 0) {
        const historyMessages: ChatMessage[] = messageHistory.map(msg => ({
          id: msg.messagePk.toString(),
          text: msg.message,
          time: formatMessageTime(msg.messageAt),
          isOwn: msg.memberPkFrom !== chatWith,
          senderName: msg.memberNameFrom
        }));
        
        setMessages(historyMessages);
      }
      
    } catch (error) {
      console.error('채팅방 초기화 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 과거 메시지 기록 가져오기
  const getMessageHistory = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await fetch(`${API_BASE_URL}/api/chatting/getMessageList?roomPk=${roomPk}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('메시지 기록을 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      return data || [];
    } catch (error) {
      console.error('메시지 기록 가져오기 오류:', error);
      return [];
    }
  };

  // 메시지 읽음 처리
  const handleMarkAsRead = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const response = await fetch(`${API_BASE_URL}/messageRead/${roomPk}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        console.error('메시지 읽음 처리 실패');
      }
    } catch (error) {
      console.error('메시지 읽음 처리 오류:', error);
    }
  };

  // 메시지 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // STOMP를 통한 메시지 전송
  const handleSendMessage = () => {
    if (message.trim() && stompClient && stompClient.connected) {
      console.log('메시지 전송 시도:', { roomPk, postPk, message: message.trim() });
      console.log('STOMP 클라이언트 상태:', stompClient.connected);
      
      chatService.sendMessage(stompClient, roomPk, postPk, message.trim());
      console.log('메시지 전송 완료');
      
      setMessage('');
    } else {
      console.log('메시지 전송 실패 - 조건 체크:', {
        messageEmpty: !message.trim(),
        stompClientNull: !stompClient,
        stompClientConnected: stompClient?.connected
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Chat Window */}
      <div className={`fixed bottom-0 right-4 w-96 h-[500px] bg-white z-50 shadow-2xl rounded-t-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-green-50">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">{sellerName}</h3>
              <p className="text-xs text-gray-500 truncate">{productTitle}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-green-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="text-center text-gray-500 text-sm">
                대화 기록을 불러오는 중...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm">
                채팅을 시작해보세요!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.isOwn
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {!msg.isOwn && msg.senderName && (
                      <p className="text-xs text-gray-600 mb-1">{msg.senderName}</p>
                    )}
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${
                      msg.isOwn ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1"
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
                disabled={!message.trim() || !stompClient || !stompClient.connected || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductChatWindow;
