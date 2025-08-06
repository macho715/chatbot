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
  };

  // LPO 위치 조회 완료 처리
  const handleLocationFound = (location: LPOLocation) => {
    setRecentLocation(location);
    console.log('Location found:', location);
  };

  // 에러 처리
  const handleError = (error: string) => {
    console.error('MOSB Error:', error);
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

      // 탭 네비게이션
      React.createElement('div', { className: "bg-white shadow-sm" },
        React.createElement('div', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" },
          React.createElement('div', { className: "flex space-x-8 overflow-x-auto" },
            tabs.map((tab) => 
              React.createElement('button', {
                key: tab.id,
                onClick: () => setActiveTab(tab.id as any),
                className: `py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              },
                React.createElement('div', { className: "text-base" }, tab.title),
                React.createElement('div', { className: "text-xs opacity-75" }, tab.subtitle)
              )
            )
          )
        )
      ),

      // 탭 설명
      React.createElement('div', { className: "bg-blue-50 border-b" },
        React.createElement('div', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3" },
          React.createElement('p', { className: "text-sm text-blue-700" },
            tabs.find(tab => tab.id === activeTab)?.description
          )
        )
      ),

      // 메인 컨텐츠
      React.createElement('main', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" },
        // Gate Entry Application 탭
        activeTab === 'entry' && React.createElement('div', { className: "space-y-6" },
          React.createElement(MOSBEntryBot, {
            onApplicationSubmit: handleApplicationSubmit,
            onError: handleError
          }),
          recentApplication && React.createElement('div', { className: "bg-green-50 border border-green-200 rounded-lg p-4" },
            React.createElement('h3', { className: "font-semibold text-green-800 mb-2" }, "✅ Recent Application"),
            React.createElement('div', { className: "text-sm text-green-700 space-y-1" },
              React.createElement('p', null, React.createElement('strong', null, "Application ID:"), " ", recentApplication.id),
              React.createElement('p', null, React.createElement('strong', null, "Driver:"), " ", recentApplication.driverName),
              React.createElement('p', null, React.createElement('strong', null, "Status:"), " ", React.createElement('span', { className: "capitalize" }, recentApplication.status)),
              React.createElement('p', null, React.createElement('strong', null, "Submitted:"), " ", new Date(recentApplication.submittedAt!).toLocaleString())
            )
          )
        ),

        // LPO Location Finder 탭
        activeTab === 'lpo' && React.createElement('div', { className: "space-y-6" },
          React.createElement(LPOFinder, {
            onLocationFound: handleLocationFound,
            onError: handleError
          }),
          recentLocation && React.createElement('div', { className: "bg-green-50 border border-green-200 rounded-lg p-4" },
            React.createElement('h3', { className: "font-semibold text-green-800 mb-2" }, "📍 Recent Search"),
            React.createElement('div', { className: "text-sm text-green-700 space-y-1" },
              React.createElement('p', null, React.createElement('strong', null, "LPO:"), " ", recentLocation.lpoNumber),
              React.createElement('p', null, React.createElement('strong', null, "Location:"), " ", recentLocation.location.building, ", ", recentLocation.location.zone),
              React.createElement('p', null, React.createElement('strong', null, "Contact:"), " ", recentLocation.location.contact),
              React.createElement('p', null, React.createElement('strong', null, "Updated:"), " ", new Date(recentLocation.lastUpdated).toLocaleString())
            )
          )
        ),

        // Application Status 탭
        activeTab === 'status' && React.createElement('div', { className: "bg-white rounded-lg shadow-lg p-6" },
          React.createElement('h2', { className: "text-xl font-bold mb-4" }, "📋 Application Status Check"),
          React.createElement('div', { className: "space-y-4" },
            React.createElement('div', null,
              React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-2" }, "Application ID"),
              React.createElement('div', { className: "flex space-x-2" },
                React.createElement('input', {
                  type: "text",
                  placeholder: "MSB-2024-001234",
                  className: "flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                }),
                React.createElement('button', { className: "px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700" }, "Check Status")
              )
            ),
            React.createElement('div', { className: "bg-gray-50 p-4 rounded-lg" },
              React.createElement('h3', { className: "font-semibold text-gray-800 mb-2" }, "Status Guide"),
              React.createElement('div', { className: "space-y-2 text-sm text-gray-600" },
                React.createElement('div', { className: "flex items-center space-x-2" },
                  React.createElement('span', { className: "w-3 h-3 bg-yellow-400 rounded-full" }),
                  React.createElement('span', null, React.createElement('strong', null, "Submitted:"), " Application received, waiting for review")
                ),
                React.createElement('div', { className: "flex items-center space-x-2" },
                  React.createElement('span', { className: "w-3 h-3 bg-blue-400 rounded-full" }),
                  React.createElement('span', null, React.createElement('strong', null, "Under Review:"), " Documents being verified")
                ),
                React.createElement('div', { className: "flex items-center space-x-2" },
                  React.createElement('span', { className: "w-3 h-3 bg-green-400 rounded-full" }),
                  React.createElement('span', null, React.createElement('strong', null, "Approved:"), " Gate pass approved, ready for entry")
                ),
                React.createElement('div', { className: "flex items-center space-x-2" },
                  React.createElement('span', { className: "w-3 h-3 bg-red-400 rounded-full" }),
                  React.createElement('span', null, React.createElement('strong', null, "Rejected:"), " Application denied, resubmission required")
                )
              )
            ),
            recentApplication && React.createElement('div', { className: "bg-blue-50 border border-blue-200 rounded-lg p-4" },
              React.createElement('h3', { className: "font-semibold text-blue-800 mb-2" }, "Your Recent Application"),
              React.createElement('div', { className: "text-sm text-blue-700 space-y-2" },
                React.createElement('div', { className: "flex justify-between" },
                  React.createElement('span', null, "Application ID:"),
                  React.createElement('span', { className: "font-mono" }, recentApplication.id)
                ),
                React.createElement('div', { className: "flex justify-between" },
                  React.createElement('span', null, "Status:"),
                  React.createElement('span', { className: "capitalize font-semibold" }, recentApplication.status)
                ),
                React.createElement('div', { className: "flex justify-between" },
                  React.createElement('span', null, "Submitted:"),
                  React.createElement('span', null, new Date(recentApplication.submittedAt!).toLocaleDateString())
                )
              )
            )
          )
        )
      ),

      // 푸터
      React.createElement('footer', { className: "bg-white border-t mt-12" },
        React.createElement('div', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" },
          React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
            React.createElement('div', null,
              React.createElement('h3', { className: "font-semibold text-gray-800 mb-2" }, "Contact Information"),
              React.createElement('div', { className: "text-sm text-gray-600 space-y-1" },
                React.createElement('p', null, "📱 WhatsApp: +971-XX-XXX-XXXX"),
                React.createElement('p', null, "📧 Email: logistics@samsungct.com"),
                React.createElement('p', null, "🕐 Hours: 08:00-17:00 (Sun-Thu)")
              )
            ),
            React.createElement('div', null,
              React.createElement('h3', { className: "font-semibold text-gray-800 mb-2" }, "Quick Links"),
              React.createElement('div', { className: "text-sm text-gray-600 space-y-1" },
                React.createElement('p', null, React.createElement(Link, { href: "/", className: "hover:text-blue-600" }, "← Back to Main Dashboard")),
                React.createElement('p', null, React.createElement(Link, { href: "/mosb-entry", className: "hover:text-blue-600" }, "MOSB Entry System"))
              )
            ),
            React.createElement('div', null,
              React.createElement('h3', { className: "font-semibold text-gray-800 mb-2" }, "System Status"),
              React.createElement('div', { className: "text-sm text-gray-600 space-y-1" },
                React.createElement('div', { className: "flex items-center space-x-2" },
                  React.createElement('span', { className: "w-2 h-2 bg-green-400 rounded-full" }),
                  React.createElement('span', null, "All Systems Operational")
                ),
                React.createElement('p', null, "Last Updated: ", new Date().toLocaleString())
              )
            )
          ),
          React.createElement('div', { className: "border-t pt-6 mt-6 text-center text-sm text-gray-500" },
            React.createElement('p', null, "© 2024 Samsung C&T Logistics. All rights reserved.")
          )
        )
      )
    )
  );
};

export default MOSBEntryPage; 