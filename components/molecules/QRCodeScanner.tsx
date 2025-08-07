import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  onClose?: () => void;
  className?: string;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScanSuccess,
  onScanError,
  onClose,
  className = ""
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string>('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 스캐너 초기화
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
      },
      false
    );

    scannerRef.current = scanner;

    // 성공 콜백
    const onScanSuccessHandler = (decodedText: string, decodedResult: any) => {
      console.log('QR Code scanned:', decodedText);
      onScanSuccess(decodedText);
      stopScanner();
    };

    // 에러 콜백
    const onScanErrorHandler = (errorMessage: string) => {
      console.log('QR Scan error:', errorMessage);
      setScanError(errorMessage);
      onScanError?.(errorMessage);
    };

    // 스캐너 시작
    scanner.render(onScanSuccessHandler, onScanErrorHandler);
    setIsScanning(true);

    // 클린업
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [onScanSuccess, onScanError]);

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
    onClose?.();
  };

  const restartScanner = () => {
    setScanError('');
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    // 스캐너 재시작을 위해 useEffect 재실행
    setIsScanning(false);
    setTimeout(() => setIsScanning(true), 100);
  };

  return React.createElement('div', { className: `qr-scanner-container ${className}` },
    // 헤더
    React.createElement('div', { className: "bg-blue-600 text-white p-4 rounded-t-lg" },
      React.createElement('div', { className: "flex items-center justify-between" },
        React.createElement('h3', { className: "text-lg font-semibold flex items-center" },
          React.createElement('span', { className: "mr-2" }, "📱"),
          "QR Code Scanner"
        ),
        React.createElement('button', {
          onClick: stopScanner,
          className: "text-white hover:text-gray-200"
        },
          React.createElement('svg', { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
            React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" })
          )
        )
      ),
      React.createElement('p', { className: "text-sm opacity-90 mt-1" }, "LPO QR 코드를 스캔하세요")
    ),

    // 스캐너 컨테이너
    React.createElement('div', { className: "bg-white p-4" },
      // 에러 메시지
      scanError && React.createElement('div', { className: "mb-4 bg-red-50 border border-red-200 rounded-lg p-3" },
        React.createElement('div', { className: "flex items-center" },
          React.createElement('span', { className: "text-red-500 mr-2" }, "⚠️"),
          React.createElement('p', { className: "text-red-700 text-sm" }, scanError)
        ),
        React.createElement('button', {
          onClick: restartScanner,
          className: "mt-2 text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        }, "다시 시도")
      ),

      // 카메라 권한 안내
      !isScanning && !scanError && React.createElement('div', { className: "text-center py-8" },
        React.createElement('div', { className: "text-4xl mb-4" }, "📱"),
        React.createElement('h4', { className: "text-lg font-medium text-gray-900 mb-2" }, "카메라 권한이 필요합니다"),
        React.createElement('p', { className: "text-gray-600 text-sm mb-4" }, "QR 코드 스캔을 위해 카메라 접근을 허용해주세요"),
        React.createElement('button', {
          onClick: restartScanner,
          className: "bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        }, "카메라 시작")
      ),

      // 스캐너 뷰포트
      React.createElement('div', {
        ref: containerRef,
        id: "qr-reader",
        className: "w-full"
      })
    ),

    // 하단 안내
    React.createElement('div', { className: "bg-gray-50 p-4 rounded-b-lg" },
      React.createElement('div', { className: "text-sm text-gray-600 space-y-1" },
        React.createElement('p', null, "💡 QR 코드를 카메라에 맞춰주세요"),
        React.createElement('p', null, "📋 LPO 번호가 포함된 QR 코드만 스캔 가능합니다"),
        React.createElement('p', null, "🔒 스캔된 정보는 안전하게 처리됩니다")
      )
    )
  );
};

// HTML5 QR 코드 스캔 타입 enum (타입 정의)
enum Html5QrcodeScanType {
  SCAN_TYPE_CAMERA = 0,
  SCAN_TYPE_FILE = 1
} 