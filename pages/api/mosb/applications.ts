// pages/api/mosb/applications.ts - MOSB 신청서 처리 API

import { NextApiRequest, NextApiResponse } from 'next';
import { DriverApplication, ApplicationStats } from '../../../types/mosb';

// 메모리 저장소 (실제로는 데이터베이스 사용)
let applications: DriverApplication[] = [];
let applicationCounter = 1;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// 신청서 목록 조회
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { status, limit = '10', page = '1' } = req.query;
    
    let filteredApplications = applications;
    
    // 상태별 필터링
    if (status && typeof status === 'string') {
      filteredApplications = applications.filter(app => app.status === status);
    }
    
    // 페이지네이션
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedApplications = filteredApplications
      .sort((a, b) => new Date(b.submittedAt || '').getTime() - new Date(a.submittedAt || '').getTime())
      .slice(startIndex, endIndex);
    
    res.status(200).json({
      applications: paginatedApplications,
      total: filteredApplications.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filteredApplications.length / limitNum)
    });
    
  } catch (error) {
    console.error('Applications GET error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 신규 신청서 제출
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const applicationData = req.body;
    
    // 필수 필드 검증
    const requiredFields = ['driverName', 'phone', 'company', 'visitDate', 'vehicleNumber', 'documents'];
    const missingFields = requiredFields.filter(field => !applicationData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        missingFields 
      });
    }
    
    // 서류 개수 검증
    if (!Array.isArray(applicationData.documents) || applicationData.documents.length < 3) {
      return res.status(400).json({ 
        error: 'All required documents must be uploaded' 
      });
    }
    
    // 전화번호 형식 검증
    const phoneRegex = /^(\+971|00971|971)?[\s-]?[0-9]{1,2}[\s-]?[0-9]{3}[\s-]?[0-9]{4}$/;
    if (!phoneRegex.test(applicationData.phone.replace(/\s|-/g, ''))) {
      return res.status(400).json({ 
        error: 'Invalid phone number format' 
      });
    }
    
    // 새로운 신청서 생성
    const newApplication: DriverApplication = {
      id: `MSB-${new Date().getFullYear()}-${applicationCounter.toString().padStart(6, '0')}`,
      ...applicationData,
      status: 'submitted',
      submittedAt: new Date(),
      documents: applicationData.documents.map((doc: any, index: number) => ({
        ...doc,
        id: doc.id || `doc_${Date.now()}_${index}`,
        uploadedAt: new Date(doc.uploadedAt || Date.now()),
        status: 'pending'
      }))
    };
    
    applicationCounter++;
    applications.push(newApplication);
    
    // 성공 응답
    res.status(201).json({
      success: true,
      application: newApplication,
      message: 'Application submitted successfully'
    });
    
    // 백그라운드에서 알림 전송 (실제로는 큐 시스템 사용)
    setTimeout(() => {
      sendNotification(newApplication);
    }, 1000);
    
  } catch (error) {
    console.error('Application POST error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// 알림 전송 함수 (WhatsApp, Email 등)
async function sendNotification(application: DriverApplication) {
  try {
    // WhatsApp 알림 (실제로는 WhatsApp Business API 사용)
    const message = `
🚚 MOSB Entry Application Received

신청번호: ${application.id}
운전자: ${application.driverName}
회사: ${application.company}
방문일: ${application.visitDate}

Samsung C&T에서 ADNOC 승인을 진행합니다.
승인 완료 시 연락드리겠습니다.

문의: +971-XX-XXX-XXXX
`;
    
    console.log('Sending notification to:', application.phone);
    console.log('Message:', message);
    
    // 실제 WhatsApp API 호출 또는 Email 발송
    // await sendWhatsApp(application.phone, message);
    // await sendEmail(application, 'submitted');
    
  } catch (error) {
    console.error('Notification error:', error);
  }
} 