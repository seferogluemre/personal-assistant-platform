const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ChatThread {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface SendMessageResponse {
  chatId: string;
  messageId: string;
  content: string;
  createdAt: string;
}

export interface AgentPromptResponse {
  success: boolean;
  agent: {
    name: string;
    systemPrompt: string;
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include", // Cookie'leri otomatik gönder
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Bir hata oluştu.");
  }

  return data as T;
}

export const chatService = {
  async fetchChats(): Promise<ChatThread[]> {
    const res = await request<{ data: ChatThread[] }>("/chat/list");
    return res.data || [];
  },

  async fetchMessages(chatId: string): Promise<ChatMessage[]> {
    const res = await request<{ data: ChatMessage[] }>(`/chat/${chatId}/messages`);
    return res.data || [];
  },

  async sendMessage(chatId: string | undefined, message: string): Promise<SendMessageResponse> {
    return request<SendMessageResponse>("/chat/send", {
      method: "POST",
      body: JSON.stringify({ chatId, message }),
    });
  },

  async deleteChat(chatId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/chat/${chatId}`, {
      method: "DELETE",
    });
  },

  async updateChatTitle(chatId: string, title: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/chat/${chatId}/title`, {
      method: "PUT",
      body: JSON.stringify({ title }),
    });
  },

  async getSystemPrompt(agentName: string): Promise<AgentPromptResponse> {
    return request<AgentPromptResponse>(`/agent/${encodeURIComponent(agentName)}`);
  },

  async updateSystemPrompt(agentName: string, systemPrompt: string): Promise<AgentPromptResponse> {
    return request<AgentPromptResponse>(`/agent/${encodeURIComponent(agentName)}`, {
      method: "PUT",
      body: JSON.stringify({ systemPrompt }),
    });
  },
};
