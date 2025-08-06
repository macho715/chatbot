import { useState, useCallback } from 'react';
import { MatchingService, MatchingResult } from '../services/MatchingService';

export interface UseLPOMatchingReturn {
  result: MatchingResult | null;
  loading: boolean;
  error: string | null;
  queryLPO: (lpoNumber: string) => Promise<void>;
  reset: () => void;
}

export const useLPOMatching = (): UseLPOMatchingReturn => {
  const [result, setResult] = useState<MatchingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryLPO = useCallback(async (lpoNumber: string) => {
    if (!lpoNumber.trim()) {
      setError('LPO 번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await MatchingService.matchLpo(lpoNumber);
      
      if (data) {
        setResult(data);
      } else {
        setError('해당 LPO를 찾을 수 없습니다.');
        setResult(null);
      }
    } catch (err) {
      console.error('Error fetching LPO data:', err);
      setError('데이터 조회 중 오류가 발생했습니다.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    result,
    loading,
    error,
    queryLPO,
    reset
  };
}; 