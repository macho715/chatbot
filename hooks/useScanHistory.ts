import { useState, useCallback, useEffect } from 'react';

export interface ScanHistoryItem {
  id: string;
  lpoNumber: string;
  timestamp: number;
  status: 'success' | 'error' | 'pending';
  result?: any;
}

export interface UseScanHistoryReturn {
  history: ScanHistoryItem[];
  addToHistory: (lpoNumber: string, status: 'success' | 'error' | 'pending', result?: any) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  getRecentScans: (limit?: number) => ScanHistoryItem[];
  getHistoryByDate: (date: Date) => ScanHistoryItem[];
}

const STORAGE_KEY = 'lpo_scan_history';
const MAX_HISTORY_SIZE = 100;

export const useScanHistory = (): UseScanHistoryReturn => {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);

  // 로컬 스토리지에서 히스토리 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Failed to load scan history:', error);
    }
  }, []);

  // 히스토리를 로컬 스토리지에 저장
  const saveToStorage = useCallback((newHistory: ScanHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save scan history:', error);
    }
  }, []);

  // 히스토리에 추가
  const addToHistory = useCallback((
    lpoNumber: string, 
    status: 'success' | 'error' | 'pending', 
    result?: any
  ) => {
    const newItem: ScanHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lpoNumber,
      timestamp: Date.now(),
      status,
      result
    };

    setHistory(prevHistory => {
      const newHistory = [newItem, ...prevHistory].slice(0, MAX_HISTORY_SIZE);
      saveToStorage(newHistory);
      return newHistory;
    });
  }, [saveToStorage]);

  // 히스토리 전체 삭제
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // 특정 항목 삭제
  const removeFromHistory = useCallback((id: string) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.id !== id);
      saveToStorage(newHistory);
      return newHistory;
    });
  }, [saveToStorage]);

  // 최근 스캔 가져오기
  const getRecentScans = useCallback((limit: number = 10) => {
    return history.slice(0, limit);
  }, [history]);

  // 특정 날짜의 히스토리 가져오기
  const getHistoryByDate = useCallback((date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return history.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= startOfDay && itemDate <= endOfDay;
    });
  }, [history]);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
    getRecentScans,
    getHistoryByDate
  };
}; 