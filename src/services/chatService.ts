import { authService } from './authService';
import { Client } from '@stomp/stompjs';

// 환경변수에서 URL 가져오기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://beanba.store';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'wss://beanba.store';

interface OpenChattingRoomRequest {
  postPk: number;
}

interface OpenChattingRoomResponse {
  roomPk: number;
  memberPk: number;
}

interface MessageHistoryItem {
  messagePk: number;
  roomPk: number;
  memberPkFrom: number;
  memberNameFrom: string;
  message: string;
  messageAt: string;
}

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

export const chatService = {
  async openChattingRoom(postPk: number): Promise<OpenChattingRoomResponse> {
    const accessToken = authService.getAccessToken();
    
    if (!accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/api/chatting/openChattingRoom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ postPk }),
    });

    if (!response.ok) {
      throw new Error('채팅방 생성에 실패했습니다.');
    }

    return response.json();
  },

  async getAllChattingRoomList(): Promise<ChattingRoomListItem[]> {
    const accessToken = authService.getAccessToken();
    
    if (!accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/api/chatting/getAllChattingRoomList`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('채팅방 리스트를 가져오는데 실패했습니다.');
    }

    const data = await response.json();
    return data || [];
  },

  async getChattingRoomListByPostPk(postPk: number): Promise<ChattingRoomListItem[]> {
    const accessToken = authService.getAccessToken();
    
    if (!accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/api/chatting/getChattingRoomListByPostPk?postPk=${postPk}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('상품별 채팅방 리스트를 가져오는데 실패했습니다.');
    }

    const data = await response.json();
    return data || [];
  },

  createStompClient(memberPk: number): Promise<Client> {
    return new Promise((resolve, reject) => {
      const client = new Client({
        brokerURL: `${WS_BASE_URL}/api/ws-chat?memberPk=${memberPk}`,
        connectHeaders: {},
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = () => {
        console.log('STOMP 클라이언트 연결 성공');
        resolve(client);
      };

      client.onStompError = (frame) => {
        console.error('STOMP 에러:', frame.headers['message']);
        console.error('추가 정보:', frame.body);
        reject(new Error('STOMP 연결에 실패했습니다.'));
      };

      client.onWebSocketClose = () => {
        console.log('웹소켓 연결 종료');
      };

      client.activate();
    });
  },

  subscribeToRoom(client: Client, roomPk: number, onMessage: (message: any) => void): void {
    const destination = `/topic/room.${roomPk}`;
    
    client.subscribe(destination, (message) => {
      try {
        const data = JSON.parse(message.body);
        console.log('구독으로 받은 메시지:', data);
        onMessage(data);
      } catch (error) {
        console.error('메시지 파싱 오류:', error);
      }
    });
    
    console.log(`채팅방 구독: ${destination}`);
  },

  sendMessage(client: Client, roomPk: number, postPk: number, message: string): void {
    const messageData = {
      roomPk,
      postPk,
      message
    };
    
    client.publish({
      destination: '/api/chatting/sendMessage',
      body: JSON.stringify(messageData)
    });
    
    console.log('STOMP 메시지 전송:', messageData);
  },

  async getMessageHistory(roomPk: number): Promise<MessageHistoryItem[]> {
    const accessToken = authService.getAccessToken();
    
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
  },

  async markMessageAsRead(roomPk: number): Promise<void> {
    const accessToken = authService.getAccessToken();
    
    if (!accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/messageRead/${roomPk}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('메시지 읽음 처리 실패');
    }
  },

  formatMessageTime(messageAt: string): string {
    const date = new Date(messageAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }
};
