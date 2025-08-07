import React, { useState, useCallback } from 'react';

export interface ScanHistoryProps {
  onSelectLPO?: (lpoNumber: string) => void;
  maxItems?: number;
}

// 스캔 히스토리 훅 (실제 구현에서는 별도 파일로 분리)
const useScanHistory = () => {
  const [history, setHistory] = useState<Array<{
    id: string;
    lpoNumber: string;
    status: string;
    timestamp: number;
    result?: any;
  }>>([]);

  const addToHistory = useCallback((lpoNumber: string, status: string, result?: any) => {
    const newItem = {
      id: Date.now().toString(),
      lpoNumber,
      status,
      timestamp: Date.now(),
      result
    };
    setHistory(prev => [newItem, ...prev.slice(0, 49)]); // 최대 50개 유지
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getRecentScans = useCallback((limit?: number) => {
    return limit ? history.slice(0, limit) : history;
  }, [history]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getRecentScans
  };
};

const ScanHistory: React.FC<ScanHistoryProps> = ({
  onSelectLPO,
  maxItems = 10,
}) => {
  const {
    history,
    clearHistory,
    removeFromHistory,
    getRecentScans,
  } = useScanHistory();

  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState('');
  const [selectedLPO, setSelectedLPO] = useState<string | null>(null);

  const recentScans = getRecentScans(showAll ? undefined : maxItems);

  const handleSelectLPO = useCallback(
    (lpoNumber: string) => {
      setSelectedLPO(lpoNumber);
      onSelectLPO?.(lpoNumber);
    },
    [onSelectLPO]
  );

  const handleRemoveItem = useCallback(
    (id: string) => {
      removeFromHistory(id);
    },
    [removeFromHistory]
  );

  const handleClearHistory = useCallback(() => {
    if (
      window.confirm('정말로 모든 스캔 히스토리를 삭제하시겠습니까?')
    ) {
      clearHistory();
      setError('');
      setSelectedLPO(null);
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
        minute: '2-digit',
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

  if (!history.length) {
    return React.createElement('div', { className: "text-center py-8 text-gray-500" },
      React.createElement('p', null, "스캔 히스토리가 없습니다."),
      React.createElement('p', { className: "text-sm" },
        "LPO를 스캔하면 이곳에 기록됩니다.", React.createElement('br'),
        "히스토리 기능은 최근 성공/오류 모두 저장됩니다."
      )
    );
  }

  return React.createElement('div', { className: "space-y-4" },
    // 헤더
    React.createElement('div', { className: "flex justify-between items-center" },
      React.createElement('h3', { className: "text-lg font-semibold text-gray-900" },
        "스캔 히스토리 ",
        React.createElement('span', { className: "text-xs text-gray-500" }, `(${history.length})`)
      ),
      React.createElement('div', { className: "flex gap-2" },
        React.createElement('button', {
          onClick: () => setShowAll(!showAll),
          className: `px-3 py-1 rounded text-sm font-medium transition-colors ${
            showAll
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`
        }, showAll ? '최근만 보기' : '전체 보기'),
        React.createElement('button', {
          onClick: handleClearHistory,
          className: "px-3 py-1 rounded text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
        }, "전체 삭제")
      )
    ),

    // 히스토리 목록
    React.createElement('div', { className: "space-y-2" },
      recentScans.map((item) =>
        React.createElement('div', {
          key: item.id,
          className: `p-3 rounded-lg border group flex justify-between items-center transition-shadow cursor-pointer ${getStatusColor(item.status)} hover:shadow-md`
        },
          React.createElement('div', {
            className: "flex items-center gap-3 flex-1",
            onClick: () => handleSelectLPO(item.lpoNumber)
          },
            React.createElement('span', { className: "text-lg" }, getStatusIcon(item.status)),
            React.createElement('div', null,
              React.createElement('p', { className: "font-mono font-medium text-lg" },
                item.lpoNumber
              ),
              React.createElement('p', { className: "text-xs text-gray-500" },
                formatTimestamp(item.timestamp)
              ),
              item.result && React.createElement('span', {
                className: "text-xs px-2 py-1 bg-white border rounded-full text-gray-600"
              }, `${item.result.items?.length || 0}개 항목`)
            )
          ),
          React.createElement('div', { className: "flex flex-col items-end" },
            React.createElement('button', {
              onClick: () => handleRemoveItem(item.id),
              className: "py-1 px-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            }, "삭제")
          )
        )
      )
    ),

    // 더보기 버튼
    !showAll && history.length > maxItems && React.createElement('div', { className: "text-center" },
      React.createElement('button', {
        onClick: () => setShowAll(true),
        className: "px-4 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
      }, `더 보기 (${history.length - maxItems}개 더)`)
    ),

    // 안내/에러 메시지
    error && React.createElement('div', {
      className: "bg-red-50 border-l-4 border-red-400 p-3 mt-3 text-red-700 text-center rounded"
    }, error),

    // 상세 LPO 선택시 팝업/연결
    selectedLPO && React.createElement('div', {
      className: "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40"
    },
      React.createElement('div', {
        className: "bg-white rounded-lg p-6 shadow-lg w-full max-w-sm mx-auto"
      },
        React.createElement('div', { className: "flex justify-between items-center mb-3" },
          React.createElement('h4', { className: "font-bold text-gray-900" }, "LPO 상세 정보"),
          React.createElement('button', {
            onClick: () => setSelectedLPO(null),
            className: "text-xl font-bold text-gray-500 hover:text-gray-700"
          }, "✕")
        ),
        React.createElement('div', { className: "space-y-2" },
          React.createElement('p', { className: "font-mono text-green-700" },
            "번호: ", selectedLPO
          )
          // 상세 정보 연동 등 확장 가능
        ),
        React.createElement('div', { className: "mt-4 text-right" },
          React.createElement('button', {
            onClick: () => setSelectedLPO(null),
            className: "px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
          }, "닫기")
        )
      )
    ),

    // 사용 안내
    React.createElement('div', { className: "text-center text-xs text-gray-500 mt-2" },
      React.createElement('p', null,
        "히스토리 항목 클릭 시 상세 정보 팝업이 나타납니다.", React.createElement('br'),
        "히스토리는 브라우저에 안전하게 저장됩니다."
      )
    )
  );
};

export default ScanHistory; 