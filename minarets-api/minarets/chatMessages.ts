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

export class ChatMessages extends ApiBase {
  public async listLatest(request: IListLatestRequest = {}): Promise<IListLatestResponse> {
    const query = this.queryParams(request);
    const response = await this.get(`${this.apiUrl}/api/chatmessages`, { query });

    return (await response.json()) as IListLatestResponse;
  }

  public async listOnlineUsers(request: IHistoryRequest = {}): Promise<BasicUser[]> {
    const query = this.queryParams(request);
    const response = await this.get(`${this.apiUrl}/api/chatmessages/users`, { query });

    const json = (await response.json()) as IListOnlineUsersResponse;

    return json.users;
  }

  public async history(request: IHistoryRequest = {}): Promise<IHistoryResponse> {
    const query = this.queryParams(request);
    const response = await this.get(`${this.apiUrl}/api/chatmessages/history`, { query });

    return (await response.json()) as IHistoryResponse;
  }
}
