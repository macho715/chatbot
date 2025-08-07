// components/organisms/LPOFinder.tsx - LPO 위치 조회 컴포넌트

import React, { useState, useCallback, useEffect } from 'react';
import MOSBEntryService from '../../services/MOSBEntryService';
import { QRCodeScanner } from '../molecules/QRCodeScanner';
import { LocationResult } from '../../services/MOSBEntryService';

export interface LPOFinderProps {
  onLocationFound?: (location: LocationResult) => void;
  onError?: (error: string) => void;
  initialLPO?: string; // 초기 검색어 추가
  className?: string;
}

export const LPOFinder: React.FC<LPOFinderProps> = ({
  onLocationFound,
  onError,
  initialLPO = '',
  className = ''
}) => {
  const [lpoNumber, setLpoNumber] = useState(initialLPO);
  const [locationInfo, setLocationInfo] = useState<LocationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);

  // initialLPO가 변경되면 자동으로 검색 실행
  useEffect(() => {
    if (initialLPO && initialLPO !== lpoNumber) {
      setLpoNumber(initialLPO);
      handleSearch(initialLPO);
    }
  }, [initialLPO]);

  const handleSearch = useCallback(async (searchLPO: string) => {
    if (!searchLPO.trim()) {
      setError('LPO 번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');
    setLocationInfo(null);

    try {
      const service = new MOSBEntryService();
      const result = await service.getLocationInfo(searchLPO);

      if (result) {
        setLocationInfo(result);
        onLocationFound?.(result);
      } else {
        setError('해당 LPO 번호를 찾을 수 없습니다. 번호를 확인해주세요.');
        onError?.('LPO not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '위치 정보를 가져오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onLocationFound, onError]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(lpoNumber);
  }, [lpoNumber, handleSearch]);

  const handleQRScanSuccess = useCallback((decodedText: string) => {
    console.log('QR Code scanned:', decodedText);
    const lpoMatch = decodedText.match(/LPO-\d{4}-\d{6}/);
    if (lpoMatch) {
      const extractedLPO = lpoMatch[0];
      setLpoNumber(extractedLPO);
      handleSearch(extractedLPO);
      setShowQRScanner(false);
    } else {
      setError('QR 코드에 유효한 LPO 번호가 없습니다.');
      setShowQRScanner(false);
    }
  }, [handleSearch]);

  const handleQRScanError = useCallback((error: string) => {
    console.log('QR Scan error:', error);
    setError(`QR 스캔 오류: ${error}`);
    setShowQRScanner(false);
  }, []);

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

  return React.createElement('div', { className: `space-y-6 ${className}` },
    // 헤더
    React.createElement('div', { className: "text-center" },
      React.createElement('h3', { className: "text-2xl font-bold text-gray-900" }, "📍 LPO 위치 조회"),
      React.createElement('p', { className: "text-gray-600" },
        "LPO 번호를 입력하거나 QR 코드를 스캔하여 위치 정보를 확인하세요"
      )
    ),

    // 검색 폼
    React.createElement('form', { onSubmit: handleSubmit, className: "space-y-4" },
      React.createElement('div', { className: "flex gap-2" },
        React.createElement('input', {
          type: "text",
          value: lpoNumber,
          onChange: (e) => setLpoNumber(e.target.value),
          placeholder: "LPO-2024-001234",
          className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
          disabled: isLoading
        }),
        React.createElement('button', {
          type: "submit",
          disabled: isLoading || !lpoNumber.trim(),
          className: "px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        }, isLoading ? "검색 중..." : "검색"),
        React.createElement('button', {
          type: "button",
          onClick: () => setShowQRScanner(true),
          className: "px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        },
          React.createElement('span', { className: "mr-2" }, "📱"),
          "QR 스캔"
        )
      )
    ),

    // 에러 메시지
    error && React.createElement('div', { className: "bg-red-50 border border-red-200 rounded-lg p-4" },
      React.createElement('div', { className: "flex items-center" },
        React.createElement('span', { className: "text-red-500 mr-2" }, "⚠️"),
        React.createElement('p', { className: "text-red-700" }, error)
      )
    ),

    // 로딩 상태
    isLoading && React.createElement('div', { className: "text-center py-8" },
      React.createElement('div', { className: "inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }),
      React.createElement('p', { className: "mt-2 text-gray-600" }, "위치 정보를 검색하고 있습니다...")
    ),

    // 위치 정보 결과
    locationInfo && React.createElement('div', { className: "bg-white border border-gray-200 rounded-lg p-6 shadow-sm" },
      React.createElement('h4', { className: "text-lg font-semibold text-gray-900 mb-4" }, "📍 위치 정보"),
      
      // 기본 정보
      React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" },
        React.createElement('div', { className: "flex items-center" },
          React.createElement('span', { className: "text-green-600 mr-2" }, "🏢"),
          React.createElement('span', { className: "font-medium" }, "건물: "),
          React.createElement('span', null, locationInfo.location.building)
        ),
        React.createElement('div', { className: "flex items-center" },
          React.createElement('span', { className: "text-purple-600 mr-2" }, "📍"),
          React.createElement('span', { className: "font-medium" }, "구역: "),
          React.createElement('span', null, locationInfo.location.zone)
        ),
        React.createElement('div', { className: "flex items-center" },
          React.createElement('span', { className: "text-blue-600 mr-2" }, "📞"),
          React.createElement('span', { className: "font-medium" }, "연락처: "),
          React.createElement('span', null, locationInfo.location.contact)
        ),
        React.createElement('div', { className: "flex items-center" },
          React.createElement('span', { className: "text-orange-600 mr-2" }, "��"),
          React.createElement('span', { className: "font-medium" }, "운영시간: "),
          React.createElement('span', null, locationInfo.location.operatingHours)
        )
      ),

      // 지시사항
      React.createElement('div', { className: "mb-6" },
        React.createElement('h5', { className: "font-medium text-gray-900 mb-2" }, "📋 지시사항"),
        React.createElement('ul', { className: "list-disc list-inside space-y-1 text-gray-600" },
          locationInfo.location.instructions.map((instruction, index) =>
            React.createElement('li', { key: index }, instruction)
          )
        )
      ),

      // GPS 좌표 (있는 경우)
      locationInfo.location.gpsCoordinate && React.createElement('div', { className: "mt-4 p-3 bg-gray-50 rounded-lg" },
        React.createElement('div', { className: "flex items-center mb-2" },
          React.createElement('span', { className: "text-blue-600 mr-2" }, "🗺️"),
          React.createElement('span', { className: "font-medium" }, "GPS 좌표")
        ),
        React.createElement('p', { className: "font-mono text-sm" }, 
          `${locationInfo.location.gpsCoordinate[0]}, ${locationInfo.location.gpsCoordinate[1]}`
        )
      ),

      // 마지막 업데이트
      React.createElement('div', { className: "mt-4 text-sm text-gray-500" },
        React.createElement('span', null, "마지막 업데이트: "),
        React.createElement('span', null, locationInfo.lastUpdated.toLocaleString('ko-KR'))
      )
    ),

    // 사용 안내
    !locationInfo && !isLoading && !error && React.createElement('div', { className: "text-center py-8 text-gray-500" },
      React.createElement('div', { className: "text-4xl mb-4" }, "📍"),
      React.createElement('h4', { className: "text-lg font-medium text-gray-900 mb-2" }, "LPO 위치 조회"),
      React.createElement('p', { className: "text-sm" },
        "LPO 번호를 입력하거나 QR 코드를 스캔하여", React.createElement('br'),
        "해당 물품의 정확한 위치 정보를 확인하세요."
      )
    )
  );
}; 