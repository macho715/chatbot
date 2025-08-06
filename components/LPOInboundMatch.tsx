import React from 'react';
import LPOScannerForm from './molecules/LPOScannerForm';
import LPOMatchingResult from './organisms/LPOMatchingResult';
import { useLPOMatching } from '../hooks/useLPOMatching';

const LPOInboundMatch: React.FC = () => {
  const { result, loading, error, queryLPO, reset } = useLPOMatching();

  return (
    <div className="space-y-6">
      <LPOScannerForm
        onScanned={queryLPO}
        loading={loading}
        error={error}
      />
      
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      )}
      
      {result && (
        <LPOMatchingResult
          result={result}
          onReset={reset}
        />
      )}
    </div>
  );
};

export default LPOInboundMatch; 