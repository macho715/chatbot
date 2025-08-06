// pages/mosb-entry.tsx - MOSB Entry System 메인 페이지

import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { MOSBEntryBot } from '../components/organisms/MOSBEntryBot';
import { LPOFinder } from '../components/organisms/LPOFinder';
import { DriverApplication, LPOLocation } from '../types/mosb';

const MOSBEntryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'entry' | 'lpo' | 'status'>('entry');
  const [recentApplication, setRecentApplication] = useState<DriverApplication | null>(null);
  const [recentLocation, setRecentLocation] = useState<LPOLocation | null>(null);

  // 신청서 제출 완료 처리
  const handleApplicationSubmit = (application: DriverApplication) => {
    setRecentApplication(application);
    console.log('Application submitted:', application);
    
    // Google Analytics 이벤트 (실제 사용시)
    // gtag('event', 'mosb_application_submit', {
    //   'event_category': 'engagement',
    //   'event_label': application.company,
    //   'value': 1
    // });
  };

  // LPO 위치 조회 완료 처리
  const handleLocationFound = (location: LPOLocation) => {
    setRecentLocation(location);
    console.log('Location found:', location);
  };

  // 에러 처리
  const handleError = (error: string) => {
    console.error('MOSB Error:', error);
    // 실제로는 에러 트래킹 시스템으로 전송
    // Sentry.captureException(new Error(error));
  };

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
      id: 'status',
      title: '📋 Application Status',
      subtitle: '신청 현황',
      description: 'Check your application status'
    }
  ];

  return (
    <>
      <Head>
        <title>MOSB Entry System | Samsung C&T Logistics</title>
        <meta name="description" content="MOSB Gate Entry Application System - Submit documents and find LPO locations" />
        <meta name="keywords" content="MOSB, gate entry, logistics, UAE, Abu Dhabi, Samsung C&T" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Open Graph meta tags */}
        <meta property="og:title" content="MOSB Entry System" />
        <meta property="og:description" content="Gate Entry Application System for MOSB Abu Dhabi" />
        <meta property="og:type" content="website" />
        
        {/* PWA meta tags */}
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MOSB Entry" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        {/* 헤더 */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* 로고 및 제목 */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">S</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">MOSB Entry System</h1>
                    <p className="text-xs text-gray-500">Samsung C&T Logistics</p>
                  </div>
                </Link>
              </div>

              {/* 네비게이션 링크 */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  ← Main Dashboard
                </Link>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span className="text-gray-600">System Online</span>
                </div>
              </nav>

              {/* 모바일 메뉴 버튼 */}
              <div className="md:hidden">
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* 탭 네비게이션 */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="text-base">{tab.title}</div>
                  <div className="text-xs opacity-75">{tab.subtitle}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 탭 설명 */}
        <div className="bg-blue-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <p className="text-sm text-blue-700">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* 메인 컨텐츠 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Gate Entry Application 탭 */}
          {activeTab === 'entry' && (
            <div className="space-y-6">
              <MOSBEntryBot 
                onApplicationSubmit={handleApplicationSubmit}
                onError={handleError}
              />
              
              {/* 최근 신청서 정보 (있는 경우) */}
              {recentApplication && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Recent Application</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Application ID:</strong> {recentApplication.id}</p>
                    <p><strong>Driver:</strong> {recentApplication.driverName}</p>
                    <p><strong>Status:</strong> <span className="capitalize">{recentApplication.status}</span></p>
                    <p><strong>Submitted:</strong> {new Date(recentApplication.submittedAt!).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LPO Location Finder 탭 */}
          {activeTab === 'lpo' && (
            <div className="space-y-6">
              <LPOFinder 
                onLocationFound={handleLocationFound}
                onError={handleError}
              />
              
              {/* 최근 조회 위치 정보 (있는 경우) */}
              {recentLocation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-800 mb-2">📍 Recent Search</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>LPO:</strong> {recentLocation.lpoNumber}</p>
                    <p><strong>Location:</strong> {recentLocation.location.building}, {recentLocation.location.zone}</p>
                    <p><strong>Contact:</strong> {recentLocation.location.contact}</p>
                    <p><strong>Updated:</strong> {new Date(recentLocation.lastUpdated).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Application Status 탭 */}
          {activeTab === 'status' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">📋 Application Status Check</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application ID
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="MSB-2024-001234"
                      className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                      Check Status
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Status Guide</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                      <span><strong>Submitted:</strong> Application received, waiting for review</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                      <span><strong>Under Review:</strong> Documents being verified</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                      <span><strong>Approved:</strong> Gate pass approved, ready for entry</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                      <span><strong>Rejected:</strong> Application denied, resubmission required</span>
                    </div>
                  </div>
                </div>

                {/* 최근 신청서 상태 (있는 경우) */}
                {recentApplication && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Your Recent Application</h3>
                    <div className="text-sm text-blue-700 space-y-2">
                      <div className="flex justify-between">
                        <span>Application ID:</span>
                        <span className="font-mono">{recentApplication.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="capitalize font-semibold">{recentApplication.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Submitted:</span>
                        <span>{new Date(recentApplication.submittedAt!).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* 푸터 */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Contact Information</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📱 WhatsApp: +971-XX-XXX-XXXX</p>
                  <p>📧 Email: logistics@samsungct.com</p>
                  <p>🕐 Hours: 08:00-17:00 (Sun-Thu)</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Quick Links</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><Link href="/" className="hover:text-blue-600">← Back to Main Dashboard</Link></p>
                  <p><Link href="/mosb-entry" className="hover:text-blue-600">MOSB Entry System</Link></p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">System Status</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>All Systems Operational</span>
                  </div>
                  <p>Last Updated: {new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-6 mt-6 text-center text-sm text-gray-500">
              <p>&copy; 2024 Samsung C&T Logistics. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default MOSBEntryPage; 