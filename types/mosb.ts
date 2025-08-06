// types/mosb.ts - MOSB 관련 타입 정의

export interface DriverDocument {
  id: string;
  name: string;
  type: 'uaeId' | 'drivingLicense' | 'packingList' | 'safetyCertificate';
  file: File;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DriverApplication {
  id: string;
  driverName: string;
  phone: string;
  email: string;
  company: string;
  vehicleType: string;
  visitDate: string;
  visitPurpose: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedAt: Date;
  approvedAt?: Date;
  adnocReferenceNumber?: string;
  rejectionReason?: string;
  documents: {
    uaeId: boolean;
    drivingLicense: boolean;
    packingList: boolean;
    safetyCertificate?: boolean;
  };
  notes?: string;
}

export interface ApplicationUpdate {
  status?: 'submitted' | 'under_review' | 'approved' | 'rejected';
  adnocReferenceNumber?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface ApplicationResponse {
  success: boolean;
  application?: DriverApplication;
  message?: string;
  error?: string;
}

export interface ApplicationsListResponse {
  success: boolean;
  applications: DriverApplication[];
  total: number;
  page: number;
  limit: number;
}

export interface LocationInfo {
  building: string;
  zone: string;
  contact: string;
  instructions: string[];
  operatingHours: string;
  gpsCoordinate?: [number, number];
}

export interface LPOLocation {
  lpoNumber: string;
  location: LocationInfo;
  lastUpdated: Date;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
} 