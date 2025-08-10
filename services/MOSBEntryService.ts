// services/MOSBEntryService.ts - MOSB Entry System Service

// 타입 정의
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
  vehicleType: string;
  documents: DriverDocument[];
}

export interface LocationInfo {
  building: string;
  zone: string;
  contact: string;
  instructions: string[];
  operatingHours: string;
  gpsCoordinate?: [number, number];
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ApplicationResult {
  id: string;
  status: string;
  driverName: string;
  submittedAt: Date;
}

export interface LocationResult {
  lpoNumber: string;
  location: LocationInfo;
  lastUpdated: Date;
}

class MOSBEntryService {
  private readonly API_BASE_URL = '/api';
  
  // Mock LPO 위치 데이터 (실제로는 데이터베이스에서 조회)
  private mockLPOLocations: Record<string, LocationResult> = {
    'LPO-2024-001234': {
      lpoNumber: 'LPO-2024-001234',
      location: {
        building: 'Building A',
        zone: 'Zone 3',
        contact: '+971-50-123-4567',
        instructions: [
          'Safety helmet required',
          'Follow designated routes',
          'Contact warehouse manager before arrival'
        ],
        operatingHours: '06:00 - 22:00',
        gpsCoordinate: [24.4539, 54.3773] // Abu Dhabi coordinates
      },
      lastUpdated: new Date('2024-12-19T10:00:00Z')
    },
    'LPO-2024-001235': {
      lpoNumber: 'LPO-2024-001235',
      location: {
        building: 'Building B',
        zone: 'Zone 1',
        contact: '+971-50-987-6543',
        instructions: [
          'High security area - ID required',
          'No photography allowed',
          'Follow safety protocols'
        ],
        operatingHours: '08:00 - 20:00',
        gpsCoordinate: [24.4539, 54.3773]
      },
      lastUpdated: new Date('2024-12-19T09:30:00Z')
    },
    'LPO-2024-001236': {
      lpoNumber: 'LPO-2024-001236',
      location: {
        building: 'Building C',
        zone: 'Zone 5',
        contact: '+971-50-555-1234',
        instructions: [
          'Temperature controlled area',
          'Special handling required',
          'Contact supervisor for access'
        ],
        operatingHours: '24/7',
        gpsCoordinate: [24.4539, 54.3773]
      },
      lastUpdated: new Date('2024-12-19T11:15:00Z')
    },
    'LPO-2024-001237': {
      lpoNumber: 'LPO-2024-001237',
      location: {
        building: 'Building D',
        zone: 'Zone 2',
        contact: '+971-50-777-8888',
        instructions: [
          'Heavy machinery area',
          'Safety vest required',
          'Authorized personnel only'
        ],
        operatingHours: '07:00 - 19:00',
        gpsCoordinate: [24.4539, 54.3773]
      },
      lastUpdated: new Date('2024-12-19T08:45:00Z')
    },
    'LPO-2024-001238': {
      lpoNumber: 'LPO-2024-001238',
      location: {
        building: 'Building E',
        zone: 'Zone 4',
        contact: '+971-50-999-0000',
        instructions: [
          'Chemical storage area',
          'PPE required',
          'Emergency procedures posted'
        ],
        operatingHours: '09:00 - 17:00',
        gpsCoordinate: [24.4539, 54.3773]
      },
      lastUpdated: new Date('2024-12-19T12:30:00Z')
    }
  };

  constructor() {
    // 서비스 초기화
  }

  // 전화번호 유효성 검증
  validatePhoneNumber(phone: string): boolean {
    // Normalize: remove all non-digits, drop leading 00 (international prefix)
    const digitsOnly = phone.replace(/[^0-9]/g, '');
    const normalized = digitsOnly.startsWith('00') ? digitsOnly.slice(2) : digitsOnly;
    // Accept forms like +971-50-123-4567, 971501234567, 00971 50 123 4567
    // After normalization, valid numbers should start with 971 followed by 9 digits (e.g., 971501234567)
    const pattern = /^971\d{9}$/;
    return pattern.test(normalized);
  }

  // LPO 번호 유효성 검증
  validateLPONumber(lpoNumber: string): boolean {
    const lpoRegex = /^LPO-\d{4}-\d{6}$/i;
    return lpoRegex.test(lpoNumber);
  }

  // 파일 유효성 검증
  validateFile(file: File, documentType: string): ValidationResult {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: '파일 크기는 10MB를 초과할 수 없습니다.'
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'JPG, PNG, PDF 파일만 업로드 가능합니다.'
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

    // 실제 구현에서는 파일 업로드 API 호출
    return {
      id: Date.now().toString(),
      type: documentType as any,
      fileName: file.name,
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date(),
      status: 'pending'
    };
  }

  // 신청서 제출
  async submitApplication(application: DriverApplication): Promise<ApplicationResult> {
    try {
      // 필수 필드 검증
      if (!application.driverName?.trim()) {
        throw new Error('운전자 성명은 필수입니다.');
      }

      if (!application.phone?.trim()) {
        throw new Error('전화번호는 필수입니다.');
      }

      if (!this.validatePhoneNumber(application.phone)) {
        throw new Error('올바른 전화번호 형식을 입력해주세요.');
      }

      if (!application.company?.trim()) {
        throw new Error('회사명은 필수입니다.');
      }

      // 실제 구현에서는 API 호출
      const response = await fetch(`${this.API_BASE_URL}/mosb/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(application),
      });

      if (!response.ok) {
        throw new Error(`신청서 제출 실패: ${response.status}`);
      }

      const result = await response.json();
      return {
        id: result.id || Date.now().toString(),
        status: 'submitted',
        driverName: application.driverName,
        submittedAt: new Date()
      };
    } catch (error) {
      console.error('신청서 제출 실패:', error);
      throw error;
    }
  }

  // LPO 위치 정보 조회
  async getLocationInfo(lpoNumber: string): Promise<LocationResult | null> {
    try {
      // LPO 번호 유효성 검증
      if (!this.validateLPONumber(lpoNumber)) {
        throw new Error('올바른 LPO 번호 형식을 입력해주세요.');
      }

      // Mock 데이터에서 조회
      const locationData = this.mockLPOLocations[lpoNumber];
      
      if (!locationData) {
        return null; // LPO를 찾을 수 없음
      }
      return locationData;
    } catch (error) {
      console.error('LPO 위치 정보 조회 실패:', error);
      throw new Error('LPO 위치 정보 조회 중 오류가 발생했습니다.');
    }
  }

  // 신청서 상태 조회
  async getApplicationStatus(applicationId: string): Promise<ApplicationResult | null> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/mosb/applications/${applicationId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // 신청서를 찾을 수 없음
        }
        throw new Error(`상태 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('신청서 상태 조회 실패:', error);
      throw new Error('신청서 상태 조회 중 오류가 발생했습니다.');
    }
  }

  // 신청서 목록 조회
  async getApplicationList(): Promise<ApplicationResult[]> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/mosb/applications`);
      
      if (!response.ok) {
        throw new Error(`목록 조회 실패: ${response.status}`);
      }

      const result = await response.json();
      return result.applications || [];
    } catch (error) {
      console.error('신청서 목록 조회 실패:', error);
      throw new Error('신청서 목록 조회 중 오류가 발생했습니다.');
    }
  }

  // 신청서 삭제
  async deleteApplication(applicationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/mosb/applications/${applicationId}`, {
        method: 'DELETE'
      });
      
      return response.ok;
    } catch (error) {
      console.error('신청서 삭제 실패:', error);
      throw new Error('신청서 삭제 중 오류가 발생했습니다.');
    }
  }

  // 배치 처리: 여러 LPO 조회
  async getMultipleLocations(lpoNumbers: string[]): Promise<Map<string, LocationResult | null>> {
    const results = new Map<string, LocationResult | null>();
    
    const promises = lpoNumbers.map(async (lpoNumber) => {
      try {
        const location = await this.getLocationInfo(lpoNumber);
        results.set(lpoNumber, location);
      } catch (error) {
        console.error(`LPO ${lpoNumber} 조회 실패:`, error);
        results.set(lpoNumber, null);
      }
    });

    await Promise.all(promises);
    return results;
  }

  // 통계 정보 조회
  async getStatistics(): Promise<{
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
  }> {
    try {
      const applications = await this.getApplicationList();
      
      return {
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'submitted').length,
        approvedApplications: applications.filter(app => app.status === 'approved').length,
        rejectedApplications: applications.filter(app => app.status === 'rejected').length
      };
    } catch (error) {
      console.error('통계 조회 실패:', error);
      throw new Error('통계 조회 중 오류가 발생했습니다.');
    }
  }
}

export default MOSBEntryService; 