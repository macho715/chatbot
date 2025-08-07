import type { NextApiRequest, NextApiResponse } from 'next';
import MOSBEntryService from '../../../../services/MOSBEntryService';

const service = new MOSBEntryService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // URL 파라미터에서 lpoNumber 추출
  const { lpoNumber } = req.query;

  // (1) LPO 번호가 없거나 잘못된 형식인 경우
  if (
    typeof lpoNumber !== 'string' ||
    !/^LPO-\d{4}-\d{6}$/.test(lpoNumber)
  ) {
    return res.status(400).json({ error: '잘못된 LPO 번호 형식입니다.' });
  }

  // (2) 서비스에서 LPO 정보 조회
  try {
    const lpoInfo = await service.getLocationInfo(lpoNumber);
    if (!lpoInfo) {
      return res.status(404).json({ error: '존재하지 않는 LPO입니다.' });
    }
    // (3) 정상 응답
    return res.status(200).json(lpoInfo);
  } catch (err) {
    // (4) 기타 서버 에러
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
} 