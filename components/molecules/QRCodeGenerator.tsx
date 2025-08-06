'use client';

import React, { useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Button from '../atoms/Button';
import Input from '../atoms/Input';

export interface QRCodeGeneratorProps {
  lpoNumber?: string;
  onGenerate?: (qrData: string) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  lpoNumber = '', 
  onGenerate 
}) => {
  const [inputValue, setInputValue] = useState(lpoNumber);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  const handleGenerate = useCallback(() => {
    if (inputValue.trim()) {
      const qrData = inputValue.trim();
      setGeneratedQR(qrData);
      setShowQR(true);
      onGenerate?.(qrData);
    }
  }, [inputValue, onGenerate]);

  const handleDownload = useCallback(() => {
    if (!generatedQR) return;

    // SVG를 다운로드하기 위한 캔버스 생성
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svg = document.querySelector('#qr-code-svg') as SVGElement;
    
    if (svg && ctx) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 256;
        canvas.height = 256;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 256, 256);
        ctx.drawImage(img, 0, 0, 256, 256);
        
        // 다운로드 링크 생성
        const link = document.createElement('a');
        link.download = `LPO_${generatedQR}_QR.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  }, [generatedQR]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  }, [handleGenerate]);

  return (
    <div className="space-y-6">
      {/* 입력 섹션 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">QR 코드 생성</h3>
        
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={setInputValue}
            placeholder="LPO 번호를 입력하세요"
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleGenerate}
            disabled={!inputValue.trim()}
            variant="primary"
          >
            생성
          </Button>
        </div>
      </div>

      {/* QR 코드 표시 섹션 */}
      {showQR && generatedQR && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-center space-y-4">
              {/* QR 코드 */}
              <div className="flex justify-center">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={generatedQR}
                  size={200}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#000000"
                  includeMargin={true}
                />
              </div>
              
              {/* LPO 번호 표시 */}
              <div className="text-sm text-gray-600">
                <p className="font-medium">LPO 번호:</p>
                <p className="text-lg font-mono bg-gray-100 px-2 py-1 rounded">
                  {generatedQR}
                </p>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleDownload}
                  variant="success"
                  size="sm"
                >
                  📥 다운로드
                </Button>
                <Button
                  onClick={() => setShowQR(false)}
                  variant="secondary"
                  size="sm"
                >
                  닫기
                </Button>
              </div>
            </div>
          </div>

          {/* 사용 안내 */}
          <div className="text-center text-sm text-gray-500">
            <p>생성된 QR 코드를 스캔하여 LPO 번호를 빠르게 입력할 수 있습니다.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator; 