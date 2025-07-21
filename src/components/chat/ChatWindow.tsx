
import React, { useState } from 'react';
import { X, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Chat {
  id: string;
  userName: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  product: string;
}

interface Message {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
}

interface ChatWindowProps {
  chat: Chat | null;
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

const ChatWindow = ({ chat, isOpen, onClose, onBack }: ChatWindowProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '안녕하세요! 상품에 관심이 있어서 연락드렸어요.',
      time: '오후 1:00',
      isOwn: true
    },
    {
      id: '2',
      text: '네, 안녕하세요! 어떤 부분이 궁금하신가요?',
      time: '오후 1:05',
      isOwn: false
    },
    {
      id: '3',
      text: chat?.lastMessage || '',
      time: chat?.time || '',
      isOwn: false
    }
  ]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        time: new Date().toLocaleTimeString('ko-KR', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
        isOwn: true
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  if (!chat) return null;

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
      <div className={`fixed bottom-0 right-4 w-80 h-96 bg-white z-50 shadow-2xl rounded-t-lg transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-green-50">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={onBack} className="hover:bg-green-100 p-1">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <img
                src={`https://images.unsplash.com/${chat.avatar}?w=32&h=32&fit=crop&crop=face`}
                alt={chat.userName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <h3 className="text-sm font-medium text-gray-900">{chat.userName}</h3>
                <p className="text-xs text-gray-500">{chat.product}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-green-100">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-2 rounded-lg ${
                    msg.isOwn
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.isOwn ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Message Input */}
          <div className="border-t p-3">
            <div className="flex space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
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

export default ChatWindow;
