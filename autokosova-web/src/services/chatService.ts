import apiClient from './apiClient';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatAgentResponse {
    reply: string;
    model?: string;
}

export const chatService = {
    async sendMessage(messages: ChatMessage[]): Promise<ChatAgentResponse> {
        const response = await apiClient.post<ChatAgentResponse>('/chatagent/message', {
            messages,
        });
        return response.data;
    },
};
