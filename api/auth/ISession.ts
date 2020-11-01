export interface ISession {
  userId: number;
  expires: Date;
  sessionToken: string;
  accessToken: string;
}
