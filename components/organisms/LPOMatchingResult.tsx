import React from 'react';
import Button from '../atoms/Button';
import { MatchingResult } from '../../services/MatchingService';

export interface LPOMatchingResultProps {
  result: MatchingResult;
  onReset: () => void;
}

const LPOMatchingResult: React.FC<LPOMatchingResultProps> = ({
  result,
  onReset
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MATCH':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'MISSING':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'EXCESS':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'MATCH':
        return '✅';
      case 'MISSING':
        return '❌';
      case 'EXCESS':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const summary = result.items.reduce(
    (acc, item) => {
      acc[item.status.toLowerCase()]++;
      return acc;
    },
    { match: 0, missing: 0, excess: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">LPO: {result.lpoNo}</h3>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600">✅ 일치: {summary.match}</span>
          <span className="text-red-600">❌ 누락: {summary.missing}</span>
          <span className="text-yellow-600">⚠️ 초과: {summary.excess}</span>
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {result.items.map((item, index) => (
          <div
            key={`${item.itemCode}-${index}`}
            className={`p-4 rounded-lg border ${getStatusColor(item.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getStatusIcon(item.status)}</span>
                  <span className="font-medium">{item.itemName}</span>
                  <span className="text-sm text-gray-500">({item.itemCode})</span>
                </div>
                <div className="mt-1 text-sm">
                  <span>발주: {item.lpoQuantity} • </span>
                  <span>수령: {item.inboundQuantity}</span>
                  {item.difference !== 0 && (
                    <span className={`ml-2 ${item.difference > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                      ({item.difference > 0 ? '+' : ''}{item.difference})
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={onReset}
          variant="secondary"
          className="flex-1"
        >
          다시 확인
        </Button>
      </div>
    </div>
  );
};

export default LPOMatchingResult; 