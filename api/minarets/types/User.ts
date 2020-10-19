import type { BasicUser } from './BasicUser';

export interface User extends BasicUser {
  emailHash: string;
  lastActiveOn: string;
  createdOn: string;
  location: string;
  aboutMe: string;
  website: string;
  isModerator: boolean;
}
