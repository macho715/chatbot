import React from 'react';
import Input from '../atoms/Input';
import Button from '../atoms/Button';
import QRScanner from './QRScanner';

export interface LPOScannerFormProps {
  onScanned: (code: string) => void;
  loading?: boolean;
  error?: string;
}

const LPOScannerForm: React.FC<LPOScannerFormProps> = ({
  onScanned,
  loading = false,
  error
}) => {
  const [manual, setManual] = React.useState('');

  const handleSubmit = () => {
    if (manual.trim() && !loading) {
      onScanned(manual.trim());
      setManual('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* QR/바코드 스캔 옵션 */}
      <QRScanner onScanned={onScanned} disabled={loading} />
      
      {/* 구분선 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">또는</span>
        </div>
      </div>

      {/* 수동 입력 */}
      <div className="flex gap-2">
        <Input
          value={manual}
          onChange={setManual}
          placeholder="LPO 번호를 입력하세요"
          onKeyPress={handleKeyPress}
          disabled={loading}
          error={error}
        />
        <Button
          onClick={handleSubmit}
          disabled={loading || !manual.trim()}
          variant="primary"
        >
          {loading ? '확인 중...' : '확인'}
        </Button>
      </div>
    </div>
  );
};

export default LPOScannerForm; 