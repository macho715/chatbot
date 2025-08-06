// types/mosb.ts - MOSB 시스템 타입 정의

export interface DriverDocument {
  id: string;
  type: 'uae_id' | 'packing_list' | 'license';
  fileName: string;
  fileUrl?: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DriverApplication {
  id: string;
  driverName: string;
  phone: string;
  company: string;
  visitDate: string;
  vehicleNumber: string;
  documents: DriverDocument[];
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedAt?: Date;
  approvedAt?: Date;
  adnocReferenceNumber?: string;
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