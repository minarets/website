import type { BasicUser } from './BasicUser';

export interface ChatMessage {
  id: number;
  text: string;
  createdOn: string;
  createdBy: BasicUser;
}
