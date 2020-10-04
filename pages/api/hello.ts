import type { NowRequest, NowResponse } from '@vercel/node';

export default (_req: NowRequest, res: NowResponse): void => {
  res.statusCode = 200;
  res.json({ name: 'John Doe' });
};
