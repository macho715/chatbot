// components/organisms/LPOFinder.tsx - LPO 위치 조회 컴포넌트

import React, { useState } from 'react';
import { LPOLocation } from '../../types/mosb';
import { MOSBEntryService } from '../../services/MOSBEntryService';

interface LPOFinderProps {
  onLocationFound?: (location: LPOLocation) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const LPOFinder: React.FC<LPOFinderProps> = ({ 
  onLocationFound, 
  onError,
  className = ""
}) => {
  const [lpoNumber, setLpoNumber] = useState('');
  const [locationInfo, setLocationInfo] = useState<LPOLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const mosbService = new MOSBEntryService();

  // 검색 처리
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const searchTerm = lpoNumber.trim().toUpperCase();
    if (!searchTerm) return;

    // LPO 번호 형식 검증
    if (!mosbService.validateLPONumber(searchTerm)) {
      const errorMsg = 'LPO 번호 형식이 올바르지 않습니다. (예: LPO-2024-001234)';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const result = await mosbService.getLocationInfo(searchTerm);
      
      if (result) {
        setLocationInfo(result);
        onLocationFound?.(result);
        
        // 검색 히스토리 업데이트
        setSearchHistory(prev => {
          const newHistory = [searchTerm, ...prev.filter(item => item !== searchTerm)];
          return newHistory.slice(0, 5); // 최근 5개만 유지
        });
      } else {
        const errorMsg = '해당 LPO 번호를 찾을 수 없습니다. 번호를 확인해주세요.';
        setError(errorMsg);
        setLocationInfo(null);
        onError?.(errorMsg);
      }
    } catch (err) {
      const errorMsg = '조회 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      setError(errorMsg);
      setLocationInfo(null);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // QR 스캔 시뮬레이션 (실제로는 기존 QR 스캔 기능과 연동)
  const handleQRScan = () => {
    // 기존 QR 스캔 컴포넌트와 연동
    alert('QR 스캔 기능은 카메라 권한이 필요합니다.');
    // 실제 구현시:
    // import { QRCodeGenerator } from '../molecules/QRCodeGenerator';
    // QRCodeGenerator의 스캔 기능 호출
  };

  // 검색 히스토리에서 선택
  const handleHistorySelect = (historyItem: string) => {
    setLpoNumber(historyItem);
    setError('');
  };

  // 연락처 링크 생성
  const getPhoneLink = (contact: string) => {
    const cleanNumber = contact.replace(/[^0-9]/g, '');
    return `tel:${contact}`;
  };

  const getWhatsAppLink = (contact: string) => {
    const cleanNumber = contact.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNumber}`;
  };

  return (
    <div className={`max-w-lg mx-auto bg-white rounded-lg shadow-lg ${className}`}>
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 p-4 text-white">
        <h2 className="text-xl font-bold flex items-center">
          <span className="mr-2">📍</span>
          LPO Location Finder
        </h2>
        <p className="text-sm opacity-90">Find warehouse location & instructions</p>
      </div>

      <div className="p-6">
        {/* 검색 폼 */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              LPO Number
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={lpoNumber}
                onChange={(e) => {
                  setLpoNumber(e.target.value.toUpperCase());
                  if (error) setError(''); // 입력 시 에러 초기화
                }}
                placeholder="LPO-2024-001234"
                className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                  error ? 'border-red-500' : ''
                }`}
                maxLength={16}
                pattern="LPO-\d{4}-\d{6}"
              />
              <button
                type="submit"
                disabled={isLoading || !lpoNumber.trim()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    조회중
                  </span>
                ) : '검색'}
              </button>
            </div>
          </div>
        </form>

        {/* QR 스캔 버튼 */}
        <div className="mt-4 text-center">
          <button 
            onClick={handleQRScan}
            className="inline-flex items-center text-green-600 hover:text-green-800 text-sm font-medium"
          >
            <span className="mr-1">📱</span>
            QR 코드로 스캔하기
          </button>
        </div>

        {/* 검색 히스토리 */}
        {searchHistory.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">최근 검색</p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleHistorySelect(item)}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 오류 메시지 */}
        {error && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-3">
            <div className="flex">
              <span className="text-red-400 mr-2">❌</span>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="mt-4 text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-2 text-gray-600">위치 정보를 조회하고 있습니다...</p>
          </div>
        )}

        {/* 위치 정보 표시 */}
        {locationInfo && !isLoading && (
          <div className="mt-6 space-y-4">
            {/* 기본 위치 정보 */}
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                <span className="mr-2">📍</span>
                Location Information
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-green-700">LPO Number:</span>
                  <span className="font-mono text-green-800">{locationInfo.lpoNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-green-700">Building:</span>
                  <span className="text-green-800">{locationInfo.location.building}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-green-700">Zone:</span>
                  <span className="text-green-800">{locationInfo.location.zone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-green-700">Contact:</span>
                  <span className="text-blue-600 font-medium">{locationInfo.location.contact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-green-700">Hours:</span>
                  <span className="text-green-800">{locationInfo.location.operatingHours}</span>
                </div>
              </div>
            </div>

            {/* GPS 좌표 (있는 경우) */}
            {locationInfo.location.gpsCoordinate && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <h4 className="font-semibold text-blue-800 mb-2">
                  🗺️ GPS Coordinates
                </h4>
                <p className="text-blue-700 text-sm font-mono">
                  {locationInfo.location.gpsCoordinate[0]}, {locationInfo.location.gpsCoordinate[1]}
                </p>
                <a
                  href={`https://maps.google.com/maps?q=${locationInfo.location.gpsCoordinate[0]},${locationInfo.location.gpsCoordinate[1]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                >
                  Google Maps에서 보기
                </a>
              </div>
            )}

            {/* 주의사항 */}
            {locationInfo.location.instructions.length > 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">
                  ⚠️ Important Instructions
                </h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  {locationInfo.location.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 mt-0.5">•</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 연락하기 버튼들 */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={getPhoneLink(locationInfo.location.contact)}
                className="bg-blue-600 text-white py-3 rounded-lg text-center font-semibold hover:bg-blue-700 transition-colors"
              >
                📞 Call
              </a>
              <a
                href={getWhatsAppLink(locationInfo.location.contact)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white py-3 rounded-lg text-center font-semibold hover:bg-green-700 transition-colors"
              >
                💬 WhatsApp
              </a>
            </div>

            {/* 공유하기 버튼 */}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `LPO ${locationInfo.lpoNumber} Location`,
                    text: `Location: ${locationInfo.location.building}, ${locationInfo.location.zone}\nContact: ${locationInfo.location.contact}`,
                    url: window.location.href
                  });
                } else {
                  // 폴백: 클립보드에 복사
                  const text = `LPO ${locationInfo.lpoNumber}\nLocation: ${locationInfo.location.building}, ${locationInfo.location.zone}\nContact: ${locationInfo.location.contact}`;
                  navigator.clipboard.writeText(text).then(() => {
                    alert('위치 정보가 클립보드에 복사되었습니다.');
                  });
                }
              }}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              📤 Share Location Info
            </button>

            {/* 마지막 업데이트 시간 */}
            <div className="text-xs text-gray-500 text-center border-t pt-3">
              Last updated: {new Date(locationInfo.lastUpdated).toLocaleString('ko-KR')}
            </div>
          </div>
        )}

        {/* 도움말 */}
        {!locationInfo && !isLoading && !error && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">💡 사용 방법</h4>
            <ul className="text-gray-600 text-sm space-y-1">
              <li>• LPO 번호를 입력하여 창고 위치를 조회합니다</li>
              <li>• QR 코드 스캔으로 빠른 조회가 가능합니다</li>
              <li>• 연락처를 통해 직접 문의할 수 있습니다</li>
              <li>• GPS 좌표로 정확한 위치 안내를 제공합니다</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}; 