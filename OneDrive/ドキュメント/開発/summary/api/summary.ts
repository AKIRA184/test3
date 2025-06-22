import { VercelRequest, VercelResponse } from '@vercel/node';
import { summarizeWithGemini, extractMainText } from '../src/index';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'url is required' });
    return;
  }
  try {
    const mainText = await extractMainText(url);
    const summary = await summarizeWithGemini(mainText);
    res.json({ summary });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
