import React, { useState, useCallback, useEffect, useRef } from 'react';
import { QRCodeScanner } from '../molecules/QRCodeScanner';

// LPO 유효성 검증 함수
function isValidLPO(lpo: string) {
  return /^LPO-\d{4}-\d{6}$/.test(lpo);
}

// 배치 스캔 결과 인터페이스
export interface BatchScanResult {
  scannedItems: string[];
  errorItems: { lpo: string; reason: string }[];
  successCount: number;
  errorCount: number;
  totalTime: number;
  startTime: number;
  endTime: number;
}

// 배치 스캐너 props 인터페이스
export interface BatchScannerProps {
  onBatchComplete?: (result: BatchScanResult) => void;
  onScanHistoryUpdate?: (lpoNumber: string, status: 'success' | 'error', metadata?: any) => void;
  maxItems?: number;
}

// 간단한 스캔 히스토리 훅 (실제 구현에서는 별도 파일로 분리)
const useScanHistory = () => {
  const addToHistory = useCallback((lpo: string, status: string, metadata?: any) => {
    console.log(`Scan History: ${lpo} - ${status}`, metadata);
  }, []);
  return { addToHistory };
};

// 배치 스캐너 컴포넌트
const BatchScanner: React.FC<BatchScannerProps> = ({
  onBatchComplete,
  onScanHistoryUpdate,
  maxItems = 50,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedItems, setScannedItems] = useState<string[]>([]);
  const [errorItems, setErrorItems] = useState<{ lpo: string; reason: string }[]>([]);
  const [currentItem, setCurrentItem] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [results, setResults] = useState<BatchScanResult | null>(null);
  const [scanMode, setScanMode] = useState<'manual' | 'auto' | 'qr'>('manual');
  const [autoScanInterval, setAutoScanInterval] = useState<NodeJS.Timeout | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const manualInputRef = useRef<HTMLInputElement>(null);

  const { addToHistory } = useScanHistory();

  // 자동 스캔 인터벌 정리
  useEffect(() => {
    return () => {
      if (autoScanInterval) {
        clearInterval(autoScanInterval);
      }
    };
  }, [autoScanInterval]);

  // 자동 스캔 모드 처리
  useEffect(() => {
    if (scanMode === 'auto' && isScanning) {
      const interval = setInterval(() => {
        const mockLPO = `LPO-2024-${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
        handleScanItem(mockLPO);
      }, 2000);
      setAutoScanInterval(interval);
    } else if (autoScanInterval) {
      clearInterval(autoScanInterval);
      setAutoScanInterval(null);
    }
    return () => {
      if (autoScanInterval) clearInterval(autoScanInterval);
    };
  }, [scanMode, isScanning]);

  // LPO 스캔 처리 (히스토리 자동 동기화 추가)
  const handleScanItem = useCallback(
    (lpoNumber: string) => {
      if (!isValidLPO(lpoNumber)) {
        setErrorItems((prev) => [
          ...prev,
          { lpo: lpoNumber, reason: 'LPO 번호 형식 오류' },
        ]);
        // 히스토리에 에러 기록
        onScanHistoryUpdate?.(lpoNumber, 'error', { reason: 'LPO 번호 형식 오류' });
        return;
      }
      if (scannedItems.includes(lpoNumber)) {
        setErrorItems((prev) => [
          ...prev,
          { lpo: lpoNumber, reason: '중복 스캔' },
        ]);
        // 히스토리에 에러 기록
        onScanHistoryUpdate?.(lpoNumber, 'error', { reason: '중복 스캔' });
        return;
      }
      if (scannedItems.length >= maxItems) {
        stopBatchScan();
        return;
      }
      setScannedItems((prev) => [...prev, lpoNumber]);
      setCurrentItem(lpoNumber);

      // 히스토리에 성공 기록
      onScanHistoryUpdate?.(lpoNumber, 'success', {
        batchScan: true,
        timestamp: Date.now(),
        scanMode: scanMode
      });

      addToHistory(lpoNumber, 'success', { batchScan: true });
      setTimeout(() => setCurrentItem(''), 500);
    },
    [scannedItems, maxItems, addToHistory, onScanHistoryUpdate, scanMode]
  );

  // QR 스캔 성공 처리
  const handleQRScanSuccess = (decodedText: string) => {
    console.log('QR Code scanned in batch mode:', decodedText);
    const lpoMatch = decodedText.match(/LPO-\d{4}-\d{6}/);
    if (lpoMatch) {
      const extractedLPO = lpoMatch[0];
      handleScanItem(extractedLPO);
      setShowQRScanner(false);
    } else {
      setErrorItems((prev) => [
        ...prev,
        { lpo: decodedText, reason: 'QR 코드에 유효한 LPO 번호 없음' },
      ]);
      onScanHistoryUpdate?.(decodedText, 'error', { reason: 'QR 코드에 유효한 LPO 번호 없음' });
      setShowQRScanner(false);
    }
  };

  // QR 스캔 에러 처리
  const handleQRScanError = (error: string) => {
    console.log('QR Scan error in batch mode:', error);
    setErrorItems((prev) => [
      ...prev,
      { lpo: 'QR_SCAN_ERROR', reason: `QR 스캔 오류: ${error}` },
    ]);
    onScanHistoryUpdate?.('QR_SCAN_ERROR', 'error', { reason: `QR 스캔 오류: ${error}` });
    setShowQRScanner(false);
  };

  // 배치 스캔 시작
  const startBatchScan = useCallback(() => {
    setIsScanning(true);
    setScannedItems([]);
    setErrorItems([]);
    setResults(null);
    setStartTime(Date.now());
  }, []);

  // 배치 스캔 중지
  const stopBatchScan = useCallback(() => {
    setIsScanning(false);
    const endTime = Date.now();
    const totalTime = endTime - (startTime || endTime);
    const result: BatchScanResult = {
      scannedItems,
      errorItems,
      successCount: scannedItems.length,
      errorCount: errorItems.length,
      totalTime,
      startTime: startTime || endTime,
      endTime,
    };
    setResults(result);
    onBatchComplete?.(result);
    if (autoScanInterval) {
      clearInterval(autoScanInterval);
      setAutoScanInterval(null);
    }
  }, [scannedItems, errorItems, startTime, onBatchComplete, autoScanInterval]);

  // 수동 입력 처리
  const handleManualInput = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
        handleScanItem(e.currentTarget.value.trim());
        e.currentTarget.value = '';
      }
    },
    [handleScanItem]
  );

  // 결과 초기화
  const clearResults = useCallback(() => {
    setResults(null);
    setScannedItems([]);
    setErrorItems([]);
    setCurrentItem('');
  }, []);

  // 결과 내보내기
  const exportResults = useCallback(() => {
    if (!results) return;
    const csvContent = [
      'LPO Number,Scan Time,Status,Reason',
      ...results.scannedItems.map(
        (item, index) =>
          `${item},${new Date(
            results.startTime + index * 500
          ).toISOString()},SUCCESS,`
      ),
      ...results.errorItems.map(
        (item) =>
          `${item.lpo},,ERROR,${item.reason}`
      ),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_scan_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [results]);

  // QR 스캐너가 표시되어 있을 때
  if (showQRScanner) {
    return React.createElement('div', { className: "max-w-lg mx-auto" },
      React.createElement(QRCodeScanner, {
        onScanSuccess: handleQRScanSuccess,
        onScanError: handleQRScanError,
        onClose: () => setShowQRScanner(false),
        className: "w-full"
      })
    );
  }

  return React.createElement('div', { className: "space-y-6" },
    // 헤더
    React.createElement('div', { className: "text-center" },
      React.createElement('h3', { className: "text-2xl font-bold text-gray-900" }, "배치 스캔 (히스토리 연동)"),
      React.createElement('p', { className: "text-gray-600" },
        "여러 LPO를 연속으로 스캔합니다.", React.createElement('br'),
        "스캔 결과는 자동으로 히스토리에 저장됩니다!"
      )
    ),

    // 스캔 모드 선택
    React.createElement('div', { className: "flex gap-4 justify-center" },
      React.createElement('button', {
        onClick: () => setScanMode('manual'),
        className: `px-4 py-2 rounded-lg font-medium transition-colors ${
          scanMode === 'manual'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`,
        disabled: isScanning
      }, "수동 스캔"),
      React.createElement('button', {
        onClick: () => setScanMode('auto'),
        className: `px-4 py-2 rounded-lg font-medium transition-colors ${
          scanMode === 'auto'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`,
        disabled: isScanning
      }, "자동 스캔"),
      React.createElement('button', {
        onClick: () => setScanMode('qr'),
        className: `px-4 py-2 rounded-lg font-medium transition-colors ${
          scanMode === 'qr'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`,
        disabled: isScanning
      }, "QR 스캔")
    ),

    // 스캔 시작/중지 버튼
    React.createElement('div', { className: "flex gap-4 justify-center" },
      !isScanning
        ? React.createElement('button', {
            onClick: startBatchScan,
            className: "px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg"
          }, "🚀 배치 스캔 시작")
        : React.createElement('button', {
            onClick: stopBatchScan,
            className: "px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors text-lg"
          }, "⏹️ 스캔 중지")
    ),

    // 스캔 진행 상태
    isScanning && React.createElement('div', { className: "bg-blue-50 border border-blue-200 rounded-lg p-4" },
      React.createElement('div', { className: "flex items-center justify-between" },
        React.createElement('div', null,
          React.createElement('p', { className: "font-medium text-blue-900" }, "스캔 진행 중..."),
          React.createElement('p', { className: "text-sm text-blue-700" },
            `${scannedItems.length} / ${maxItems} 성공, ${errorItems.length} 실패`
          )
        ),
        React.createElement('div', { className: "text-right" },
          currentItem && React.createElement('p', { className: "font-mono text-lg text-blue-900" },
            `현재: ${currentItem}`
          ),
          React.createElement('p', { className: "text-sm text-blue-700" },
            scanMode === 'auto' ? '자동 모드 (2초 간격)' :
            scanMode === 'qr' ? 'QR 스캔 모드' : '수동 모드'
          )
        )
      )
    ),

    // QR 스캔 버튼 (QR 모드일 때)
    isScanning && scanMode === 'qr' && React.createElement('div', { className: "text-center" },
      React.createElement('button', {
        onClick: () => setShowQRScanner(true),
        className: "px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      },
        React.createElement('span', { className: "mr-2" }, "📱"),
        "QR 코드 스캔하기"
      )
    ),

    // 수동 입력 필드
    isScanning && scanMode === 'manual' && React.createElement('div', { className: "space-y-2" },
      React.createElement('label', { className: "block text-sm font-medium text-gray-700" },
        "LPO 번호 입력 (Enter로 추가)"
      ),
      React.createElement('input', {
        ref: manualInputRef,
        type: "text",
        placeholder: "LPO-2024-001234",
        onKeyPress: handleManualInput,
        className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
        disabled: scannedItems.length >= maxItems
      })
    ),

    // 성공 스캔 목록
    scannedItems.length > 0 && React.createElement('div', { className: "space-y-2" },
      React.createElement('h4', { className: "font-medium text-gray-900" },
        `✅ 성공 스캔 (${scannedItems.length}개)`
      ),
      React.createElement('div', { className: "max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2" },
        React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2" },
          scannedItems.map((item, index) =>
            React.createElement('div', {
              key: index,
              className: "bg-green-50 border border-green-200 rounded px-2 py-1 text-sm"
            },
              React.createElement('span', { className: "font-mono" }, item)
            )
          )
        )
      )
    ),

    // 실패/오류 목록
    errorItems.length > 0 && React.createElement('div', { className: "space-y-2" },
      React.createElement('h4', { className: "font-medium text-red-700" },
        `❌ 실패/오류 (${errorItems.length}개)`
      ),
      React.createElement('div', { className: "max-h-32 overflow-y-auto border border-red-200 rounded-lg p-2 bg-red-50" },
        errorItems.map((item, idx) =>
          React.createElement('div', {
            key: idx,
            className: "flex justify-between text-sm text-red-700"
          },
            React.createElement('span', { className: "font-mono" }, item.lpo),
            React.createElement('span', null, `(${item.reason})`)
          )
        )
      )
    ),

    // 결과 요약
    results && React.createElement('div', { className: "bg-white border border-gray-200 rounded-lg p-6 space-y-4" },
      React.createElement('h4', { className: "text-lg font-semibold text-gray-900" }, "배치 스캔 완료"),
      React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-4 gap-4" },
        React.createElement('div', { className: "text-center" },
          React.createElement('p', { className: "text-2xl font-bold text-green-600" }, results.successCount),
          React.createElement('p', { className: "text-sm text-gray-600" }, "성공")
        ),
        React.createElement('div', { className: "text-center" },
          React.createElement('p', { className: "text-2xl font-bold text-red-600" }, results.errorCount),
          React.createElement('p', { className: "text-sm text-gray-600" }, "실패/에러")
        ),
        React.createElement('div', { className: "text-center" },
          React.createElement('p', { className: "text-2xl font-bold text-blue-600" },
            `${Math.round(results.totalTime / 1000)}s`
          ),
          React.createElement('p', { className: "text-sm text-gray-600" }, "소요시간")
        ),
        React.createElement('div', { className: "text-center" },
          React.createElement('p', { className: "text-2xl font-bold text-purple-600" },
            `${Math.round((results.successCount / (results.totalTime || 1)) * 1000 * 60)}/min`
          ),
          React.createElement('p', { className: "text-sm text-gray-600" }, "처리속도")
        )
      ),
      React.createElement('div', { className: "flex gap-2 justify-center" },
        React.createElement('button', {
          onClick: exportResults,
          className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        }, "📊 CSV 내보내기"),
        React.createElement('button', {
          onClick: clearResults,
          className: "px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        }, "🔄 새로 시작")
      )
    )
  );
};

export default BatchScanner; 