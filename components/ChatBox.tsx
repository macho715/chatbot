import React, { useState } from 'react';
import LPOInboundMatch from './LPOInboundMatch';
import QRCodeGenerator from './molecules/QRCodeGenerator';
import ScanHistory from './organisms/ScanHistory';
import BatchScanner from './organisms/BatchScanner';

// Placeholder components for each menu entry (to be expanded later)
function GatePassStatus() {
  return <p className="p-4">🔄 Gate Pass 상태 조회 모듈 (API 연동 예정)</p>;
}

function VehicleETA() {
  return <p className="p-4">🚚 차량 ETA 등록 화면 (드라이버/담당자 입력)</p>;
}

function DocumentUpload() {
  return <p className="p-4">📤 PPE / MSDS 등 문서 업로드 기능 (파일 업로드 예정)</p>;
}

function EntryHistory() {
  return <p className="p-4">🧾 최근 출입 이력 표시 (DB 연동 예정)</p>;
}

function NoticeBoard() {
  return <p className="p-4">📢 공지사항 및 알림 확인 (관리자 Push 예정)</p>;
}

function LPOInbound() {
  return <LPOInboundMatch />;
}

function QRGenerator() {
  return <QRCodeGenerator />;
}

function HistoryView() {
  return (
    <ScanHistory 
      onSelectLPO={(lpoNumber) => {
        // TODO: LPO 번호를 LPOInboundMatch에 전달하는 로직 추가
        console.log('Selected LPO:', lpoNumber);
      }} 
    />
  );
}

function BatchScanView() {
  return (
    <BatchScanner 
      onBatchComplete={(result) => {
        console.log('Batch scan completed:', result);
      }}
    />
  );
}

export default function MOSBGateAgentApp() {
  const [view, setView] = useState<'menu' | 'gate' | 'eta' | 'doc' | 'history' | 'notice' | 'lpo' | 'qr' | 'scan-history' | 'batch-scan'>('menu');

  const renderView = () => {
    switch (view) {
      case 'gate': return <GatePassStatus />;
      case 'eta': return <VehicleETA />;
      case 'doc': return <DocumentUpload />;
      case 'history': return <EntryHistory />;
      case 'notice': return <NoticeBoard />;
      case 'lpo': return <LPOInbound />;
      case 'qr': return <QRGenerator />;
      case 'scan-history': return <HistoryView />;
      case 'batch-scan': return <BatchScanView />;
      default:
        return (
          <div className="grid gap-3">
            <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setView('gate')}>🔄 Gate Pass 조회</button>
            <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setView('eta')}>🚚 차량 ETA 등록</button>
            <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setView('doc')}>📤 문서 제출 (PPE / MSDS)</button>
            <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setView('history')}>🧾 출입 이력 보기</button>
            <button className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => setView('notice')}>📢 공지사항 확인</button>
            <button className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => setView('lpo')}>📦 LPO 인바운드 매치</button>
            <button className="w-full bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" onClick={() => setView('qr')}>📱 QR 코드 생성</button>
            <button className="w-full bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded" onClick={() => setView('scan-history')}>📋 스캔 히스토리</button>
            <button className="w-full bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded" onClick={() => setView('batch-scan')}>🚀 배치 스캔</button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="rounded-2xl shadow-lg bg-white">
        <div className="p-6">
          <div className="h-[420px] pr-4 overflow-y-auto">
            {renderView()}
            {view !== 'menu' && (
              <button className="mt-6 w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded" onClick={() => setView('menu')}>🔙 메뉴로 돌아가기</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
