// pages/api/mosb/applications/[id].ts - 개별 신청서 조회/수정 API

import { NextApiRequest, NextApiResponse } from 'next';
import { DriverApplication } from '../../../../types/mosb';

// 임시 데이터 저장소 (실제로는 외부 applications.ts에서 import하거나 DB 사용)
let applications: DriverApplication[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const { id } = query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid application ID' });
  }

  switch (method) {
    case 'GET':
      return handleGet(req, res, id);
    case 'PUT':
      return handlePut(req, res, id);
    case 'DELETE':
      return handleDelete(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// 개별 신청서 조회
async function handleGet(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const application = applications.find(app => app.id === id);
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.status(200).json(application);
    
  } catch (error) {
    console.error('Application GET error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 신청서 상태 업데이트 (관리자용)
async function handlePut(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const updates = req.body;
    const applicationIndex = applications.findIndex(app => app.id === id);
    
    if (applicationIndex === -1) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const application = applications[applicationIndex];
    
    // 상태 업데이트 검증
    const allowedStatuses = ['submitted', 'under_review', 'approved', 'rejected'];
    if (updates.status && !allowedStatuses.includes(updates.status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    // 승인/반려 시 필수 정보 추가
    if (updates.status === 'approved') {
      updates.approvedAt = new Date();
      updates.adnocReferenceNumber = updates.adnocReferenceNumber || `ADNOC-${Date.now()}`;
    }
    
    // 신청서 업데이트
    applications[applicationIndex] = {
      ...application,
      ...updates,
      id: application.id, // ID는 변경 불가
      submittedAt: application.submittedAt, // 제출일은 변경 불가
    };
    
    const updatedApplication = applications[applicationIndex];
    
    res.status(200).json({
      success: true,
      application: updatedApplication,
      message: `Application ${updates.status || 'updated'} successfully`
    });
    
    // 상태 변경 알림 전송
    if (updates.status) {
      setTimeout(() => {
        sendStatusUpdateNotification(updatedApplication);
      }, 1000);
    }
    
  } catch (error) {
    console.error('Application PUT error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 신청서 삭제 (관리자용)
async function handleDelete(req: NextApiRequest, res: NextApiResponse, id: string) {
  try {
    const applicationIndex = applications.findIndex(app => app.id === id);
    
    if (applicationIndex === -1) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const deletedApplication = applications[applicationIndex];
    applications.splice(applicationIndex, 1);
    
    res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
      deletedApplication
    });
    
  } catch (error) {
    console.error('Application DELETE error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 상태 업데이트 알림 전송
async function sendStatusUpdateNotification(application: DriverApplication) {
  try {
    let message = '';
    
    switch (application.status) {
      case 'under_review':
        message = `
🔍 신청서 검토 중

신청번호: ${application.id}
상태: 서류 검토 진행 중

Samsung C&T에서 서류를 검토하고 있습니다.
곧 ADNOC 승인 신청을 진행할 예정입니다.
`;
        break;
        
      case 'approved':
        message = `
✅ 승인 완료!

신청번호: ${application.id}
ADNOC 참조번호: ${application.adnocReferenceNumber}
승인일: ${new Date(application.approvedAt!).toLocaleDateString('ko-KR')}

방문일: ${application.visitDate}

📍 MOSB 위치 안내:
- 주소: MOSB Gate, Abu Dhabi
- 운영시간: 06:00 - 22:00
- 연락처: +971-XX-XXX-XXXX

⚠️ 주의사항:
- 안전모, 안전조끼 착용 필수
- UAE ID, 운전면허증, Packing List 지참
- 도착 시 보안데스크에 먼저 보고

문의: +971-XX-XXX-XXXX
`;
        break;
        
      case 'rejected':
        message = `
❌ 승인 거부

신청번호: ${application.id}
상태: 승인 거부됨

사유: 서류 불비 또는 요구사항 미충족

다시 신청하시려면 올바른 서류로 재제출해주세요.

문의: +971-XX-XXX-XXXX
`;
        break;
    }
    
    console.log('Sending status update to:', application.phone);
    console.log('Message:', message);
    
    // 실제 알림 발송
    // await sendWhatsApp(application.phone, message);
    // await sendEmail(application, application.status);
    
  } catch (error) {
    console.error('Status notification error:', error);
  }
} 