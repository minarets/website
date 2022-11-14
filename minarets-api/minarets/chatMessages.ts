import { ApiBase } from './apiBase';
import type { BasicUser, ChatMessage } from './types';

export interface IListLatestRequest {
  lastMessageId?: number;
  maxItems?: number;
  includeOnlineUsers?: boolean;
}

export interface IListLatestResponse {
  stickyMessage?: string;
  messages: ChatMessage[];
  onlineUsers?: BasicUser[];
}

export interface IListOnlineUsersResponse {
  users: BasicUser[];
}

export interface IHistoryRequest {
  lastMessageId?: number;
  maxItems?: number;
}

export interface IHistoryResponse {
  messages: ChatMessage[];
  onlineUsers: BasicUser[];
}

export interface ISendResponse {
  message?: ChatMessage;
}

export class ChatMessages extends ApiBase {
  public listLatest(request: IListLatestRequest = {}): Promise<IListLatestResponse> {
    const query = this.queryParams(request);
    return this.get<IListLatestResponse>(`${this.apiUrl}/api/chatmessages`, { query });
  }

  public async listOnlineUsers(request: IHistoryRequest = {}): Promise<BasicUser[]> {
    const query = this.queryParams(request);
    const response = await this.get<IListOnlineUsersResponse>(`${this.apiUrl}/api/chatmessages/users`, { query });

    return response.users;
  }

  public history(request: IHistoryRequest = {}): Promise<IHistoryResponse> {
    const query = this.queryParams(request);
    return this.get<IHistoryResponse>(`${this.apiUrl}/api/chatmessages/history`, { query });
  }

  public send(message: string): Promise<ISendResponse> {
    return this.post<ISendResponse>(`${this.apiUrl}/api/chatmessages/add`, {
      message,
    });
  }
}
