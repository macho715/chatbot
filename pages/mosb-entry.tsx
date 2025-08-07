// pages/mosb-entry.tsx - MOSB Entry System 메인 페이지

import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { MOSBEntryBot } from '../components/organisms/MOSBEntryBot';
import { LPOFinder } from '../components/organisms/LPOFinder';
import BatchScanner from '../components/organisms/BatchScanner';
import ScanHistory from '../components/organisms/ScanHistory';
import { DriverApplication, LPOLocation } from '../types/mosb';
import { BatchScanResult } from '../components/organisms/BatchScanner';

const MOSBEntryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'entry' | 'lpo' | 'batch' | 'history' | 'status'>('entry');
  const [recentApplication, setRecentApplication] = useState<DriverApplication | null>(null);
  const [recentLocation, setRecentLocation] = useState<LPOLocation | null>(null);
  const [recentBatchResult, setRecentBatchResult] = useState<BatchScanResult | null>(null);
  const [selectedHistoryLPO, setSelectedHistoryLPO] = useState<string | null>(null);
  
  // 통합 히스토리 상태 관리
  const [scanHistory, setScanHistory] = useState<Array<{
    id: string;
    lpoNumber: string;
    status: 'success' | 'error';
    timestamp: number;
    metadata?: any;
  }>>([]);

  // 신청서 제출 완료 처리
  const handleApplicationSubmit = useCallback((application: DriverApplication) => {
    setRecentApplication(application);
    console.log('Application submitted:', application);
  }, []);

  // LPO 위치 조회 완료 처리
  const handleLocationFound = useCallback((location: LPOLocation) => {
    setRecentLocation(location);
    console.log('Location found:', location);
  }, []);

  // 배치 스캔 완료 처리
  const handleBatchComplete = useCallback((result: BatchScanResult) => {
    setRecentBatchResult(result);
    console.log('Batch scan completed:', result);
  }, []);

  // 스캔 히스토리 업데이트 처리 (BatchScanner에서 호출)
  const handleScanHistoryUpdate = useCallback((lpoNumber: string, status: 'success' | 'error', metadata?: any) => {
    const newHistoryItem = {
      id: Date.now().toString(),
      lpoNumber,
      status,
      timestamp: Date.now(),
      metadata
    };
    setScanHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]); // 최대 50개 유지
    console.log('Scan history updated:', newHistoryItem);
  }, []);

  // 히스토리에서 LPO 선택 처리
  const handleHistoryLPOSelect = useCallback((lpoNumber: string) => {
    setSelectedHistoryLPO(lpoNumber);
    console.log('History LPO selected:', lpoNumber);
    // LPO Finder 탭으로 이동하여 해당 LPO 검색
    setActiveTab('lpo');
  }, []);

  // 에러 처리
  const handleError = useCallback((error: string) => {
    console.error('MOSB Error:', error);
  }, []);

  const tabs = [
    {
      id: 'entry',
      title: '🚚 Gate Entry Application',
      subtitle: 'MOSB 출입 신청',
      description: 'Submit documents for MOSB gate entry approval'
    },
    {
      id: 'lpo',
      title: '📍 LPO Location Finder', 
      subtitle: 'LPO 위치 조회',
      description: 'Find warehouse location and contact information'
    },
    {
      id: 'batch',
      title: '📦 Batch LPO Scanner',
      subtitle: '배치 LPO 스캐너',
      description: 'Scan multiple LPOs for batch processing'
    },
    {
      id: 'history',
      title: '📋 Scan History',
      subtitle: '스캔 히스토리',
      description: 'View and manage scan history'
    },
    {
      id: 'status',
      title: '📊 Application Status',
      subtitle: '신청 현황',
      description: 'Check your application status'
    }
  ];

  return React.createElement(React.Fragment, null,
    React.createElement(Head, null,
      React.createElement('title', null, "MOSB Entry System | Samsung C&T Logistics"),
      React.createElement('meta', { name: "description", content: "MOSB Gate Entry Application System - Submit documents and find LPO locations" }),
      React.createElement('meta', { name: "keywords", content: "MOSB, gate entry, logistics, UAE, Abu Dhabi, Samsung C&T" }),
      React.createElement('meta', { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
      React.createElement('link', { rel: "icon", href: "/favicon.ico" }),
      React.createElement('meta', { property: "og:title", content: "MOSB Entry System" }),
      React.createElement('meta', { property: "og:description", content: "Gate Entry Application System for MOSB Abu Dhabi" }),
      React.createElement('meta', { property: "og:type", content: "website" }),
      React.createElement('meta', { name: "theme-color", content: "#2563eb" }),
      React.createElement('meta', { name: "mobile-web-app-capable", content: "yes" }),
      React.createElement('meta', { name: "apple-mobile-web-app-capable", content: "yes" }),
      React.createElement('meta', { name: "apple-mobile-web-app-status-bar-style", content: "default" }),
      React.createElement('meta', { name: "apple-mobile-web-app-title", content: "MOSB Entry" })
    ),
    React.createElement('div', { className: "min-h-screen bg-gray-100" },
      // 헤더
      React.createElement('header', { className: "bg-white shadow-sm border-b" },
        React.createElement('div', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
          React.createElement('div', { className: "flex items-center justify-between h-16" },
            // 로고 및 제목
            React.createElement('div', { className: "flex items-center" },
              React.createElement(Link, { href: "/", className: "flex items-center space-x-3" },
                React.createElement('div', null,
                  React.createElement('div', { className: "w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center" },
                    React.createElement('span', { className: "text-white font-bold text-lg" }, "S")
                  ),
                  React.createElement('div', null,
                    React.createElement('h1', { className: "text-xl font-bold text-gray-900" }, "MOSB Entry System"),
                    React.createElement('p', { className: "text-xs text-gray-500" }, "Samsung C&T Logistics")
                  )
                )
              )
            ),
            // 네비게이션 링크
            React.createElement('nav', { className: "hidden md:flex items-center space-x-6" },
              React.createElement(Link, { href: "/", className: "text-gray-600 hover:text-gray-900" }, "← Main Dashboard"),
              React.createElement('div', { className: "flex items-center space-x-2 text-sm" },
                React.createElement('span', { className: "w-2 h-2 bg-green-400 rounded-full" }),
                React.createElement('span', { className: "text-gray-600" }, "System Online")
              )
            ),
            // 모바일 메뉴 버튼
            React.createElement('div', { className: "md:hidden" },
              React.createElement(Link, { href: "/", className: "text-gray-600 hover:text-gray-900" },
                React.createElement('svg', { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                  React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M10 19l-7-7m0 0l7-7m-7 7h18" })
                )
              )
            )
          )
        )
      ),

      // 메인 컨텐츠
      React.createElement('main', { className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8" },
        // 페이지 제목
        React.createElement('div', { className: "px-4 sm:px-0 mb-8" },
          React.createElement('h2', { className: "text-3xl font-bold text-gray-900 mb-2" }, "MOSB Entry System"),
          React.createElement('p', { className: "text-gray-600" }, "Samsung C&T Logistics - Abu Dhabi MOSB Gate Entry Management")
        ),

        // 통합 워크플로우 안내 (히스토리가 있을 때)
        scanHistory.length > 0 && React.createElement('div', { className: "px-4 sm:px-0 mb-6" },
          React.createElement('div', { className: "bg-blue-50 border border-blue-200 rounded-lg p-4" },
            React.createElement('div', { className: "flex items-center" },
              React.createElement('span', { className: "text-blue-600 mr-2" }, "🔄"),
              React.createElement('div', null,
                React.createElement('p', { className: "font-medium text-blue-900" }, "통합 워크플로우 활성화"),
                React.createElement('p', { className: "text-sm text-blue-700" },
                  "배치 스캔 → 히스토리 → 위치 조회가 자동으로 연동됩니다. ",
                  React.createElement('span', { className: "font-medium" }, `${scanHistory.length}개`),
                  " 스캔 기록이 있습니다."
                )
              )
            )
          )
        ),

        // 탭 네비게이션
        React.createElement('div', { className: "px-4 sm:px-0 mb-6" },
          React.createElement('div', { className: "border-b border-gray-200" },
            React.createElement('nav', { className: "-mb-px flex space-x-8 overflow-x-auto" },
              tabs.map((tab) =>
                React.createElement('button', {
                  key: tab.id,
                  onClick: () => setActiveTab(tab.id as any),
                  className: `whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`
                },
                  React.createElement('div', { className: "text-center" },
                    React.createElement('div', { className: "text-lg mb-1" }, tab.title.split(' ')[0]),
                    React.createElement('div', { className: "text-xs" }, tab.subtitle)
                  )
                )
              )
            )
          )
        ),

        // 탭 컨텐츠
        React.createElement('div', { className: "px-4 sm:px-0" },
          // Gate Entry Application 탭
          activeTab === 'entry' && React.createElement('div', { className: "space-y-6" },
            React.createElement('div', { className: "bg-white rounded-lg shadow-sm border p-6" },
              React.createElement('div', { className: "text-center mb-6" },
                React.createElement('h3', { className: "text-2xl font-bold text-gray-900 mb-2" }, "🚚 Gate Entry Application"),
                React.createElement('p', { className: "text-gray-600" }, "Submit your documents for MOSB gate entry approval")
              ),
              React.createElement(MOSBEntryBot, {
                onApplicationSubmit: handleApplicationSubmit,
                onError: handleError
              })
            )
          ),

          // LPO Location Finder 탭
          activeTab === 'lpo' && React.createElement('div', { className: "space-y-6" },
            React.createElement('div', { className: "bg-white rounded-lg shadow-sm border p-6" },
              React.createElement('div', { className: "text-center mb-6" },
                React.createElement('h3', { className: "text-2xl font-bold text-gray-900 mb-2" }, "📍 LPO Location Finder"),
                React.createElement('p', { className: "text-gray-600" }, "Find warehouse location and contact information for your LPO")
              ),
              selectedHistoryLPO && React.createElement('div', { className: "mb-4 p-3 bg-green-50 border border-green-200 rounded-lg" },
                React.createElement('div', { className: "flex items-center" },
                  React.createElement('span', { className: "text-green-600 mr-2" }, "🔄"),
                  React.createElement('p', { className: "text-sm text-green-700" },
                    "히스토리에서 선택된 LPO: ", React.createElement('span', { className: "font-mono font-medium" }, selectedHistoryLPO)
                  )
                )
              ),
              React.createElement(LPOFinder, {
                onLocationFound: handleLocationFound,
                onError: handleError,
                initialLPO: selectedHistoryLPO || undefined
              })
            )
          ),

          // Batch LPO Scanner 탭
          activeTab === 'batch' && React.createElement('div', { className: "space-y-6" },
            React.createElement('div', { className: "bg-white rounded-lg shadow-sm border p-6" },
              React.createElement('div', { className: "text-center mb-6" },
                React.createElement('h3', { className: "text-2xl font-bold text-gray-900 mb-2" }, "📦 Batch LPO Scanner"),
                React.createElement('p', { className: "text-gray-600" }, "Scan multiple LPOs for efficient batch processing")
              ),
              React.createElement(BatchScanner, {
                onBatchComplete: handleBatchComplete,
                onScanHistoryUpdate: handleScanHistoryUpdate,
                maxItems: 100
              })
            )
          ),

          // Scan History 탭
          activeTab === 'history' && React.createElement('div', { className: "space-y-6" },
            React.createElement('div', { className: "bg-white rounded-lg shadow-sm border p-6" },
              React.createElement('div', { className: "text-center mb-6" },
                React.createElement('h3', { className: "text-2xl font-bold text-gray-900 mb-2" }, "📋 Scan History"),
                React.createElement('p', { className: "text-gray-600" }, "View and manage scan history with detailed information")
              ),
              React.createElement(ScanHistory, {
                onSelectLPO: handleHistoryLPOSelect,
                maxItems: 20
              })
            )
          ),

          // Application Status 탭
          activeTab === 'status' && React.createElement('div', { className: "space-y-6" },
            React.createElement('div', { className: "bg-white rounded-lg shadow-sm border p-6" },
              React.createElement('div', { className: "text-center mb-6" },
                React.createElement('h3', { className: "text-2xl font-bold text-gray-900 mb-2" }, "📊 Application Status"),
                React.createElement('p', { className: "text-gray-600" }, "Check the status of your recent applications and activities")
              ),
              
              // 최근 활동 요약
              React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                // 최근 신청서
                recentApplication && React.createElement('div', { className: "bg-blue-50 border border-blue-200 rounded-lg p-4" },
                  React.createElement('h4', { className: "font-semibold text-blue-900 mb-2" }, "📝 최근 신청서"),
                  React.createElement('div', { className: "space-y-1 text-sm" },
                    React.createElement('p', null, "운전자: ", recentApplication.driverName),
                    React.createElement('p', null, "회사: ", recentApplication.company),
                    React.createElement('p', null, "상태: ", 
                      React.createElement('span', { className: "px-2 py-1 bg-green-100 text-green-800 rounded text-xs" }, 
                        recentApplication.status
                      )
                    ),
                    React.createElement('p', { className: "text-xs text-gray-500" },
                      "제출: ", new Date(recentApplication.submittedAt).toLocaleString()
                    )
                  )
                ),

                // 최근 위치 조회
                recentLocation && React.createElement('div', { className: "bg-green-50 border border-green-200 rounded-lg p-4" },
                  React.createElement('h4', { className: "font-semibold text-green-900 mb-2" }, "📍 최근 위치 조회"),
                  React.createElement('div', { className: "space-y-1 text-sm" },
                    React.createElement('p', null, "LPO: ", recentLocation.lpoNumber),
                    React.createElement('p', null, "건물: ", recentLocation.location.building),
                    React.createElement('p', null, "구역: ", recentLocation.location.zone),
                    React.createElement('p', { className: "text-xs text-gray-500" },
                      "조회: ", new Date(recentLocation.lastUpdated).toLocaleString()
                    )
                  )
                ),

                // 최근 배치 스캔
                recentBatchResult && React.createElement('div', { className: "bg-purple-50 border border-purple-200 rounded-lg p-4" },
                  React.createElement('h4', { className: "font-semibold text-purple-900 mb-2" }, "📦 최근 배치 스캔"),
                  React.createElement('div', { className: "space-y-1 text-sm" },
                    React.createElement('p', null, "성공: ", recentBatchResult.successCount, "개"),
                    React.createElement('p', null, "실패: ", recentBatchResult.errorCount, "개"),
                    React.createElement('p', null, "소요시간: ", Math.round(recentBatchResult.totalTime / 1000), "초"),
                    React.createElement('p', { className: "text-xs text-gray-500" },
                      "완료: ", new Date(recentBatchResult.endTime).toLocaleString()
                    )
                  )
                )
              ),

              // 활동이 없을 때
              !recentApplication && !recentLocation && !recentBatchResult && React.createElement('div', { className: "text-center py-8" },
                React.createElement('div', { className: "text-6xl mb-4" }, "📋"),
                React.createElement('h4', { className: "text-lg font-medium text-gray-900 mb-2" }, "활동 내역이 없습니다"),
                React.createElement('p', { className: "text-gray-600" }, "다른 탭에서 기능을 사용해보세요")
              )
            )
          )
        )
      )
    )
  );
};

export default MOSBEntryPage; 