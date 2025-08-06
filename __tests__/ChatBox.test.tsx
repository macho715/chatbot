import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MOSBGateAgentApp from '../components/ChatBox';

// Mock child components
jest.mock('../components/LPOInboundMatch', () => {
  return function MockLPOInboundMatch() {
    return <div data-testid="lpo-inbound-match">LPO Inbound Match Component</div>;
  };
});

jest.mock('../components/molecules/QRCodeGenerator', () => {
  return function MockQRCodeGenerator() {
    return <div data-testid="qr-code-generator">QR Code Generator Component</div>;
  };
});

jest.mock('../components/organisms/ScanHistory', () => {
  return function MockScanHistory() {
    return <div data-testid="scan-history">Scan History Component</div>;
  };
});

jest.mock('../components/organisms/BatchScanner', () => {
  return function MockBatchScanner() {
    return <div data-testid="batch-scanner">Batch Scanner Component</div>;
  };
});

describe('MOSBGateAgentApp (ChatBox)', () => {
  it('should render main menu with all navigation buttons', () => {
    render(<MOSBGateAgentApp />);
    
    // Check if all main menu buttons are rendered
    expect(screen.getByText('🔄 Gate Pass 조회')).toBeInTheDocument();
    expect(screen.getByText('🚚 차량 ETA 등록')).toBeInTheDocument();
    expect(screen.getByText('📤 문서 제출 (PPE / MSDS)')).toBeInTheDocument();
    expect(screen.getByText('🧾 출입 이력 보기')).toBeInTheDocument();
    expect(screen.getByText('📢 공지사항 확인')).toBeInTheDocument();
    expect(screen.getByText('📦 LPO 인바운드 매치')).toBeInTheDocument();
    expect(screen.getByText('📱 QR 코드 생성')).toBeInTheDocument();
    expect(screen.getByText('📋 스캔 히스토리')).toBeInTheDocument();
    expect(screen.getByText('🚀 배치 스캔')).toBeInTheDocument();
  });

  it('should navigate to LPO inbound match when clicked', () => {
    render(<MOSBGateAgentApp />);
    
    const lpoButton = screen.getByText('📦 LPO 인바운드 매치');
    fireEvent.click(lpoButton);
    
    expect(screen.getByTestId('lpo-inbound-match')).toBeInTheDocument();
    expect(screen.getByText('🔙 메뉴로 돌아가기')).toBeInTheDocument();
  });

  it('should navigate to QR generator when clicked', () => {
    render(<MOSBGateAgentApp />);
    
    const qrButton = screen.getByText('📱 QR 코드 생성');
    fireEvent.click(qrButton);
    
    expect(screen.getByTestId('qr-code-generator')).toBeInTheDocument();
    expect(screen.getByText('🔙 메뉴로 돌아가기')).toBeInTheDocument();
  });

  it('should navigate to scan history when clicked', () => {
    render(<MOSBGateAgentApp />);
    
    const historyButton = screen.getByText('📋 스캔 히스토리');
    fireEvent.click(historyButton);
    
    expect(screen.getByTestId('scan-history')).toBeInTheDocument();
    expect(screen.getByText('🔙 메뉴로 돌아가기')).toBeInTheDocument();
  });

  it('should navigate to batch scanner when clicked', () => {
    render(<MOSBGateAgentApp />);
    
    const batchButton = screen.getByText('🚀 배치 스캔');
    fireEvent.click(batchButton);
    
    expect(screen.getByTestId('batch-scanner')).toBeInTheDocument();
    expect(screen.getByText('🔙 메뉴로 돌아가기')).toBeInTheDocument();
  });

  it('should return to main menu when back button is clicked', () => {
    render(<MOSBGateAgentApp />);
    
    // Navigate to a sub-menu first
    const lpoButton = screen.getByText('📦 LPO 인바운드 매치');
    fireEvent.click(lpoButton);
    
    // Verify we're in the sub-menu
    expect(screen.getByTestId('lpo-inbound-match')).toBeInTheDocument();
    
    // Click back button
    const backButton = screen.getByText('🔙 메뉴로 돌아가기');
    fireEvent.click(backButton);
    
    // Verify we're back to main menu
    expect(screen.getByText('🔄 Gate Pass 조회')).toBeInTheDocument();
    expect(screen.queryByTestId('lpo-inbound-match')).not.toBeInTheDocument();
  });

  it('should show placeholder content for unimplemented features', () => {
    render(<MOSBGateAgentApp />);
    
    // Navigate to unimplemented features
    const gateButton = screen.getByText('🔄 Gate Pass 조회');
    fireEvent.click(gateButton);
    
    expect(screen.getByText(/Gate Pass 상태 조회 모듈/)).toBeInTheDocument();
  });
}); 