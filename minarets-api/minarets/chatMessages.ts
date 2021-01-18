import { ApiBase } from './apiBase';
import type { BasicUser, ChatMessage } from './types';

interface IListLatestRequest {
  lastMessageId?: number;
  maxItems?: number;
  includeActiveUsers?: boolean;
}

interface IListLatestResponse {
  stickyMessage: string;
  messages: ChatMessage[];
  activeUsers?: BasicUser[];
}

interface IListOnlineUsersResponse {
  users: BasicUser[];
}

interface IHistoryRequest {
  lastMessageId?: number;
  maxItems?: number;
}

interface IHistoryResponse {
  messages: ChatMessage[];
  activeUsers: BasicUser[];
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
