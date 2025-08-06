// services/MOSBEntryService.ts - MOSB 엔트리 서비스

import { DriverApplication, DriverDocument, LPOLocation, ApplicationStats } from '../types/mosb';

export class MOSBEntryService {
  
  /**
   * 서류 업로드 (기존 파일 업로드 시스템 활용)
   */
  async uploadDocument(file: File, type: DriverDocument['type']): Promise<DriverDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('timestamp', Date.now().toString());
    
    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        id: result.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        fileName: file.name,
        fileUrl: result.fileUrl,
        uploadedAt: new Date(),
        status: 'pending'
      };
    } catch (error) {
      console.error('Document upload error:', error);
      throw new Error('서류 업로드에 실패했습니다. 다시 시도해주세요.');
    }
  }

  /**
   * 신청서 제출
   */
  async submitApplication(application: Omit<DriverApplication, 'id' | 'status'>): Promise<DriverApplication> {
    try {
      const response = await fetch('/api/mosb/applications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...application,
          status: 'submitted',
          submittedAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Submission failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Application submission error:', error);
      throw new Error('신청서 제출에 실패했습니다. 다시 시도해주세요.');
    }
  }

  /**
   * 신청서 상태 조회
   */
  async checkApplicationStatus(applicationId: string): Promise<DriverApplication | null> {
    try {
      const response = await fetch(`/api/mosb/applications/${applicationId}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Status check failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Status check error:', error);
      return null;
    }
  }

  /**
   * LPO 위치 정보 조회 (기존 LPO 매칭 시스템 확장)
   */
  async getLocationInfo(lpoNumber: string): Promise<LPOLocation | null> {
    try {
      const response = await fetch(`/api/lpo/location/${encodeURIComponent(lpoNumber)}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Location lookup failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        ...data,
        lastUpdated: new Date(data.lastUpdated)
      };
    } catch (error) {
      console.error('Location lookup error:', error);
      return null;
    }
  }

  /**
   * 신청서 목록 조회 (관리자용)
   */
  async getApplications(status?: DriverApplication['status']): Promise<DriverApplication[]> {
    try {
      const params = status ? `?status=${status}` : '';
      const response = await fetch(`/api/mosb/applications${params}`);
      
      if (!response.ok) {
        throw new Error(`Applications fetch failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Applications fetch error:', error);
      return [];
    }
  }

  /**
   * 신청 통계 조회
   */
  async getApplicationStats(): Promise<ApplicationStats> {
    try {
      const response = await fetch('/api/mosb/stats');
      
      if (!response.ok) {
        throw new Error(`Stats fetch failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Stats fetch error:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
  }

  /**
   * WhatsApp 메시지 전송 (선택적 기능)
   */
  async sendWhatsAppNotification(phone: string, message: string): Promise<boolean> {
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message })
      });
      
      return response.ok;
    } catch (error) {
      console.error('WhatsApp notification error:', error);
      return false;
    }
  }

  /**
   * 파일 검증 (클라이언트 사이드)
   */
  validateFile(file: File, type: DriverDocument['type']): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    
    if (file.size > maxSize) {
      return { valid: false, error: '파일 크기가 10MB를 초과합니다.' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'JPG, PNG, PDF 파일만 업로드 가능합니다.' };
    }
    
    return { valid: true };
  }

  /**
   * 전화번호 형식 검증
   */
  validatePhoneNumber(phone: string): boolean {
    // UAE 전화번호 형식: +971-XX-XXX-XXXX 또는 유사
    const uaePhoneRegex = /^(\+971|00971|971)?[\s-]?[0-9]{1,2}[\s-]?[0-9]{3}[\s-]?[0-9]{4}$/;
    return uaePhoneRegex.test(phone.replace(/\s|-/g, ''));
  }

  /**
   * LPO 번호 형식 검증
   */
  validateLPONumber(lpoNumber: string): boolean {
    // LPO 번호 형식: LPO-YYYY-XXXXXX
    const lpoRegex = /^LPO-\d{4}-\d{6}$/;
    return lpoRegex.test(lpoNumber.toUpperCase());
  }
} 