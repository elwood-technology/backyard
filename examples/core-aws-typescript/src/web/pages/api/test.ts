import { NextApiResponse } from 'next';

export default async function handler(
  _: unknown,
  res: NextApiResponse,
): Promise<void> {
  res.json({ message: 'hello world :)' });
}
