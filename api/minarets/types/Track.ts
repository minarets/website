export interface Track {
  id: string;
  name: string;
  additionalInfo: string;
  concertId: string;
  duration: string;
  order: number;
  playCount: number;
  url?: string;
}
