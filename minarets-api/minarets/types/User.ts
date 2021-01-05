import type { BasicUserWithToken } from './BasicUserWithToken';

export interface User extends BasicUserWithToken {
  email: string;
  image: string;
  isAdministrator?: boolean;
  isModerator?: boolean;
  isEditor?: boolean;
}
