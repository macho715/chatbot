// components/ChatBox.tsx - Enhanced ChatBox with MOSB Entry System support

import React, { useState } from 'react';
import Link from 'next/link';
import LPOInboundMatch from './LPOInboundMatch';
import QRCodeGenerator from './molecules/QRCodeGenerator';
import ScanHistory from './organisms/ScanHistory';
import BatchScanner from './organisms/BatchScanner';

// 기존 ChatBox 컴포넌트에 MOSB 명령어 추가
const enhancedCommands = [
  // 기존 명령어들 (유지)
  "help - Show available commands",
  "status - Check system status", 
  "gate-pass [id] - Check gate pass status",
  
  // 🆕 새로운 MOSB 명령어들
  "mosb entry - Start MOSB gate entry application",
  "mosb status [id] - Check MOSB application status", 
  "lpo find [number] - Find LPO location",
  "lpo scan - Scan LPO QR code for location"
];

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
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{text: string | React.ReactNode, isUser: boolean}>>([
    { text: "Welcome to MOSB Gate Agent v2.0! Type 'help' for available commands.", isUser: false }
  ]);

  const handleCommand = (command: string) => {
    const cmd = command.toLowerCase().trim();
    
    // 기존 명령어 처리 (유지)
    if (cmd === 'help') {
      addMessage("Available commands:");
      enhancedCommands.forEach(cmd => addMessage(`• ${cmd}`));
      return;
    }
    
    // 🆕 새로운 MOSB 명령어 처리
    if (cmd === 'mosb entry') {
      addMessage("Redirecting to MOSB Entry Application...");
      setTimeout(() => {
        window.location.href = '/mosb-entry';
      }, 1000);
      return;
    }
    
    if (cmd.startsWith('mosb status')) {
      const id = cmd.split(' ')[2];
      if (id) {
        addMessage(`Checking status for application: ${id}`);
        addMessage("Please use the Application Status tab in MOSB Entry System for detailed status.");
        addMessage(<Link href="/mosb-entry?tab=status" className="text-blue-600 underline">→ Go to Status Check</Link>);
      } else {
        addMessage("Please provide application ID. Example: mosb status MSB-2024-001234");
      }
      return;
    }
    
    if (cmd.startsWith('lpo find')) {
      const lpoNumber = cmd.split(' ')[2];
      if (lpoNumber) {
        addMessage(`Searching location for LPO: ${lpoNumber}`);
        addMessage("Redirecting to LPO Location Finder...");
        setTimeout(() => {
          window.location.href = '/mosb-entry?tab=lpo';
        }, 1000);
      } else {
        addMessage("Please provide LPO number. Example: lpo find LPO-2024-001234");
      }
      return;
    }
    
    if (cmd === 'lpo scan') {
      addMessage("Opening LPO QR Scanner...");
      setTimeout(() => {
        window.location.href = '/mosb-entry?tab=lpo&action=scan';
      }, 1000);
      return;
    }
    
    // 기존 명령어 처리 로직 (유지)
    // ... existing command handling ...
    
    // 알 수 없는 명령어
    addMessage(`Unknown command: ${command}. Type 'help' for available commands.`);
  };

  const addMessage = (text: string | React.ReactNode, isUser = false) => {
    setMessages(prev => [...prev, { text, isUser }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    addMessage(input, true);
    handleCommand(input);
    setInput('');
  };

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
          <div className="space-y-4">
            {/* 기존 기능 버튼들 */}
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

            {/* 🆕 새로운 MOSB Entry 기능들 */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-2">✨</span>
                New: MOSB Entry System
              </h3>
              <div className="grid gap-3">
                <Link href="/mosb-entry">
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded border-2 border-green-400">
                    🚚 MOSB Entry Bot
                  </button>
                </Link>
                <Link href="/mosb-entry?tab=lpo">
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded border-2 border-green-400">
                    📍 LPO Location Finder
                  </button>
                </Link>
                <Link href="/mosb-entry?tab=status">
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded border-2 border-green-400">
                    📋 Application Status
                  </button>
                </Link>
              </div>
            </div>

            {/* Enhanced Chat Assistant */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Enhanced Chat Assistant</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="h-32 overflow-y-auto space-y-2 mb-3">
                  {messages.map((message, index) => (
                    <div key={index} className={`${message.isUser ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block p-2 rounded-lg text-sm ${
                        message.isUser 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {typeof message.text === 'string' ? message.text : message.text}
                      </div>
                    </div>
                  ))}
                </div>
                
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a command... (try 'mosb entry' or 'lpo find')"
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
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
