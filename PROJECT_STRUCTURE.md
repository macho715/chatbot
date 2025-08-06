# 프로젝트 파일 구조 문서

## 📁 전체 프로젝트 구조

```
mosb-gate-agent-chatgpt-v2/
├── 📄 package.json                 # 프로젝트 설정 및 의존성
├── 📄 tsconfig.json               # TypeScript 설정
├── 📄 next.config.js              # Next.js 설정
├── 📄 jest.config.js              # Jest 테스트 설정
├── 📄 jest.setup.ts               # Jest 테스트 환경 설정
├── 📄 tailwind.config.js          # Tailwind CSS 설정
├── 📄 postcss.config.js           # PostCSS 설정
├── 📄 PROJECT_DOCUMENTATION.md    # 프로젝트 전체 문서
├── 📄 PROJECT_STRUCTURE.md        # 이 파일 (프로젝트 구조 문서)
│
├── 📁 pages/                      # Next.js 페이지 디렉토리
│   ├── 📄 _app.tsx               # 앱 전체 설정 (글로벌 CSS)
│   ├── 📄 index.tsx              # 메인 페이지
│   └── 📁 api/                   # API 라우트
│       └── 📄 lpo-match.ts       # LPO 매칭 API 엔드포인트
│
├── 📁 components/                 # React 컴포넌트
│   ├── 📄 ChatBox.tsx            # 메인 채팅 박스 컴포넌트
│   ├── 📄 LPOInboundMatch.tsx    # LPO 인바운드 매칭 메인 컴포넌트
│   │
│   ├── 📁 atoms/                 # Atomic Design - 기본 UI 컴포넌트
│   │   ├── 📄 Button.tsx         # 재사용 가능한 버튼 컴포넌트
│   │   └── 📄 Input.tsx          # 재사용 가능한 입력 필드 컴포넌트
│   │
│   ├── 📁 molecules/             # Atomic Design - 분자 단위 컴포넌트
│   │   └── 📄 LPOScannerForm.tsx # LPO 번호 입력 폼 컴포넌트
│   │
│   └── 📁 organisms/             # Atomic Design - 유기체 단위 컴포넌트
│       └── 📄 LPOMatchingResult.tsx # LPO 매칭 결과 표시 컴포넌트
│
├── 📁 services/                   # 비즈니스 로직 계층
│   └── 📄 MatchingService.ts     # LPO 매칭 비즈니스 로직
│
├── 📁 repositories/               # 데이터 접근 계층
│   └── 📄 Repo.ts                # 데이터베이스 접근 로직
│
├── 📁 hooks/                      # 커스텀 React 훅
│   └── 📄 useLPOMatching.ts      # LPO 매칭 상태 관리 훅
│
├── 📁 styles/                     # 스타일 파일
│   └── 📄 globals.css            # 글로벌 CSS 스타일
│
└── 📁 __tests__/                  # 테스트 파일
    ├── 📄 MatchingService.test.ts # MatchingService 단위 테스트
    ├── 📄 LPOScannerForm.test.tsx # LPOScannerForm 컴포넌트 테스트
    ├── 📄 integration.test.tsx    # 통합 테스트
    └── 📄 simple.test.ts          # 기본 테스트 설정 확인
```

---

## 📄 주요 파일 상세 설명

### 🔧 설정 파일들

#### `package.json`
```json
{
  "name": "mosb-gate-agent",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",           # 개발 서버 실행
    "build": "next build",       # 프로덕션 빌드
    "start": "next start",       # 프로덕션 서버 실행
    "test": "jest",              # 테스트 실행
    "test:watch": "jest --watch" # 테스트 감시 모드
  },
  "dependencies": {
    "next": "^14.0.0",           # Next.js 프레임워크
    "react": "^18.2.0",          # React 라이브러리
    "react-dom": "^18.2.0",      # React DOM
    "tailwindcss": "^3.3.0"      # CSS 프레임워크
  },
  "devDependencies": {
    "@testing-library/react": "^16.3.0",    # React 테스트 라이브러리
    "@testing-library/jest-dom": "^6.6.4",  # Jest DOM 매처
    "jest": "^30.0.5",                      # 테스트 프레임워크
    "typescript": "5.9.2"                   # TypeScript
  }
}
```

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",           # 컴파일 타겟
    "jsx": "preserve",            # JSX 처리 방식 (Next.js 자동 변환)
    "baseUrl": ".",               # 모듈 해석 기준 경로
    "paths": {
      "@/*": ["./*"]              # 경로 별칭 설정
    }
  }
}
```

#### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,          # React Strict Mode 활성화
}

module.exports = nextConfig
```

#### `jest.config.js`
```javascript
const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',  # DOM 환경 설정
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',              # 경로 별칭 매핑
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],  # 테스트 환경 설정
};

module.exports = createJestConfig(customJestConfig);
```

---

### 🏠 페이지 파일들

#### `pages/_app.tsx`
```typescript
import '../styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```
**역할**: 앱 전체 설정, 글로벌 CSS 임포트

#### `pages/index.tsx`
```typescript
import ChatBox from '../components/ChatBox';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <ChatBox />
    </div>
  );
}
```
**역할**: 메인 페이지, ChatBox 컴포넌트 렌더링

#### `pages/api/lpo-match.ts`
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { MatchingService } from '../../services/MatchingService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const lpoNo = req.query.lpoNo as string;
  
  try {
    const result = await MatchingService.matchLpo(lpoNo);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
```
**역할**: LPO 매칭 API 엔드포인트

---

### 🧩 컴포넌트 파일들

#### `components/ChatBox.tsx`
```typescript
import { useState } from 'react';
import LPOInboundMatch from './LPOInboundMatch';

const ChatBox: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  return (
    <div className="container mx-auto p-4">
      {/* 메뉴 버튼들 */}
      <div className="mb-6 space-y-2">
        <button
          onClick={() => setSelectedFeature('lpo-match')}
          className="w-full p-3 text-left bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          🔍 LPO 인바운드 매치
        </button>
      </div>

      {/* 선택된 기능 렌더링 */}
      {selectedFeature === 'lpo-match' && <LPOInboundMatch />}
    </div>
  );
};
```
**역할**: 메인 UI 컨테이너, 기능 선택 메뉴

#### `components/atoms/Button.tsx`
```typescript
import React from 'react';

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = React.memo(({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button'
}) => {
  // 버튼 스타일 로직
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
});
```
**역할**: 재사용 가능한 버튼 컴포넌트

#### `components/atoms/Input.tsx`
```typescript
import React from 'react';

export interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'search';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  required?: boolean;
}

const Input: React.FC<InputProps> = React.memo(({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  className = '',
  onKeyPress,
  required = false
}) => {
  // 입력 필드 렌더링 로직
});
```
**역할**: 재사용 가능한 입력 필드 컴포넌트

#### `components/molecules/LPOScannerForm.tsx`
```typescript
import React from 'react';
import Input from '../atoms/Input';
import Button from '../atoms/Button';

export interface LPOScannerFormProps {
  onScanned: (code: string) => void;
  loading?: boolean;
  error?: string;
}

const LPOScannerForm: React.FC<LPOScannerFormProps> = ({
  onScanned,
  loading = false,
  error
}) => {
  const [manual, setManual] = React.useState('');

  const handleSubmit = () => {
    if (manual.trim() && !loading) {
      onScanned(manual.trim());
      setManual('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={manual}
          onChange={setManual}
          placeholder="LPO 번호를 입력하세요"
          onKeyPress={handleKeyPress}
          disabled={loading}
          error={error}
        />
        <Button
          onClick={handleSubmit}
          disabled={loading || !manual.trim()}
          variant="primary"
        >
          {loading ? '확인 중...' : '확인'}
        </Button>
      </div>
    </div>
  );
};
```
**역할**: LPO 번호 입력 폼 (Input + Button 조합)

#### `components/organisms/LPOMatchingResult.tsx`
```typescript
import React from 'react';
import Button from '../atoms/Button';
import { MatchingResult } from '../../services/MatchingService';

export interface LPOMatchingResultProps {
  result: MatchingResult;
  onReset: () => void;
}

const LPOMatchingResult: React.FC<LPOMatchingResultProps> = ({
  result,
  onReset
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'MATCH': return 'text-green-600 bg-green-50 border-green-200';
      case 'MISSING': return 'text-red-600 bg-red-50 border-red-200';
      case 'EXCESS': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 요약 정보 */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">LPO: {result.lpoNo}</h3>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600">✅ 일치: {summary.match}</span>
          <span className="text-red-600">❌ 누락: {summary.missing}</span>
          <span className="text-yellow-600">⚠️ 초과: {summary.excess}</span>
        </div>
      </div>

      {/* 아이템 목록 */}
      <div className="space-y-3">
        {result.items.map((item, index) => (
          <div key={`${item.itemCode}-${index}`} className={`p-4 rounded-lg border ${getStatusColor(item.status)}`}>
            {/* 아이템 상세 정보 */}
          </div>
        ))}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <Button onClick={onReset} variant="secondary" className="flex-1">
          다시 확인
        </Button>
      </div>
    </div>
  );
};
```
**역할**: LPO 매칭 결과 표시 (복잡한 UI 조합)

#### `components/LPOInboundMatch.tsx`
```typescript
import React from 'react';
import LPOScannerForm from './molecules/LPOScannerForm';
import LPOMatchingResult from './organisms/LPOMatchingResult';
import { useLPOMatching } from '../hooks/useLPOMatching';

const LPOInboundMatch: React.FC = () => {
  const { result, loading, error, queryLPO, reset } = useLPOMatching();

  return (
    <div className="space-y-6">
      <LPOScannerForm
        onScanned={queryLPO}
        loading={loading}
        error={error}
      />
      
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      )}
      
      {result && (
        <LPOMatchingResult
          result={result}
          onReset={reset}
        />
      )}
    </div>
  );
};
```
**역할**: LPO 인바운드 매칭 메인 컴포넌트 (조합 컴포넌트)

---

### 🔧 서비스 및 데이터 계층

#### `services/MatchingService.ts`
```typescript
import { Repo, LpoItem, InboundItem } from '../repositories/Repo';

export interface MatchingItem {
  itemCode: string;
  itemName: string;
  lpoQuantity: number;
  inboundQuantity: number;
  difference: number;
  status: 'MATCH' | 'MISSING' | 'EXCESS';
}

export interface MatchingResult {
  lpoNo: string;
  items: MatchingItem[];
}

export class MatchingService {
  static async matchLpo(lpoNo: string): Promise<MatchingResult | null> {
    const lpoItems = await Repo.getLpoItems(lpoNo);
    const inboundItems = await Repo.getInboundItems(lpoNo);

    if (!lpoItems || lpoItems.length === 0) {
      return null;
    }

    // Inbound 아이템들을 itemCode별로 합산
    const inboundMap = new Map<string, number>();
    inboundItems.forEach(item => {
      inboundMap.set(item.itemCode, (inboundMap.get(item.itemCode) ?? 0) + item.receivedQuantity);
    });

    // 모든 itemCode 수집 (LPO + Inbound)
    const allCodes = new Set([
      ...lpoItems.map(item => item.itemCode),
      ...inboundMap.keys()
    ]);

    // 각 아이템에 대해 매칭 결과 생성
    const items: MatchingItem[] = Array.from(allCodes).map(code => {
      const lpoItem = lpoItems.find(item => item.itemCode === code);
      const inboundQty = inboundMap.get(code) ?? 0;
      const lpoQty = lpoItem?.lpoQuantity ?? 0;
      const name = lpoItem?.itemName ?? '(unknown)';
      const diff = inboundQty - lpoQty;
      
      let status: 'MATCH' | 'MISSING' | 'EXCESS';
      if (diff === 0) {
        status = 'MATCH';
      } else if (diff < 0) {
        status = 'MISSING';
      } else {
        status = 'EXCESS';
      }

      return {
        itemCode: code,
        itemName: name,
        lpoQuantity: lpoQty,
        inboundQuantity: inboundQty,
        difference: diff,
        status
      };
    });

    return {
      lpoNo,
      items
    };
  }
}
```
**역할**: LPO 매칭 비즈니스 로직

#### `repositories/Repo.ts`
```typescript
export interface LpoItem {
  itemCode: string;
  itemName: string;
  lpoQuantity: number;
}

export interface InboundItem {
  itemCode: string;
  receivedQuantity: number;
}

export class Repo {
  static async getLpoItems(lpoNo: string): Promise<LpoItem[]> {
    // TODO: 실제 데이터베이스 연동 구현
    // 현재는 테스트를 위한 mock 데이터 반환
    return [];
  }

  static async getInboundItems(lpoNo: string): Promise<InboundItem[]> {
    // TODO: 실제 데이터베이스 연동 구현
    // 현재는 테스트를 위한 mock 데이터 반환
    return [];
  }
}
```
**역할**: 데이터베이스 접근 로직 (현재는 Mock)

#### `hooks/useLPOMatching.ts`
```typescript
import { useState, useCallback } from 'react';
import { MatchingService, MatchingResult } from '../services/MatchingService';

export interface UseLPOMatchingReturn {
  result: MatchingResult | null;
  loading: boolean;
  error: string | null;
  queryLPO: (lpoNumber: string) => Promise<void>;
  reset: () => void;
}

export const useLPOMatching = (): UseLPOMatchingReturn => {
  const [result, setResult] = useState<MatchingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryLPO = useCallback(async (lpoNumber: string) => {
    if (!lpoNumber.trim()) {
      setError('LPO 번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await MatchingService.matchLpo(lpoNumber);
      
      if (data) {
        setResult(data);
      } else {
        setError('해당 LPO를 찾을 수 없습니다.');
        setResult(null);
      }
    } catch (err) {
      console.error('Error fetching LPO data:', err);
      setError('데이터 조회 중 오류가 발생했습니다.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    result,
    loading,
    error,
    queryLPO,
    reset
  };
};
```
**역할**: LPO 매칭 상태 관리 커스텀 훅

---

### 🧪 테스트 파일들

#### `__tests__/MatchingService.test.ts`
```typescript
import { MatchingService } from '../services/MatchingService';
import { Repo } from '../repositories/Repo';

// Mock the Repo module
jest.mock('../repositories/Repo');

describe('MatchingService', () => {
  const mockRepo = Repo as jest.Mocked<typeof Repo>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('matchLpo', () => {
    it('shouldReturnMatchingStatusForLpoItems', async () => {
      // Arrange - Setup mock data
      mockRepo.getLpoItems = jest.fn().mockResolvedValue([
        { itemCode: 'A', itemName: 'Widget A', lpoQuantity: 10 },
        { itemCode: 'B', itemName: 'Widget B', lpoQuantity: 5 },
      ]);
      
      mockRepo.getInboundItems = jest.fn().mockResolvedValue([
        { itemCode: 'A', receivedQuantity: 10 },
        { itemCode: 'B', receivedQuantity: 7 },
      ]);

      // Act - Call the service
      const result = await MatchingService.matchLpo('LPO_TEST');

      // Assert - Verify the results
      expect(result).not.toBeNull();
      expect(result?.lpoNo).toBe('LPO_TEST');
      expect(result?.items).toHaveLength(2);

      // Check item A (MATCH)
      const itemA = result?.items.find(i => i.itemCode === 'A');
      expect(itemA).toMatchObject({
        itemCode: 'A',
        itemName: 'Widget A',
        lpoQuantity: 10,
        inboundQuantity: 10,
        difference: 0,
        status: 'MATCH',
      });

      // Check item B (EXCESS)
      const itemB = result?.items.find(i => i.itemCode === 'B');
      expect(itemB).toMatchObject({
        itemCode: 'B',
        itemName: 'Widget B',
        lpoQuantity: 5,
        inboundQuantity: 7,
        difference: 2,
        status: 'EXCESS',
      });

      // Verify repository calls
      expect(mockRepo.getLpoItems).toHaveBeenCalledWith('LPO_TEST');
      expect(mockRepo.getInboundItems).toHaveBeenCalledWith('LPO_TEST');
    });

    it('shouldReturn404IfLpoNotFound', async () => {
      // Arrange - Setup empty mock data
      mockRepo.getLpoItems = jest.fn().mockResolvedValue([]);
      mockRepo.getInboundItems = jest.fn().mockResolvedValue([]);

      // Act - Call the service
      const result = await MatchingService.matchLpo('NON_EXISTENT_LPO');

      // Assert - Should return null for non-existent LPO
      expect(result).toBeNull();
    });

    it('shouldHandleInboundOnlyItemsAsExcess', async () => {
      // Arrange - Setup mock data with inbound-only item
      mockRepo.getLpoItems = jest.fn().mockResolvedValue([
        { itemCode: 'A', itemName: 'Widget A', lpoQuantity: 10 },
      ]);
      
      mockRepo.getInboundItems = jest.fn().mockResolvedValue([
        { itemCode: 'A', receivedQuantity: 10 },
        { itemCode: 'B', receivedQuantity: 5 }, // Inbound only
      ]);

      // Act - Call the service
      const result = await MatchingService.matchLpo('LPO_TEST');

      // Assert - Verify inbound-only item is marked as EXCESS
      expect(result?.items).toHaveLength(2);
      
      const inboundOnlyItem = result?.items.find(i => i.itemCode === 'B');
      expect(inboundOnlyItem).toMatchObject({
        itemCode: 'B',
        itemName: '(unknown)',
        lpoQuantity: 0,
        inboundQuantity: 5,
        difference: 5,
        status: 'EXCESS',
      });
    });
  });
});
```
**역할**: MatchingService 비즈니스 로직 단위 테스트

#### `__tests__/LPOScannerForm.test.tsx`
```typescript
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
```
**역할**: LPOScannerForm 컴포넌트 UI 테스트

---

### 🎨 스타일 파일들

#### `styles/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 글로벌 스타일 정의 */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 커스텀 애니메이션 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```
**역할**: 글로벌 CSS 스타일, Tailwind CSS 임포트

---

## 📊 파일별 역할 요약

| 파일 타입 | 역할 | 주요 특징 |
|-----------|------|-----------|
| **설정 파일** | 프로젝트 환경 구성 | TypeScript, Next.js, Jest 설정 |
| **페이지 파일** | Next.js 라우팅 | API 엔드포인트, 메인 페이지 |
| **컴포넌트** | UI 렌더링 | Atomic Design 구조, 재사용성 |
| **서비스** | 비즈니스 로직 | 도메인 로직, 데이터 처리 |
| **리포지토리** | 데이터 접근 | 데이터베이스 연동 (현재 Mock) |
| **훅** | 상태 관리 | React 상태 로직 분리 |
| **테스트** | 품질 보증 | TDD 방식, 단위/통합 테스트 |
| **스타일** | UI 스타일링 | Tailwind CSS, 글로벌 스타일 |

---

## 🔄 파일 간 의존성 관계

```
pages/index.tsx
    ↓
components/ChatBox.tsx
    ↓
components/LPOInboundMatch.tsx
    ↓
├── components/molecules/LPOScannerForm.tsx
│   ├── components/atoms/Input.tsx
│   └── components/atoms/Button.tsx
├── components/organisms/LPOMatchingResult.tsx
│   └── components/atoms/Button.tsx
└── hooks/useLPOMatching.ts
    ↓
services/MatchingService.ts
    ↓
repositories/Repo.ts
```

---

## 📈 프로젝트 확장성

이 구조는 다음과 같은 확장을 지원합니다:

1. **새로운 기능 추가**: 새로운 컴포넌트를 atoms → molecules → organisms 순으로 구성
2. **새로운 서비스**: services 폴더에 새로운 비즈니스 로직 추가
3. **새로운 데이터 소스**: repositories 폴더에 새로운 데이터 접근 로직 추가
4. **새로운 API**: pages/api 폴더에 새로운 엔드포인트 추가
5. **새로운 테스트**: __tests__ 폴더에 새로운 테스트 케이스 추가

---

**문서 작성일**: 2024년 12월  
**프로젝트 버전**: 1.0.0  
**구조 패턴**: Atomic Design + Clean Architecture 