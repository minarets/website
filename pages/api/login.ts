import { NextApiRequest, NextApiResponse } from 'next';
import { Account } from '../../api/minarets/account';

export default async function login(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  try {
    const accountApi = new Account();
    const user = accountApi.login({
      username: req.body.username,
      password: req.body.password,
    });

    res.status(200).json({
      ok: true,
      user,
    });
  } catch (ex) {
    res.status(500).json({ ok: false, statusCode: 500, message: ex.message });
  }
}
