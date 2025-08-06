import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QRScanner from '../components/molecules/QRScanner';

// Mock the QR scanner library
jest.mock('@yudiel/react-qr-scanner', () => ({
  Scanner: ({ onScan }: { onScan: (result: string) => void }) => (
    <div data-testid="qr-scanner">
      <button 
        onClick={() => onScan('LPO123')}
        data-testid="mock-scan-button"
      >
        Mock Scan
      </button>
    </div>
  ),
  useDevices: () => ({
    devices: [
      { deviceId: '1', label: 'Camera 1' },
      { deviceId: '2', label: 'Camera 2' }
    ],
    selectedDevice: '1',
    selectDevice: jest.fn()
  })
}));

describe('QRScanner', () => {
  const mockOnScanned = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('스캔 기능', () => {
    it('shouldTriggerScanAndReturnLpoCode', async () => {
      const user = userEvent.setup();
      render(<QRScanner onScanned={mockOnScanned} />);

      // 스캐너가 렌더링되었는지 확인
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();

      // Mock 스캔 버튼 클릭
      const scanButton = screen.getByTestId('mock-scan-button');
      await user.click(scanButton);

      // onScanned 콜백이 올바른 코드와 함께 호출되었는지 확인
      expect(mockOnScanned).toHaveBeenCalledWith('LPO123');
    });

    it('shouldShowCameraSelectionWhenMultipleDevicesAvailable', () => {
      render(<QRScanner onScanned={mockOnScanned} />);

      // 카메라 선택 드롭다운이 표시되는지 확인
      expect(screen.getByText('Camera 1')).toBeInTheDocument();
      expect(screen.getByText('Camera 2')).toBeInTheDocument();
    });

    it('shouldHandleScanErrorGracefully', async () => {
      const user = userEvent.setup();
      render(<QRScanner onScanned={mockOnScanned} />);

      // 에러 상황 시뮬레이션 (빈 스캔 결과)
      const scanButton = screen.getByTestId('mock-scan-button');
      
      // Mock: 빈 결과 반환
      jest.mocked(require('@yudiel/react-qr-scanner').Scanner).mockImplementationOnce(
        ({ onScan }: { onScan: (result: string) => void }) => (
          <div data-testid="qr-scanner">
            <button 
              onClick={() => onScan('')}
              data-testid="mock-scan-button"
            >
              Mock Empty Scan
            </button>
          </div>
        )
      );

      await user.click(scanButton);

      // 빈 결과는 onScanned를 호출하지 않아야 함
      expect(mockOnScanned).not.toHaveBeenCalled();
    });

    it('shouldToggleScannerVisibility', async () => {
      const user = userEvent.setup();
      render(<QRScanner onScanned={mockOnScanned} />);

      // 초기에는 스캐너가 숨겨져 있어야 함
      expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument();

      // 스캐너 열기 버튼 클릭
      const openButton = screen.getByText('📷 QR/바코드 스캔');
      await user.click(openButton);

      // 스캐너가 표시되어야 함
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();

      // 스캐너 닫기 버튼 클릭
      const closeButton = screen.getByText('닫기');
      await user.click(closeButton);

      // 스캐너가 다시 숨겨져야 함
      expect(screen.queryByTestId('qr-scanner')).not.toBeInTheDocument();
    });

    it('shouldShowLoadingStateWhileInitializing', () => {
      // Mock: 초기화 중 상태
      jest.mocked(require('@yudiel/react-qr-scanner').useDevices).mockReturnValueOnce({
        devices: [],
        selectedDevice: null,
        selectDevice: jest.fn()
      });

      render(<QRScanner onScanned={mockOnScanned} />);

      // 로딩 상태 표시 확인
      expect(screen.getByText('카메라 초기화 중...')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('shouldHaveProperARIALabels', () => {
      render(<QRScanner onScanned={mockOnScanned} />);

      const openButton = screen.getByText('📷 QR/바코드 스캔');
      expect(openButton).toHaveAttribute('aria-label', 'QR 코드 또는 바코드 스캔 시작');
    });

    it('shouldBeKeyboardAccessible', async () => {
      const user = userEvent.setup();
      render(<QRScanner onScanned={mockOnScanned} />);

      const openButton = screen.getByText('📷 QR/바코드 스캔');
      
      // Tab으로 포커스 이동
      await user.tab();
      expect(openButton).toHaveFocus();

      // Enter 키로 스캐너 열기
      await user.keyboard('{Enter}');
      expect(screen.getByTestId('qr-scanner')).toBeInTheDocument();
    });
  });
}); 