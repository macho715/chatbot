// pages/api/test-lpo.ts - LPO API 테스트용

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // 테스트용 응답
  res.status(200).json({
    message: 'LPO API 테스트 성공',
    timestamp: new Date().toISOString(),
    testData: {
      lpoNumber: 'LPO-2024-001234',
      location: {
        building: 'Building A',
        zone: 'Zone 3',
        contact: '+971-50-123-4567',
        instructions: ['Safety helmet required'],
        operatingHours: '06:00 - 22:00',
        gpsCoordinate: [24.4539, 54.3773]
      },
      lastUpdated: new Date('2024-12-19T10:00:00Z')
    }
  });
} 