import type { NextApiRequest, NextApiResponse } from 'next';
import { MatchingService } from '../../services/MatchingService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const lpoNo = req.query.lpoNo as string;
  
  if (!lpoNo) {
    return res.status(400).json({ error: 'LPO number is required' });
  }
  
  try {
    const result = await MatchingService.matchLpo(lpoNo);
    
    if (!result) {
      return res.status(404).json({ error: 'LPO not found' });
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 