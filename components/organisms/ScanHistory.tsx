import React, { useState, useCallback } from 'react';
import Button from '../atoms/Button';
import { useScanHistory, ScanHistoryItem } from '../../hooks/useScanHistory';

export interface ScanHistoryProps {
  onSelectLPO?: (lpoNumber: string) => void;
  maxItems?: number;
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ 
  onSelectLPO, 
  maxItems = 10 
}) => {
  const { 
    history, 
    clearHistory, 
    removeFromHistory, 
    getRecentScans 
  } = useScanHistory();
  
  const [showAll, setShowAll] = useState(false);

  const recentScans = getRecentScans(showAll ? undefined : maxItems);

  const handleSelectLPO = useCallback((lpoNumber: string) => {
    onSelectLPO?.(lpoNumber);
  }, [onSelectLPO]);

  const handleRemoveItem = useCallback((id: string) => {
    removeFromHistory(id);
  }, [removeFromHistory]);

  const handleClearHistory = useCallback(() => {
    if (window.confirm('모든 스캔 히스토리를 삭제하시겠습니까?')) {
      clearHistory();
    }
  }, [clearHistory]);

  const formatTimestamp = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`;
    } else {
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '❓';
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>스캔 히스토리가 없습니다.</p>
        <p className="text-sm">LPO를 스캔하면 여기에 기록됩니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          스캔 히스토리 ({history.length})
        </h3>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAll(!showAll)}
            variant="secondary"
            size="sm"
          >
            {showAll ? '최근만 보기' : '전체 보기'}
          </Button>
          <Button
            onClick={handleClearHistory}
            variant="danger"
            size="sm"
          >
            전체 삭제
          </Button>
        </div>
      </div>

      {/* 히스토리 목록 */}
      <div className="space-y-2">
        {recentScans.map((item) => (
          <div
            key={item.id}
            className={`p-3 rounded-lg border ${getStatusColor(item.status)} hover:shadow-sm transition-shadow cursor-pointer`}
            onClick={() => handleSelectLPO(item.lpoNumber)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-lg">{getStatusIcon(item.status)}</span>
                <div>
                  <p className="font-mono font-medium text-lg">
                    {item.lpoNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatTimestamp(item.timestamp)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {item.result && (
                  <span className="text-xs px-2 py-1 bg-white rounded-full border">
                    {item.result.items?.length || 0}개 항목
                  </span>
                )}
                <Button
                  onClick={() => {
                    handleRemoveItem(item.id);
                  }}
                  variant="danger"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  삭제
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 더보기 버튼 */}
      {!showAll && history.length > maxItems && (
        <div className="text-center">
          <Button
            onClick={() => setShowAll(true)}
            variant="secondary"
            size="sm"
          >
            더 보기 ({history.length - maxItems}개 더)
          </Button>
        </div>
      )}

      {/* 사용 안내 */}
      <div className="text-center text-sm text-gray-500">
        <p>히스토리 항목을 클릭하면 해당 LPO를 다시 조회할 수 있습니다.</p>
      </div>
    </div>
  );
};

export default ScanHistory; 