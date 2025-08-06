// services/MOSBEntryService.ts - MOSB Entry System 서비스

export interface DriverDocument {
  id: string;
  type: 'uae_id' | 'packing_list' | 'driving_license' | 'safety_certificate';
  fileName: string;
  fileUrl?: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DriverApplication {
  driverName: string;
  phone: string;
  company: string;
  visitDate: string;
  vehicleNumber: string;
  documents: DriverDocument[];
}

export interface LocationInfo {
  lpoNumber: string;
  location: {
    building: string;
    zone: string;
    contact: string;
    instructions: string[];
    operatingHours: string;
  };
  lastUpdated: Date;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export class MOSBEntryService {
  constructor() {
    // 서비스 초기화
  }

  // 전화번호 검증
  validatePhoneNumber(phone: string): boolean {
    if (!phone) return false;
    
    // UAE 전화번호 형식 검증
    const uaePhoneRegex = /^(\+971|971|00971)?[\s-]?[0-9]{9}$/;
    return uaePhoneRegex.test(phone.replace(/[\s-]/g, ''));
  }

  // LPO 번호 검증
  validateLPONumber(lpoNumber: string): boolean {
    if (!lpoNumber) return false;
    
    // LPO-YYYY-NNNNNN 형식 검증
    const lpoRegex = /^LPO-\d{4}-\d{6}$/i;
    return lpoRegex.test(lpoNumber);
  }

  // 파일 검증
  validateFile(file: File, documentType: string): ValidationResult {
    // 파일 크기 검증 (10MB 제한)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `파일 크기가 10MB를 초과합니다.`
      };
    }

    // 파일 형식 검증
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `지원하지 않는 파일 형식입니다. JPG, PNG, PDF 파일만 업로드 가능합니다.`
      };
    }

    return { valid: true };
  }

  // 문서 업로드
  async uploadDocument(file: File, documentType: string): Promise<DriverDocument> {
    const validation = this.validateFile(file, documentType);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 실제 업로드 로직은 나중에 구현
    return {
      id: `doc_${Date.now()}`,
      type: documentType as any,
      fileName: file.name,
      uploadedAt: new Date(),
      status: 'pending'
    };
  }

  // 신청서 제출
  async submitApplication(application: DriverApplication): Promise<{ id: string; status: string; driverName: string }> {
    // 기본 검증
    if (!this.validatePhoneNumber(application.phone)) {
      throw new Error('올바르지 않은 전화번호 형식입니다.');
    }

    // API 호출 시뮬레이션
    const response = await fetch('/api/mosb/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(application),
    });

    if (!response.ok) {
      throw new Error('신청서 제출에 실패했습니다.');
    }

    const result = await response.json();
    return {
      id: result.application?.id || `MSB-${Date.now()}`,
      status: 'submitted',
      driverName: application.driverName
    };
  }

  // LPO 위치 정보 조회
  async getLocationInfo(lpoNumber: string): Promise<LocationInfo | null> {
    if (!this.validateLPONumber(lpoNumber)) {
      throw new Error('올바르지 않은 LPO 번호 형식입니다.');
    }

    try {
      const response = await fetch(`/api/lpo/location/${lpoNumber}`);
      
      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('LPO 위치 정보 조회 실패:', error);
      return null;
    }
  }
} 