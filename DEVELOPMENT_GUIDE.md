# 🔧 MOSB Gate Agent v2.0 - 개발 가이드

**Samsung C&T Logistics | 개발팀 가이드**

> 개발자를 위한 상세한 개발 환경 설정, 코드 스타일, 테스트 방법, 배포 과정 가이드

---

## 🚀 개발 환경 설정

### 필수 요구사항
- **Node.js**: 16.x 이상
- **npm**: 8.x 이상
- **Git**: 2.x 이상
- **VS Code**: 권장 (확장 프로그램 포함)

### 1. 저장소 클론
```bash
git clone https://github.com/macho715/chatbot.git
cd chatbot
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 브라우저 확인
```
http://localhost:3000
```

---

## 🏗️ 프로젝트 구조

### 디렉토리 구조
```
mosb-gate-agent-chatgpt-v2/
├── components/              # React 컴포넌트
│   ├── atoms/              # 기본 UI 컴포넌트
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── molecules/          # 복합 UI 컴포넌트
│   │   ├── QRScanner.tsx
│   │   └── ScanHistory.tsx
│   └── organisms/          # 페이지 레벨 컴포넌트
│       ├── ChatBox.tsx
│       ├── MOSBEntryBot.tsx
│       └── LPOFinder.tsx
├── pages/                  # Next.js 페이지
│   ├── index.tsx           # 메인 대시보드
│   ├── mosb-entry.tsx      # MOSB Entry System
│   ├── _app.tsx            # 앱 래퍼
│   └── api/                # API 라우트
│       ├── mosb/
│       │   └── applications.ts
│       └── lpo/
│           └── location/
├── services/               # 비즈니스 로직
│   └── MOSBEntryService.ts
├── types/                  # TypeScript 타입
│   └── mosb.ts
├── __tests__/              # 테스트 파일
├── public/                 # 정적 파일
└── package.json
```

### 파일 명명 규칙
- **컴포넌트**: PascalCase (예: `MOSBEntryBot.tsx`)
- **훅**: camelCase + use (예: `useMOSBEntry.ts`)
- **서비스**: PascalCase + Service (예: `MOSBEntryService.ts`)
- **타입**: camelCase (예: `mosb.ts`)
- **테스트**: 원본 파일명 + .test (예: `MOSBEntry.test.tsx`)

---

## 💻 코드 스타일 가이드

### TypeScript 규칙
```typescript
// ✅ 좋은 예
interface DriverApplication {
  id: string;
  driverName: string;
  vehicleNumber: string;
  status: 'submitted' | 'approved' | 'rejected';
  submittedAt?: Date;
}

// ❌ 나쁜 예
interface driver_application {
  id: any;
  driver_name: string;
  vehicle_number: string;
  status: string;
  submitted_at?: any;
}
```

### React 컴포넌트 규칙
```typescript
// ✅ 좋은 예
interface MOSBEntryBotProps {
  onApplicationSubmit: (application: DriverApplication) => void;
  onError: (error: string) => void;
}

export const MOSBEntryBot: React.FC<MOSBEntryBotProps> = ({
  onApplicationSubmit,
  onError
}) => {
  // 컴포넌트 로직
};

// ❌ 나쁜 예
export const MOSBEntryBot = (props: any) => {
  // 타입이 없는 컴포넌트
};
```

### 함수 작성 규칙
```typescript
// ✅ 좋은 예
const handleApplicationSubmit = useCallback(async (
  formData: FormData
): Promise<void> => {
  try {
    const response = await fetch('/api/mosb/applications', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Application submission failed');
    }
    
    const application = await response.json();
    onApplicationSubmit(application);
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Unknown error');
  }
}, [onApplicationSubmit, onError]);

// ❌ 나쁜 예
const handleSubmit = async (data: any) => {
  // 타입이 없고 에러 처리가 없는 함수
};
```

### CSS 클래스 규칙
```typescript
// ✅ 좋은 예 - Tailwind CSS
const buttonClasses = `
  px-4 py-2 
  bg-blue-600 text-white 
  rounded-lg font-semibold 
  hover:bg-blue-700 
  focus:ring-2 focus:ring-blue-500
`;

// ❌ 나쁜 예 - 인라인 스타일
const buttonStyle = {
  padding: '8px 16px',
  backgroundColor: '#2563eb',
  color: 'white'
};
```

---

## 🧪 테스트 작성 가이드

### 테스트 파일 구조
```typescript
// __tests__/MOSBEntry.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MOSBEntryBot } from '../components/organisms/MOSBEntryBot';

describe('MOSBEntryBot', () => {
  const mockOnApplicationSubmit = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the application form', () => {
    render(
      <MOSBEntryBot
        onApplicationSubmit={mockOnApplicationSubmit}
        onError={mockOnError}
      />
    );

    expect(screen.getByText('🚚 MOSB Entry Application')).toBeInTheDocument();
    expect(screen.getByLabelText('Driver Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Vehicle Number')).toBeInTheDocument();
  });

  it('should submit application successfully', async () => {
    // 테스트 구현
  });
});
```

### 테스트 실행
```bash
# 전체 테스트 실행
npm test

# 특정 테스트 파일 실행
npm test MOSBEntry.test.tsx

# 테스트 커버리지 확인
npm run test:coverage

# 감시 모드로 테스트 실행
npm test -- --watch
```

### 테스트 작성 팁
1. **설명적인 테스트명**: `should submit application successfully`
2. **AAA 패턴**: Arrange, Act, Assert
3. **Mock 사용**: 외부 의존성 모킹
4. **사용자 관점**: 실제 사용자 행동 시뮬레이션

---

## 🔧 개발 워크플로우

### 1. 기능 개발 프로세스
```bash
# 1. 브랜치 생성
git checkout -b feature/new-feature

# 2. 개발 작업
# - 코드 작성
# - 테스트 작성
# - 문서 업데이트

# 3. 커밋
git add .
git commit -m "[FEAT] Add new feature description"

# 4. 푸시
git push origin feature/new-feature

# 5. Pull Request 생성
# GitHub에서 PR 생성 및 리뷰 요청
```

### 2. 버그 수정 프로세스
```bash
# 1. 버그 브랜치 생성
git checkout -b fix/bug-description

# 2. 버그 수정
# - 문제 분석
# - 수정 코드 작성
# - 테스트 추가

# 3. 커밋
git commit -m "[FIX] Fix bug description"

# 4. PR 생성 및 머지
```

### 3. 리팩토링 프로세스
```bash
# 1. 리팩토링 브랜치 생성
git checkout -b refactor/component-name

# 2. 리팩토링 작업
# - 코드 구조 개선
# - 성능 최적화
# - 가독성 향상

# 3. 테스트 확인
npm test

# 4. 커밋
git commit -m "[REFACTOR] Improve component structure"
```

---

## 🚀 배포 가이드

### 1. 로컬 빌드 테스트
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 브라우저에서 확인
http://localhost:3000
```

### 2. Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

### 3. Docker 배포
```bash
# Docker 이미지 빌드
docker build -t mosb-gate-agent .

# 컨테이너 실행
docker run -p 3000:3000 mosb-gate-agent
```

### 4. 환경 변수 설정
```bash
# .env.local 파일 생성
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=MOSB Gate Agent
```

---

## 🔍 디버깅 가이드

### 1. 개발자 도구 사용
```javascript
// 콘솔 로그
console.log('Debug info:', data);
console.error('Error occurred:', error);

// 브라우저 개발자 도구
// - Network 탭: API 요청 확인
// - Console 탭: 에러 및 로그 확인
// - React DevTools: 컴포넌트 상태 확인
```

### 2. React DevTools
```bash
# Chrome 확장 프로그램 설치
# React Developer Tools

# 컴포넌트 트리 확인
# Props 및 State 디버깅
# 컴포넌트 렌더링 성능 분석
```

### 3. TypeScript 디버깅
```typescript
// 타입 체크
npm run type-check

// 타입 에러 확인
npx tsc --noEmit
```

---

## 📊 성능 최적화

### 1. 번들 크기 최적화
```javascript
// next.config.js
module.exports = {
  experimental: {
    optimizeCss: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.vendor = {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
      };
    }
    return config;
  },
};
```

### 2. 이미지 최적화
```typescript
import Image from 'next/image';

// ✅ 좋은 예
<Image
  src="/logo.png"
  alt="Logo"
  width={100}
  height={100}
  priority
/>

// ❌ 나쁜 예
<img src="/logo.png" alt="Logo" />
```

### 3. 코드 스플리팅
```typescript
// 동적 임포트
const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false
});
```

---

## 🔒 보안 가이드

### 1. 입력 검증
```typescript
// ✅ 좋은 예
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ❌ 나쁜 예
const validateEmail = (email: any): boolean => {
  return email.includes('@');
};
```

### 2. API 보안
```typescript
// API 라우트에서 검증
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 입력 검증
  const { driverName, vehicleNumber } = req.body;
  if (!driverName || !vehicleNumber) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 비즈니스 로직
  try {
    const result = await processApplication(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### 3. 환경 변수 관리
```bash
# .env.local (로컬 개발)
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# .env.production (프로덕션)
NEXT_PUBLIC_API_URL=https://api.mosb-gate-agent.com
```

---

## 📚 유용한 리소스

### 공식 문서
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### 개발 도구
- [VS Code Extensions](https://marketplace.visualstudio.com/)
- [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

### 커뮤니티
- [Next.js Discord](https://discord.gg/nextjs)
- [React Discord](https://discord.gg/reactiflux)
- [TypeScript Discord](https://discord.gg/typescript)

---

## 📞 지원 및 문의

### 기술 지원
- **개발팀**: Samsung C&T Logistics IT팀
- **이메일**: logistics@samsungct.com
- **응답 시간**: 24시간 이내

### 문서 업데이트
- **README.md**: 프로젝트 개요
- **DEVELOPMENT_GUIDE.md**: 개발 가이드 (이 문서)
- **API 문서**: 엔드포인트 문서화

---

**🔧 MOSB Gate Agent v2.0 - 개발 가이드**  
**© 2024 Samsung C&T Logistics. All rights reserved.** 