import axiosClient from '../axiosClient';

export interface AiChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface AiChatSession {
  id: number;
  title: string;
  createdAt: string;
  messages: AiChatMessage[];
}

export const aiChatApi = {
  getAllSessions: async (): Promise<AiChatSession[]> => {
    return await axiosClient.get('/v1/ai-chat/conversations');
  },

  createSession: async (): Promise<AiChatSession> => {
    return await axiosClient.post('/v1/ai-chat/conversations');
  },

  addMessage: async (sessionId: number, role: 'user' | 'ai', text: string): Promise<AiChatMessage> => {
    return await axiosClient.post(`/v1/ai-chat/conversations/${sessionId}/messages`, {
      role,
      text
    });
  },

  deleteSession: async (sessionId: number): Promise<void> => {
    await axiosClient.delete(`/v1/ai-chat/conversations/${sessionId}`);
  }
};
