// components/organisms/MOSBEntryBot.tsx - MOSB 입장 신청 컴포넌트

import React, { useState, useRef } from 'react';
import { DriverApplication, DriverDocument } from '../../types/mosb';
import { MOSBEntryService } from '../../services/MOSBEntryService';

interface MOSBEntryBotProps {
  onApplicationSubmit?: (application: DriverApplication) => void;
  onError?: (error: string) => void;
}

export const MOSBEntryBot: React.FC<MOSBEntryBotProps> = ({ 
  onApplicationSubmit,
  onError 
}) => {
  const [currentStep, setCurrentStep] = useState<'info' | 'documents' | 'review' | 'submitted'>('info');
  const [application, setApplication] = useState<Partial<DriverApplication>>({
    documents: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const mosbService = new MOSBEntryService();

  // 에러 처리
  const handleError = (error: string, field?: string) => {
    if (field) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      onError?.(error);
      alert(error);
    }
  };

  // 기본 정보 검증
  const validateBasicInfo = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!application.driverName?.trim()) {
      newErrors.driverName = '운전자 성명을 입력해주세요.';
    }
    
    if (!application.phone?.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
    }
    
    if (!application.company?.trim()) {
      newErrors.company = '회사명을 입력해주세요.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 기본 정보 입력 완료
  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateBasicInfo()) {
      setCurrentStep('documents');
    }
  };

  // 최종 제출
  const handleFinalSubmit = async () => {
    setIsLoading(true);
    
    try {
      const mockApplication: DriverApplication = {
        id: `MSB-${Date.now()}`,
        driverName: application.driverName || '',
        phone: application.phone || '',
        company: application.company || '',
        visitDate: application.visitDate || new Date().toISOString(),
        vehicleNumber: application.vehicleNumber || '',
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        documents: application.documents || []
      };
      
      onApplicationSubmit?.(mockApplication);
      setCurrentStep('submitted');
    } catch (error) {
      handleError('신청서 제출 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return React.createElement('div', { className: "max-w-2xl mx-auto bg-white rounded-lg shadow-lg" },
    // 헤더
    React.createElement('div', { className: "bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white" },
      React.createElement('h2', { className: "text-2xl font-bold flex items-center" },
        React.createElement('span', { className: "mr-3" }, "🚚"),
        "MOSB Entry Application"
      ),
      React.createElement('p', { className: "mt-2 opacity-90" }, "Samsung C&T Logistics - Gate Entry System")
    ),

    // 진행 단계 표시
    React.createElement('div', { className: "p-4 bg-gray-50 border-b" },
      React.createElement('div', { className: "flex justify-between" },
        [
          { key: 'info', label: '기본정보', icon: '👤' },
          { key: 'documents', label: '서류업로드', icon: '📁' },
          { key: 'review', label: '검토', icon: '📝' },
          { key: 'submitted', label: '완료', icon: '✅' }
        ].map((step) => 
          React.createElement('div', { 
            key: step.key, 
            className: `flex items-center ${
              currentStep === step.key ? 'text-blue-600 font-semibold' : 'text-gray-400'
            }`
          },
            React.createElement('span', { className: "text-xl mr-2" }, step.icon),
            React.createElement('span', { className: "hidden sm:inline" }, step.label)
          )
        )
      )
    ),

    React.createElement('div', { className: "p-6" },
      // Step 1: 기본 정보 입력
      currentStep === 'info' && React.createElement('form', { onSubmit: handleInfoSubmit, className: "space-y-4" },
        React.createElement('h3', { className: "text-lg font-semibold mb-4" }, "기본 정보 입력"),
        
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
          React.createElement('div', null,
            React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-1" }, "운전자 성명 *"),
            React.createElement('input', {
              type: "text",
              required: true,
              className: `w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.driverName ? 'border-red-500' : ''
              }`,
              value: application.driverName || '',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                setApplication(prev => ({ ...prev, driverName: e.target.value }));
                if (errors.driverName) setErrors(prev => ({ ...prev, driverName: '' }));
              },
              placeholder: "홍길동"
            }),
            errors.driverName && React.createElement('p', { className: "mt-1 text-sm text-red-600" }, errors.driverName)
          ),
          
          React.createElement('div', null,
            React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-1" }, "전화번호 *"),
            React.createElement('input', {
              type: "tel",
              required: true,
              className: `w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-500' : ''
              }`,
              value: application.phone || '',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                setApplication(prev => ({ ...prev, phone: e.target.value }));
                if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
              },
              placeholder: "+971-50-123-4567"
            }),
            errors.phone && React.createElement('p', { className: "mt-1 text-sm text-red-600" }, errors.phone)
          ),
          
          React.createElement('div', null,
            React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-1" }, "회사명 *"),
            React.createElement('input', {
              type: "text",
              required: true,
              className: `w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.company ? 'border-red-500' : ''
              }`,
              value: application.company || '',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                setApplication(prev => ({ ...prev, company: e.target.value }));
                if (errors.company) setErrors(prev => ({ ...prev, company: '' }));
              },
              placeholder: "Samsung C&T"
            }),
            errors.company && React.createElement('p', { className: "mt-1 text-sm text-red-600" }, errors.company)
          ),
          
          React.createElement('div', null,
            React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-1" }, "차량번호"),
            React.createElement('input', {
              type: "text",
              className: "w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500",
              value: application.vehicleNumber || '',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                setApplication(prev => ({ ...prev, vehicleNumber: e.target.value }));
              },
              placeholder: "ABC-1234"
            })
          )
        ),
        
        React.createElement('button', {
          type: "submit",
          className: "w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        }, "다음 단계")
      ),

      // Step 2: 서류 업로드 (간단한 버전)
      currentStep === 'documents' && React.createElement('div', { className: "space-y-4" },
        React.createElement('h3', { className: "text-lg font-semibold mb-4" }, "서류 업로드"),
        React.createElement('p', { className: "text-gray-600" }, "필요한 서류들을 업로드해주세요."),
        React.createElement('div', { className: "space-y-4" },
          React.createElement('div', { className: "p-4 border-2 border-dashed border-gray-300 rounded-lg text-center" },
            React.createElement('p', { className: "text-gray-500" }, "📁 UAE Emirates ID"),
            React.createElement('p', { className: "text-sm text-gray-400" }, "유효한 UAE 신분증 (앞뒤면)"),
            React.createElement('button', {
              type: "button",
              className: "mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            }, "파일 선택")
          ),
          React.createElement('div', { className: "p-4 border-2 border-dashed border-gray-300 rounded-lg text-center" },
            React.createElement('p', { className: "text-gray-500" }, "📋 Packing List"),
            React.createElement('p', { className: "text-sm text-gray-400" }, "화물 목록 및 상세 정보"),
            React.createElement('button', {
              type: "button",
              className: "mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            }, "파일 선택")
          ),
          React.createElement('div', { className: "p-4 border-2 border-dashed border-gray-300 rounded-lg text-center" },
            React.createElement('p', { className: "text-gray-500" }, "📄 Driving License"),
            React.createElement('p', { className: "text-sm text-gray-400" }, "운전면허증 (앞뒤면)"),
            React.createElement('button', {
              type: "button",
              className: "mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            }, "파일 선택")
          )
        ),
        React.createElement('div', { className: "flex space-x-4" },
          React.createElement('button', {
            type: "button",
            onClick: () => setCurrentStep('info'),
            className: "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          }, "이전"),
          React.createElement('button', {
            type: "button",
            onClick: () => setCurrentStep('review'),
            className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          }, "다음")
        )
      ),

      // Step 3: 검토
      currentStep === 'review' && React.createElement('div', { className: "space-y-4" },
        React.createElement('h3', { className: "text-lg font-semibold mb-4" }, "신청서 검토"),
        React.createElement('div', { className: "bg-gray-50 p-4 rounded-lg" },
          React.createElement('h4', { className: "font-semibold mb-2" }, "기본 정보"),
          React.createElement('div', { className: "space-y-1 text-sm" },
            React.createElement('p', null, "운전자: ", application.driverName),
            React.createElement('p', null, "전화번호: ", application.phone),
            React.createElement('p', null, "회사명: ", application.company),
            React.createElement('p', null, "차량번호: ", application.vehicleNumber)
          )
        ),
        React.createElement('div', { className: "flex space-x-4" },
          React.createElement('button', {
            type: "button",
            onClick: () => setCurrentStep('documents'),
            className: "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          }, "이전"),
          React.createElement('button', {
            type: "button",
            onClick: handleFinalSubmit,
            disabled: isLoading,
            className: "px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          }, isLoading ? "제출 중..." : "신청서 제출")
        )
      ),

      // Step 4: 완료
      currentStep === 'submitted' && React.createElement('div', { className: "text-center space-y-4" },
        React.createElement('div', { className: "text-6xl mb-4" }, "✅"),
        React.createElement('h3', { className: "text-xl font-semibold text-green-600" }, "신청서 제출 완료!"),
        React.createElement('p', { className: "text-gray-600" }, "MOSB 출입 신청이 성공적으로 제출되었습니다."),
        React.createElement('p', { className: "text-sm text-gray-500" }, "관리자의 승인을 기다려주세요."),
        React.createElement('button', {
          type: "button",
          onClick: () => {
            setCurrentStep('info');
            setApplication({ documents: [] });
            setErrors({});
          },
          className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        }, "새로운 신청서 작성")
      )
    )
  );
}; 