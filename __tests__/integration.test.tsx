import React from 'react';
import { render, screen } from '@testing-library/react';
import LPOInboundMatch from '../components/LPOInboundMatch';

// Mock the custom hook
jest.mock('../hooks/useLPOMatching', () => ({
  useLPOMatching: () => ({
    result: null,
    loading: false,
    error: null,
    queryLPO: jest.fn(),
    reset: jest.fn(),
  }),
}));

describe('LPO Integration Test', () => {
  it('should render LPO inbound match component', () => {
    render(<LPOInboundMatch />);
    
    // Check if the scanner form is rendered
    expect(screen.getByPlaceholderText('LPO 번호를 입력하세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /확인/i })).toBeInTheDocument();
  });

  it('should show loading state when loading', () => {
    // Mock loading state
    jest.doMock('../hooks/useLPOMatching', () => ({
      useLPOMatching: () => ({
        result: null,
        loading: true,
        error: null,
        queryLPO: jest.fn(),
        reset: jest.fn(),
      }),
    }));

    render(<LPOInboundMatch />);
    
    expect(screen.getByText('데이터를 불러오는 중...')).toBeInTheDocument();
  });

  it('should show error message when error occurs', () => {
    // Mock error state
    jest.doMock('../hooks/useLPOMatching', () => ({
      useLPOMatching: () => ({
        result: null,
        loading: false,
        error: 'LPO 번호를 찾을 수 없습니다.',
        queryLPO: jest.fn(),
        reset: jest.fn(),
      }),
    }));

    render(<LPOInboundMatch />);
    
    expect(screen.getByText('LPO 번호를 찾을 수 없습니다.')).toBeInTheDocument();
  });
}); 