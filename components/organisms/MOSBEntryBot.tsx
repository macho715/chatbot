// components/organisms/MOSBEntryBot.tsx - MOSB 입장 신청 컴포넌트

import React, { useState, useRef } from 'react';
import { DriverApplication } from '../../types/mosb';
import MOSBEntryService from '../../services/MOSBEntryService';

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
    documents: {
      uaeId: false,
      drivingLicense: false,
      packingList: false,
      safetyCertificate: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File | null>>({
    uaeId: null,
    drivingLicense: null,
    packingList: null,
    safetyCertificate: null
  });
  
  const mosbService = new MOSBEntryService();
  
  // 파일 업로드 refs
  const fileRefs = {
    uaeId: useRef<HTMLInputElement>(null),
    drivingLicense: useRef<HTMLInputElement>(null),
    packingList: useRef<HTMLInputElement>(null),
    safetyCertificate: useRef<HTMLInputElement>(null)
  };

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

  // 서류 업로드 검증
  const validateDocuments = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!uploadedFiles.uaeId) {
      newErrors.documents = 'UAE Emirates ID를 업로드해주세요.';
    }
    
    if (!uploadedFiles.drivingLicense) {
      newErrors.documents = '운전면허증을 업로드해주세요.';
    }
    
    if (!uploadedFiles.packingList) {
      newErrors.documents = '포장명세서를 업로드해주세요.';
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

  // 파일 업로드 처리
  const handleFileUpload = (documentType: string, file: File) => {
    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      handleError('파일 크기는 10MB 이하여야 합니다.', 'documents');
      return;
    }
    
    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      handleError('JPG, PNG, PDF 파일만 업로드 가능합니다.', 'documents');
      return;
    }
    
    setUploadedFiles(prev => ({ ...prev, [documentType]: file }));
    setApplication(prev => ({
      ...prev,
      documents: {
        ...prev.documents!,
        [documentType]: true
      }
    }));
    
    // 에러 메시지 제거
    if (errors.documents) {
      setErrors(prev => ({ ...prev, documents: '' }));
    }
  };

  // 파일 선택 버튼 클릭
  const handleFileSelect = (documentType: string) => {
    fileRefs[documentType as keyof typeof fileRefs]?.current?.click();
  };

  // 최종 제출
  const handleFinalSubmit = async () => {
    if (!validateDocuments()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const mockApplication: DriverApplication = {
        id: `MSB-${Date.now()}`,
        driverName: application.driverName || '',
        phone: application.phone || '',
        email: application.email || '',
        company: application.company || '',
        vehicleType: application.vehicleType || '',
        visitDate: application.visitDate || new Date().toISOString(),
        visitPurpose: application.visitPurpose || '',
        status: 'submitted',
        submittedAt: new Date(),
        documents: application.documents || {
          uaeId: false,
          drivingLicense: false,
          packingList: false,
          safetyCertificate: false
        }
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
              value: application.vehicleType || '',
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                setApplication(prev => ({ ...prev, vehicleType: e.target.value }));
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

      // Step 2: 서류 업로드 (실제 파일 업로드 기능)
      currentStep === 'documents' && React.createElement('div', { className: "space-y-4" },
        React.createElement('h3', { className: "text-lg font-semibold mb-4" }, "서류 업로드"),
        React.createElement('p', { className: "text-gray-600" }, "필요한 서류들을 업로드해주세요."),
        
        // 에러 메시지 표시
        errors.documents && React.createElement('div', { className: "p-3 bg-red-50 border border-red-200 rounded-lg" },
          React.createElement('p', { className: "text-red-600 text-sm" }, errors.documents)
        ),
        
        React.createElement('div', { className: "space-y-4" },
          // UAE Emirates ID
          React.createElement('div', { 
            className: `p-4 border-2 border-dashed rounded-lg text-center ${
              uploadedFiles.uaeId ? 'border-green-300 bg-green-50' : 'border-gray-300'
            }`
          },
            React.createElement('p', { className: "text-gray-500" }, "📁 UAE Emirates ID"),
            React.createElement('p', { className: "text-sm text-gray-400" }, "유효한 UAE 신분증 (앞뒤면)"),
            uploadedFiles.uaeId && React.createElement('p', { className: "text-sm text-green-600 mt-2" }, 
              `✅ ${uploadedFiles.uaeId.name}`
            ),
            React.createElement('button', {
              type: "button",
              onClick: () => handleFileSelect('uaeId'),
              className: "mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            }, uploadedFiles.uaeId ? "파일 변경" : "파일 선택"),
            React.createElement('input', {
              ref: fileRefs.uaeId,
              type: "file",
              accept: "image/*,.pdf",
              style: { display: 'none' },
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload('uaeId', file);
              }
            })
          ),
          
          // Packing List
          React.createElement('div', { 
            className: `p-4 border-2 border-dashed rounded-lg text-center ${
              uploadedFiles.packingList ? 'border-green-300 bg-green-50' : 'border-gray-300'
            }`
          },
            React.createElement('p', { className: "text-gray-500" }, "📋 Packing List"),
            React.createElement('p', { className: "text-sm text-gray-400" }, "화물 목록 및 상세 정보"),
            uploadedFiles.packingList && React.createElement('p', { className: "text-sm text-green-600 mt-2" }, 
              `✅ ${uploadedFiles.packingList.name}`
            ),
            React.createElement('button', {
              type: "button",
              onClick: () => handleFileSelect('packingList'),
              className: "mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            }, uploadedFiles.packingList ? "파일 변경" : "파일 선택"),
            React.createElement('input', {
              ref: fileRefs.packingList,
              type: "file",
              accept: "image/*,.pdf",
              style: { display: 'none' },
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload('packingList', file);
              }
            })
          ),
          
          // Driving License
          React.createElement('div', { 
            className: `p-4 border-2 border-dashed rounded-lg text-center ${
              uploadedFiles.drivingLicense ? 'border-green-300 bg-green-50' : 'border-gray-300'
            }`
          },
            React.createElement('p', { className: "text-gray-500" }, "📄 Driving License"),
            React.createElement('p', { className: "text-sm text-gray-400" }, "운전면허증 (앞뒤면)"),
            uploadedFiles.drivingLicense && React.createElement('p', { className: "text-sm text-green-600 mt-2" }, 
              `✅ ${uploadedFiles.drivingLicense.name}`
            ),
            React.createElement('button', {
              type: "button",
              onClick: () => handleFileSelect('drivingLicense'),
              className: "mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            }, uploadedFiles.drivingLicense ? "파일 변경" : "파일 선택"),
            React.createElement('input', {
              ref: fileRefs.drivingLicense,
              type: "file",
              accept: "image/*,.pdf",
              style: { display: 'none' },
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload('drivingLicense', file);
              }
            })
          ),
          
          // Safety Certificate (선택사항)
          React.createElement('div', { 
            className: `p-4 border-2 border-dashed rounded-lg text-center ${
              uploadedFiles.safetyCertificate ? 'border-green-300 bg-green-50' : 'border-gray-300'
            }`
          },
            React.createElement('p', { className: "text-gray-500" }, "🛡️ Safety Certificate"),
            React.createElement('p', { className: "text-sm text-gray-400" }, "안전인증서 (선택사항)"),
            uploadedFiles.safetyCertificate && React.createElement('p', { className: "text-sm text-green-600 mt-2" }, 
              `✅ ${uploadedFiles.safetyCertificate.name}`
            ),
            React.createElement('button', {
              type: "button",
              onClick: () => handleFileSelect('safetyCertificate'),
              className: "mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            }, uploadedFiles.safetyCertificate ? "파일 변경" : "파일 선택"),
            React.createElement('input', {
              ref: fileRefs.safetyCertificate,
              type: "file",
              accept: "image/*,.pdf",
              style: { display: 'none' },
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload('safetyCertificate', file);
              }
            })
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
            React.createElement('p', null, "차량종류: ", application.vehicleType)
          )
        ),
        React.createElement('div', { className: "bg-gray-50 p-4 rounded-lg" },
          React.createElement('h4', { className: "font-semibold mb-2" }, "업로드된 서류"),
          React.createElement('div', { className: "space-y-1 text-sm" },
            uploadedFiles.uaeId && React.createElement('p', { className: "text-green-600" }, "✅ UAE Emirates ID: ", uploadedFiles.uaeId.name),
            uploadedFiles.drivingLicense && React.createElement('p', { className: "text-green-600" }, "✅ Driving License: ", uploadedFiles.drivingLicense.name),
            uploadedFiles.packingList && React.createElement('p', { className: "text-green-600" }, "✅ Packing List: ", uploadedFiles.packingList.name),
            uploadedFiles.safetyCertificate && React.createElement('p', { className: "text-green-600" }, "✅ Safety Certificate: ", uploadedFiles.safetyCertificate.name)
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
            setApplication({ 
              documents: {
                uaeId: false,
                drivingLicense: false,
                packingList: false,
                safetyCertificate: false
              }
            });
            setUploadedFiles({
              uaeId: null,
              drivingLicense: null,
              packingList: null,
              safetyCertificate: null
            });
            setErrors({});
          },
          className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        }, "새로운 신청서 작성")
      )
    )
  );
}; 