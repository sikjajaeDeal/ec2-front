
import React, { useState, useEffect } from 'react';
import { X, MessageCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { chatService } from '@/services/chatService';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@stomp/stompjs';

interface ChattingRoomListItem {
  chattingRoomPk: number;
  message: string;
  messageAt: string;
  chatWith: number;
  chatWithNickname: string;
  readYn: string;
  postPk: number;
  memberPk: number;
}

interface PostChatRoomListProps {
  isOpen: boolean;
  onClose: () => void;
  postPk: number;
  onSelectChatRoom: (roomPk: number, chatWith: number, postPk: number, memberPk: number, chatWithNickname: string) => void;
}

const PostChatRoomList = ({ isOpen, onClose, postPk, onSelectChatRoom }: PostChatRoomListProps) => {
  const [chatRooms, setChatRooms] = useState<ChattingRoomListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && postPk) {
      fetchChatRooms();
    }
  }, [isOpen, postPk]);

  const fetchChatRooms = async () => {
    try {
      setIsLoading(true);
      const rooms = await chatService.getChattingRoomListByPostPk(postPk);
      setChatRooms(rooms);
    } catch (error) {
      toast({
        title: '오류',
        description: error instanceof Error ? error.message : '채팅방 목록을 가져오는데 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatRoomClick = (room: ChattingRoomListItem) => {
    onSelectChatRoom(
      room.chattingRoomPk,
      room.chatWith,
      room.postPk,
      room.memberPk,
      room.chatWithNickname
    );
  };

  const formatMessageTime = (messageAt: string): string => {
    const date = new Date(messageAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
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
      
      {/* Chat Room List Panel */}
      <div className={`fixed bottom-0 right-4 w-96 h-[500px] bg-white z-50 shadow-2xl rounded-t-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-green-50">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">상품 채팅방 목록</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-green-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Chat Room List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">채팅방 목록을 불러오는 중...</div>
              </div>
            ) : chatRooms.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>아직 채팅방이 없습니다.</p>
                </div>
              </div>
            ) : (
              chatRooms.map((room) => (
                <div
                  key={room.chattingRoomPk}
                  onClick={() => handleChatRoomClick(room)}
                  className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {room.chatWithNickname}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatMessageTime(room.messageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate">{room.message}</p>
                        {room.readYn === 'N' && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full min-w-[8px] h-5 flex items-center justify-center">
                            
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PostChatRoomList;
