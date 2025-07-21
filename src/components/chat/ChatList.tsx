
import React, { useEffect, useState } from 'react';
import { X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { chatService } from '@/services/chatService';
import { useAuth } from '@/contexts/AuthContext';

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

interface ChatListProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChat: (roomPk: number, chatWith: number, nickname: string, postPk: number, memberPk: number) => void;
}

const ChatList = ({ isOpen, onClose, onSelectChat }: ChatListProps) => {
  const [chatRooms, setChatRooms] = useState<ChattingRoomListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isOpen && isLoggedIn) {
      fetchChatRooms();
    }
  }, [isOpen, isLoggedIn]);

  const fetchChatRooms = async () => {
    try {
      setIsLoading(true);
      const rooms = await chatService.getAllChattingRoomList();
      setChatRooms(rooms);
    } catch (error) {
      console.error('채팅방 리스트 가져오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatClick = (room: ChattingRoomListItem) => {
    onSelectChat(room.chattingRoomPk, room.chatWith, room.chatWithNickname, room.postPk, room.memberPk);
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
      
      {/* Chat List Panel */}
      <div className={`fixed bottom-0 right-4 w-80 h-96 bg-white z-50 shadow-2xl rounded-t-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-green-50">
            <h2 className="text-lg font-bold text-gray-900">채팅</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-green-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">채팅방 목록을 불러오는 중...</div>
              </div>
            ) : chatRooms.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">채팅방이 없습니다.</div>
              </div>
            ) : (
              chatRooms.map((room) => (
                <div
                  key={room.chattingRoomPk}
                  onClick={() => handleChatClick(room)}
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
                          {chatService.formatMessageTime(room.messageAt)}
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

export default ChatList;
