import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock the custom hook with a controllable mock
jest.mock('../hooks/useLPOMatching', () => ({
  __esModule: true,
  useLPOMatching: jest.fn(),
}));
const { useLPOMatching } = require('../hooks/useLPOMatching') as { useLPOMatching: jest.Mock };

describe('LPO Integration Test', () => {
  it('should render LPO inbound match component', () => {
    useLPOMatching.mockReturnValue({
      result: null,
      loading: false,
      error: null,
      queryLPO: jest.fn(),
      reset: jest.fn(),
    });
    const Comp = require('../components/LPOInboundMatch').default;
    render(<Comp />);
    
    // Check if the scanner form is rendered
    expect(screen.getByPlaceholderText('LPO 번호를 입력하세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /확인/i })).toBeInTheDocument();
  });

  it('should show loading state when loading', async () => {
    useLPOMatching.mockReturnValue({
      result: null,
      loading: true,
      error: null,
      queryLPO: jest.fn(),
      reset: jest.fn(),
    });
    const Comp = require('../components/LPOInboundMatch').default;
    render(<Comp />);
    expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument();
  });

  it('should show error message when error occurs', async () => {
    useLPOMatching.mockReturnValue({
      result: null,
      loading: false,
      error: 'LPO 번호를 찾을 수 없습니다.',
      queryLPO: jest.fn(),
      reset: jest.fn(),
    });
    const Comp = require('../components/LPOInboundMatch').default;
    render(<Comp />);
    expect(screen.getByText('LPO 번호를 찾을 수 없습니다.')).toBeInTheDocument();
  });
}); 