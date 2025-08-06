import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LPOScannerForm from '../components/molecules/LPOScannerForm';

describe('LPOScannerForm', () => {
  const mockOnScanned = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render input field and button', () => {
    render(<LPOScannerForm onScanned={mockOnScanned} />);
    
    expect(screen.getByPlaceholderText('LPO 번호를 입력하세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /확인/i })).toBeInTheDocument();
  });

  it('should call onScanned when button is clicked with valid input', async () => {
    const user = userEvent.setup();
    render(<LPOScannerForm onScanned={mockOnScanned} />);
    
    const input = screen.getByPlaceholderText('LPO 번호를 입력하세요');
    const button = screen.getByRole('button', { name: /확인/i });
    
    await user.type(input, 'LPO123');
    await user.click(button);
    
    expect(mockOnScanned).toHaveBeenCalledWith('LPO123');
  });

  it('should call onScanned when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<LPOScannerForm onScanned={mockOnScanned} />);
    
    const input = screen.getByPlaceholderText('LPO 번호를 입력하세요');
    
    await user.type(input, 'LPO456');
    await user.keyboard('{Enter}');
    
    expect(mockOnScanned).toHaveBeenCalledWith('LPO456');
  });

  it('should not call onScanned with empty input', async () => {
    const user = userEvent.setup();
    render(<LPOScannerForm onScanned={mockOnScanned} />);
    
    const button = screen.getByRole('button', { name: /확인/i });
    
    await user.click(button);
    
    expect(mockOnScanned).not.toHaveBeenCalled();
  });

  it('should show loading state when loading prop is true', () => {
    render(<LPOScannerForm onScanned={mockOnScanned} loading={true} />);
    
    expect(screen.getByRole('button', { name: /확인 중.../i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('LPO 번호를 입력하세요')).toBeDisabled();
  });

  it('should display error message when error prop is provided', () => {
    const errorMessage = 'LPO 번호를 찾을 수 없습니다.';
    render(<LPOScannerForm onScanned={mockOnScanned} error={errorMessage} />);
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should clear input after successful submission', async () => {
    const user = userEvent.setup();
    render(<LPOScannerForm onScanned={mockOnScanned} />);
    
    const input = screen.getByPlaceholderText('LPO 번호를 입력하세요');
    
    await user.type(input, 'LPO789');
    await user.keyboard('{Enter}');
    
    expect(input).toHaveValue('');
  });
}); 