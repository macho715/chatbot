import React, { useState, useCallback, useEffect } from 'react';
import Button from '../atoms/Button';
import { useScanHistory } from '../../hooks/useScanHistory';

export interface BatchScanResult {
  scannedItems: string[];
  successCount: number;
  errorCount: number;
  totalTime: number;
  startTime: number;
  endTime: number;
}

export interface BatchScannerProps {
  onBatchComplete?: (result: BatchScanResult) => void;
  maxItems?: number;
}

const BatchScanner: React.FC<BatchScannerProps> = ({ 
  onBatchComplete, 
  maxItems = 50 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [results, setResults] = useState<BatchScanResult | null>(null);
  const [scanMode, setScanMode] = useState<'manual' | 'auto'>('manual');
  const [autoScanInterval, setAutoScanInterval] = useState<NodeJS.Timeout | null>(null);

  const { addToHistory } = useScanHistory();

  // 자동 스캔 모드 처리
  useEffect(() => {
    if (scanMode === 'auto' && isScanning) {
      const interval = setInterval(() => {
        // 모의 자동 스캔 (실제로는 QR 스캐너에서 연속 스캔)
        const mockLPO = `LPO${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        handleScanItem(mockLPO);
      }, 2000); // 2초마다 스캔

      setAutoScanInterval(interval);
    } else if (autoScanInterval) {
      clearInterval(autoScanInterval);
      setAutoScanInterval(null);
    }

    return () => {
      if (autoScanInterval) {
        clearInterval(autoScanInterval);
      }
    };
  }, [scanMode, isScanning]);

  const handleScanItem = useCallback((lpoNumber: string) => {
    if (scannedItems.length >= maxItems) {
      stopBatchScan();
      return;
    }

    setScannedItems(prev => [...prev, lpoNumber]);
    setCurrentItem(lpoNumber);

    // 히스토리에 추가 (성공으로 가정)
    addToHistory(lpoNumber, 'success', { batchScan: true });

    // 다음 스캔 준비
    setTimeout(() => {
      setCurrentItem('');
    }, 500);
  }, [scannedItems.length, maxItems, addToHistory]);

  const startBatchScan = useCallback(() => {
    setIsScanning(true);
    setScannedItems([]);
    setResults(null);
    setStartTime(Date.now());
  }, []);

  const stopBatchScan = useCallback(() => {
    setIsScanning(false);
    const endTime = Date.now();
    const totalTime = endTime - (startTime || endTime);

    const result: BatchScanResult = {
      scannedItems,
      successCount: scannedItems.length,
      errorCount: 0, // 실제로는 에러 카운트 추가
      totalTime,
      startTime: startTime || endTime,
      endTime
    };

    setResults(result);
    onBatchComplete?.(result);

    if (autoScanInterval) {
      clearInterval(autoScanInterval);
      setAutoScanInterval(null);
    }
  }, [scannedItems, startTime, onBatchComplete, autoScanInterval]);

  const handleManualInput = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      handleScanItem(e.currentTarget.value.trim());
      e.currentTarget.value = '';
    }
  }, [handleScanItem]);

  const clearResults = useCallback(() => {
    setResults(null);
    setScannedItems([]);
    setCurrentItem('');
  }, []);

  const exportResults = useCallback(() => {
    if (!results) return;

    const csvContent = [
      'LPO Number,Scan Time,Status',
      ...results.scannedItems.map((item, index) => 
        `${item},${new Date(results.startTime + (index * 500)).toISOString()},SUCCESS`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_scan_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [results]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">배치 스캔</h3>
        <p className="text-gray-600">여러 LPO를 연속으로 스캔하여 일괄 처리합니다</p>
      </div>

      {/* 스캔 모드 선택 */}
      <div className="flex gap-4 justify-center">
        <Button
          onClick={() => setScanMode('manual')}
          variant={scanMode === 'manual' ? 'primary' : 'secondary'}
          disabled={isScanning}
        >
          수동 스캔
        </Button>
        <Button
          onClick={() => setScanMode('auto')}
          variant={scanMode === 'auto' ? 'primary' : 'secondary'}
          disabled={isScanning}
        >
          자동 스캔
        </Button>
      </div>

      {/* 스캔 컨트롤 */}
      <div className="flex gap-4 justify-center">
        {!isScanning ? (
          <Button
            onClick={startBatchScan}
            variant="primary"
            size="lg"
          >
            🚀 배치 스캔 시작
          </Button>
        ) : (
          <Button
            onClick={stopBatchScan}
            variant="danger"
            size="lg"
          >
            ⏹️ 스캔 중지
          </Button>
        )}
      </div>

      {/* 현재 스캔 상태 */}
      {isScanning && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">스캔 진행 중...</p>
              <p className="text-sm text-blue-700">
                {scannedItems.length} / {maxItems} 항목 스캔됨
              </p>
            </div>
            <div className="text-right">
              {currentItem && (
                <p className="font-mono text-lg text-blue-900">
                  현재: {currentItem}
                </p>
              )}
              <p className="text-sm text-blue-700">
                {scanMode === 'auto' ? '자동 모드 (2초 간격)' : '수동 모드'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 수동 입력 */}
      {isScanning && scanMode === 'manual' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            LPO 번호 입력 (Enter로 추가)
          </label>
          <input
            type="text"
            placeholder="LPO 번호를 입력하고 Enter를 누르세요"
            onKeyPress={handleManualInput}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={scannedItems.length >= maxItems}
          />
        </div>
      )}

      {/* 스캔된 항목 목록 */}
      {scannedItems.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">
            스캔된 항목 ({scannedItems.length}개)
          </h4>
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-2">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {scannedItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-green-50 border border-green-200 rounded px-2 py-1 text-sm"
                >
                  <span className="font-mono">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 결과 표시 */}
      {results && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">배치 스캔 완료</h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{results.successCount}</p>
              <p className="text-sm text-gray-600">성공</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{results.errorCount}</p>
              <p className="text-sm text-gray-600">실패</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(results.totalTime / 1000)}s
              </p>
              <p className="text-sm text-gray-600">소요시간</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Math.round((results.successCount / results.totalTime) * 1000 * 60)}/min
              </p>
              <p className="text-sm text-gray-600">처리속도</p>
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <Button
              onClick={exportResults}
              variant="success"
              size="sm"
            >
              📊 CSV 내보내기
            </Button>
            <Button
              onClick={clearResults}
              variant="secondary"
              size="sm"
            >
              🔄 새로 시작
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchScanner; 