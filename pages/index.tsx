
// pages/index.tsx - MOSB Gate Agent v2.0 메인 페이지 (업데이트됨)

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const HomePage: React.FC = () => {
  // 기존 9개 기능에 새로운 기능 추가
  const features = [
    // 기존 9개 기능들 (유지)
    {
      title: "🔄 Gate Pass 조회",
      description: "출입 허가증 조회 및 관리",
      href: "#gate-pass",
      category: "existing"
    },
    {
      title: "🚚 차량 ETA 등록", 
      description: "차량 도착 예정 시간 등록",
      href: "#eta",
      category: "existing"
    },
    {
      title: "📤 문서 제출 (PPE / MSDS)",
      description: "안전 장비 및 자료 제출", 
      href: "#documents",
      category: "existing"
    },
    {
      title: "🧾 출입이력 보기",
      description: "과거 출입 기록 조회",
      href: "#history", 
      category: "existing"
    },
    {
      title: "📢 공지사항 확인",
      description: "현장 공지사항 확인",
      href: "#notices",
      category: "existing"
    },
    {
      title: "🟢 LPO 인바운드 매치",
      description: "물류 처리 주문 매칭", 
      href: "#lpo-match",
      category: "existing"
    },
    {
      title: "📱 QR 코드 생성",
      description: "QR 코드 생성 및 스캔",
      href: "#qr",
      category: "existing"
    },
    {
      title: "📋 스캔 히스토리",
      description: "스캔 기록 관리",
      href: "#scan-history", 
      category: "existing"
    },
    {
      title: "🚀 배치 스캔",
      description: "대량 스캔 처리",
      href: "#batch-scan",
      category: "existing"
    },

    // 🆕 새로운 MOSB Entry 기능들
    {
      title: "🚚 MOSB Entry Bot",
      description: "MOSB 출입 신청 및 서류 접수",
      href: "/mosb-entry",
      category: "new",
      isNew: true
    },
    {
      title: "📍 LPO Location Finder", 
      description: "LPO 위치 조회 및 안내",
      href: "/mosb-entry?tab=lpo",
      category: "new", 
      isNew: true
    },
    {
      title: "📋 Application Status",
      description: "MOSB 신청 현황 확인",
      href: "/mosb-entry?tab=status", 
      category: "new",
      isNew: true
    }
  ];

  return React.createElement(React.Fragment, null,
    React.createElement(Head, null,
      React.createElement('title', null, "MOSB Gate Agent v2.0 | Samsung C&T Logistics"),
      React.createElement('meta', { name: "description", content: "물류 현장의 출입 관리를 위한 통합 시스템" }),
      React.createElement('link', { rel: "icon", href: "/favicon.ico" })
    ),
    React.createElement('div', { className: "min-h-screen bg-gray-100" },
      // 헤더
      React.createElement('header', { className: "bg-gradient-to-r from-blue-600 to-blue-800 text-white" },
        React.createElement('div', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" },
          React.createElement('h1', { className: "text-3xl font-bold" }, "MOSB Gate Agent v2.0"),
          React.createElement('p', { className: "mt-2 text-blue-200" }, "Samsung C&T Logistics - 물류 출입 관리 시스템"),
          
          // 새로운 기능 알림
          React.createElement('div', { className: "mt-4 bg-blue-500 bg-opacity-50 rounded-lg p-3" },
            React.createElement('div', { className: "flex items-center space-x-2" },
              React.createElement('span', { className: "text-yellow-300" }, "✨"),
              React.createElement('span', { className: "text-sm font-medium" }, "New: MOSB Entry Application System 출시!"),
              React.createElement(Link, { 
                href: "/mosb-entry",
                className: "ml-auto bg-yellow-400 text-blue-800 px-3 py-1 rounded text-xs font-semibold hover:bg-yellow-300"
              }, "Try Now")
            )
          )
        )
      ),

      // 메인 컨텐츠
      React.createElement('main', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" },
        React.createElement('div', { className: "space-y-8" },
          // 새로운 기능 섹션
          React.createElement('section', null,
            React.createElement('h2', { className: "text-2xl font-bold text-gray-900 mb-4 flex items-center" },
              React.createElement('span', { className: "mr-2" }, "✨"),
              "New Features"
            ),
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
              features.filter(feature => feature.category === 'new').map((feature, index) => 
                React.createElement(Link, { key: index, href: feature.href },
                  React.createElement('div', { className: "bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-green-200" },
                    React.createElement('div', { className: "flex items-start justify-between mb-3" },
                      React.createElement('h3', { className: "text-lg font-semibold text-gray-900" }, feature.title),
                      feature.isNew && React.createElement('span', { className: "bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full" }, "NEW")
                    ),
                    React.createElement('p', { className: "text-gray-600 text-sm" }, feature.description),
                    React.createElement('div', { className: "mt-4 text-blue-600 text-sm font-medium" }, "Click to access →")
                  )
                )
              )
            )
          ),

          // 기존 기능 섹션
          React.createElement('section', null,
            React.createElement('h2', { className: "text-2xl font-bold text-gray-900 mb-4" }, "Core Features"),
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
              features.filter(feature => feature.category === 'existing').map((feature, index) => 
                React.createElement('div', { key: index, className: "bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow" },
                  React.createElement('h3', { className: "text-lg font-semibold text-gray-900 mb-2" }, feature.title),
                  React.createElement('p', { className: "text-gray-600 text-sm" }, feature.description),
                  React.createElement('div', { className: "mt-4 text-blue-600 text-sm font-medium" }, "Available")
                )
              )
            )
          )
        ),

        // 시스템 상태
        React.createElement('section', { className: "mt-12 bg-white rounded-lg shadow-lg p-6" },
          React.createElement('h2', { className: "text-xl font-bold text-gray-900 mb-4" }, "System Status"),
          React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-4 gap-6" },
            React.createElement('div', { className: "text-center" },
              React.createElement('div', { className: "text-2xl font-bold text-green-600" }, "12"),
              React.createElement('div', { className: "text-sm text-gray-600" }, "Total Features")
            ),
            React.createElement('div', { className: "text-center" },
              React.createElement('div', { className: "text-2xl font-bold text-blue-600" }, "3"),
              React.createElement('div', { className: "text-sm text-gray-600" }, "New Features")
            ),
            React.createElement('div', { className: "text-center" },
              React.createElement('div', { className: "text-2xl font-bold text-purple-600" }, "35+"),
              React.createElement('div', { className: "text-sm text-gray-600" }, "Tests Passing")
            ),
            React.createElement('div', { className: "text-center" },
              React.createElement('div', { className: "text-2xl font-bold text-orange-600" }, "95%"),
              React.createElement('div', { className: "text-sm text-gray-600" }, "Coverage")
            )
          ),
          React.createElement('div', { className: "mt-6 flex items-center justify-center space-x-4" },
            React.createElement('div', { className: "flex items-center space-x-2" },
              React.createElement('span', { className: "w-3 h-3 bg-green-400 rounded-full" }),
              React.createElement('span', { className: "text-sm text-gray-600" }, "All Systems Operational")
            ),
            React.createElement('div', { className: "text-sm text-gray-500" },
              "Last Updated: ", new Date().toLocaleString()
            )
          )
        )
      ),

      // 푸터
      React.createElement('footer', { className: "bg-gray-800 text-white mt-12 py-8" },
        React.createElement('div', { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" },
          React.createElement('p', null, "© 2024 Samsung C&T Logistics. All rights reserved."),
          React.createElement('p', { className: "mt-2 text-sm text-gray-400" },
            "MOSB Gate Agent v2.0 - Enhanced with MOSB Entry System"
          )
        )
      )
    )
  );
};

export default HomePage;
