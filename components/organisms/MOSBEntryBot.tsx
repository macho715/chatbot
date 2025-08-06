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
  const fileInputRefs = {
    uae_id: useRef<HTMLInputElement>(null),
    packing_list: useRef<HTMLInputElement>(null),
    license: useRef<HTMLInputElement>(null)
  };

  // 에러 처리
  const handleError = (error: string, field?: string) => {
    if (field) {
      setErrors(prev => ({ ...prev, [field]: error }));
    } else {
      onError?.(error);
      alert(error); // 기본 알림
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
    } else if (!mosbService.validatePhoneNumber(application.phone)) {
      newErrors.phone = '올바른 전화번호 형식을 입력해주세요. (예: +971-50-123-4567)';
    }
    
    if (!application.company?.trim()) {
      newErrors.company = '회사명을 입력해주세요.';
    }
    
    if (!application.visitDate) {
      newErrors.visitDate = '방문 예정일을 선택해주세요.';
    }
    
    if (!application.vehicleNumber?.trim()) {
      newErrors.vehicleNumber = '차량번호를 입력해주세요.';
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

  // 서류 업로드 처리
  const handleDocumentUpload = async (type: DriverDocument['type'], file: File) => {
    setIsLoading(true);
    setErrors({});
    
    try {
      // 파일 검증
      const validation = mosbService.validateFile(file, type);
      if (!validation.valid) {
        handleError(validation.error!, type);
        return;
      }
      
      // 업로드 실행
      const document = await mosbService.uploadDocument(file, type);
      
      setApplication(prev => ({
        ...prev,
        documents: [
          ...(prev.documents || []).filter(d => d.type !== type), // 기존 같은 타입 제거
          document
        ]
      }));
      
    } catch (error) {
      handleError(error instanceof Error ? error.message : '파일 업로드에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 최종 신청서 제출
  const handleFinalSubmit = async () => {
    setIsLoading(true);
    
    try {
      if (!application.driverName || !application.phone || !application.company) {
        throw new Error('필수 정보가 누락되었습니다.');
      }
      
      if (!application.documents || application.documents.length < 3) {
        throw new Error('모든 필수 서류를 업로드해주세요.');
      }
      
      const result = await mosbService.submitApplication({
        driverName: application.driverName,
        phone: application.phone,
        company: application.company,
        visitDate: application.visitDate!,
        vehicleNumber: application.vehicleNumber!,
        documents: application.documents
      });
      
      setApplication(result);
      setCurrentStep('submitted');
      onApplicationSubmit?.(result);
      
    } catch (error) {
      handleError(error instanceof Error ? error.message : '신청서 제출에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 서류 타입별 정보
  const requiredDocs = [
    { 
      type: 'uae_id' as const, 
      label: 'UAE Emirates ID', 
      icon: '🆔',
      description: '유효한 UAE 신분증 (앞뒤면)'
    },
    { 
      type: 'packing_list' as const, 
      label: 'Packing List', 
      icon: '📋',
      description: '화물 목록 및 상세 정보'
    },
    { 
      type: 'license' as const, 
      label: 'Driving License', 
      icon: '📄',
      description: '운전면허증 (앞뒤면)'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center">
          <span className="mr-3">🚚</span>
          MOSB Entry Application
        </h2>
        <p className="mt-2 opacity-90">Samsung C&T Logistics - Gate Entry System</p>
      </div>

      {/* 진행 단계 표시 */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex justify-between">
          {[
            { key: 'info', label: '기본정보', icon: '👤' },
            { key: 'documents', label: '서류업로드', icon: '📁' },
            { key: 'review', label: '검토', icon: '📝' },
            { key: 'submitted', label: '완료', icon: '✅' }
          ].map((step) => (
            <div key={step.key} className={`flex items-center ${
              currentStep === step.key ? 'text-blue-600 font-semibold' : 'text-gray-400'
            }`}>
              <span className="text-xl mr-2">{step.icon}</span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Step 1: 기본 정보 입력 */}
        {currentStep === 'info' && (
          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">기본 정보 입력</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  운전자 성명 *
                </label>
                <input
                  type="text"
                  required
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.driverName ? 'border-red-500' : ''
                  }`}
                  value={application.driverName || ''}
                  onChange={(e) => {
                    setApplication(prev => ({ ...prev, driverName: e.target.value }));
                    if (errors.driverName) setErrors(prev => ({ ...prev, driverName: '' }));
                  }}
                  placeholder="홍길동"
                />
                {errors.driverName && (
                  <p className="mt-1 text-sm text-red-600">{errors.driverName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호 *
                </label>
                <input
                  type="tel"
                  required
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : ''
                  }`}
                  value={application.phone || ''}
                  onChange={(e) => {
                    setApplication(prev => ({ ...prev, phone: e.target.value }));
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                  }}
                  placeholder="+971-50-123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  회사명 *
                </label>
                <input
                  type="text"
                  required
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.company ? 'border-red-500' : ''
                  }`}
                  value={application.company || ''}
                  onChange={(e) => {
                    setApplication(prev => ({ ...prev, company: e.target.value }));
                    if (errors.company) setErrors(prev => ({ ...prev, company: '' }));
                  }}
                  placeholder="ABC Logistics"
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  방문 예정일 *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.visitDate ? 'border-red-500' : ''
                  }`}
                  value={application.visitDate || ''}
                  onChange={(e) => {
                    setApplication(prev => ({ ...prev, visitDate: e.target.value }));
                    if (errors.visitDate) setErrors(prev => ({ ...prev, visitDate: '' }));
                  }}
                />
                {errors.visitDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.visitDate}</p>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                차량 번호 *
              </label>
              <input
                type="text"
                required
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.vehicleNumber ? 'border-red-500' : ''
                }`}
                value={application.vehicleNumber || ''}
                onChange={(e) => {
                  setApplication(prev => ({ ...prev, vehicleNumber: e.target.value.toUpperCase() }));
                  if (errors.vehicleNumber) setErrors(prev => ({ ...prev, vehicleNumber: '' }));
                }}
                placeholder="12-A-4567"
              />
              {errors.vehicleNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.vehicleNumber}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              다음 단계: 서류 업로드 →
            </button>
          </form>
        )}

        {/* Step 2: 서류 업로드 */}
        {currentStep === 'documents' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">필수 서류 업로드</h3>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <span className="text-yellow-400 mr-2">⚠️</span>
                <div>
                  <p className="text-yellow-800 font-medium">서류 준비 안내</p>
                  <ul className="text-yellow-700 text-sm mt-1 space-y-1">
                    <li>• 모든 서류는 선명한 컬러 스캔본을 업로드해주세요</li>
                    <li>• 파일 형식: PDF, JPG, PNG (최대 10MB)</li>
                    <li>• WhatsApp (+971-XX-XXX-XXXX) 또는 이메일로도 전송 가능</li>
                  </ul>
                </div>
              </div>
            </div>

            {requiredDocs.map((doc) => {
              const isUploaded = application.documents?.some(d => d.type === doc.type);
              const hasError = errors[doc.type];
              
              return (
                <div key={doc.type} className={`border rounded-lg p-4 ${
                  hasError ? 'border-red-300 bg-red-50' : ''
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{doc.icon}</span>
                      <div>
                        <h4 className="font-semibold">{doc.label}</h4>
                        <p className="text-sm text-gray-600">{doc.description}</p>
                        {hasError && (
                          <p className="text-sm text-red-600 mt-1">{hasError}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      {isUploaded ? (
                        <div className="flex items-center text-green-600">
                          <span className="mr-2">✅</span>
                          <span className="font-semibold">업로드 완료</span>
                        </div>
                      ) : (
                        <div>
                          <input
                            ref={fileInputRefs[doc.type]}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleDocumentUpload(doc.type, file);
                            }}
                          />
                          <button
                            onClick={() => fileInputRefs[doc.type].current?.click()}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            {isLoading ? '업로드 중...' : '파일 선택'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentStep('info')}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                ← 이전 단계
              </button>
              
              {application.documents?.length === 3 && (
                <button
                  onClick={() => setCurrentStep('review')}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  검토 단계로 이동 →
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 3: 검토 및 제출 */}
        {currentStep === 'review' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">신청 내용 검토</h3>
            
            {/* 기본 정보 요약 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">기본 정보</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>운전자:</strong> {application.driverName}</div>
                <div><strong>전화:</strong> {application.phone}</div>
                <div><strong>회사:</strong> {application.company}</div>
                <div><strong>방문일:</strong> {application.visitDate}</div>
                <div><strong>차량번호:</strong> {application.vehicleNumber}</div>
              </div>
            </div>

            {/* 서류 목록 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">업로드된 서류</h4>
              <div className="space-y-2">
                {application.documents?.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span>
                      {doc.type === 'uae_id' && '🆔 UAE Emirates ID'}
                      {doc.type === 'packing_list' && '📋 Packing List'}
                      {doc.type === 'license' && '📄 Driving License'}
                    </span>
                    <span className="text-green-600">✅ {doc.fileName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 처리 안내 */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <h4 className="font-semibold text-blue-800 mb-2">처리 절차 안내</h4>
              <ol className="text-blue-700 text-sm space-y-1">
                <li>1. Samsung C&T에서 서류 검토 (1-2 영업일)</li>
                <li>2. ADNOC 승인 신청 진행</li>
                <li>3. 승인 완료 시 WhatsApp 또는 전화로 안내</li>
                <li>4. Gate Pass 발급 후 현장 입장 가능</li>
              </ol>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentStep('documents')}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              >
                ← 이전 단계
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? '제출 중...' : '신청서 제출'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 제출 완료 */}
        {currentStep === 'submitted' && (
          <div className="text-center space-y-6">
            <div className="text-6xl">✅</div>
            <h3 className="text-2xl font-bold text-green-600">신청 완료!</h3>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <p className="text-green-800 mb-4">
                MOSB 출입 신청이 성공적으로 제출되었습니다.
              </p>
              <div className="text-left space-y-2 text-sm text-green-700">
                <p><strong>신청번호:</strong> {application.id}</p>
                <p><strong>처리 예상 시간:</strong> 1-2 영업일</p>
                <p><strong>연락처:</strong> {application.phone}</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h4 className="font-semibold text-blue-800 mb-2">다음 단계</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Samsung C&T에서 ADNOC 승인을 신청합니다</li>
                <li>• 승인 완료 시 WhatsApp 또는 전화로 연락드립니다</li>
                <li>• Gate Pass 발급 후 현장 안내를 제공합니다</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">📞 문의처</h4>
              <div className="text-yellow-700 text-sm space-y-1">
                <p><strong>WhatsApp:</strong> +971-XX-XXX-XXXX</p>
                <p><strong>Email:</strong> logistics@samsungct.com</p>
                <p><strong>운영시간:</strong> 08:00 - 17:00 (일-목)</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 