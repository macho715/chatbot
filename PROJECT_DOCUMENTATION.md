# LPO 인바운드 매칭 봇 프로젝트 문서

## 📋 프로젝트 개요

**프로젝트명**: LPO 인바운드 매칭 봇  
**기술 스택**: Next.js 14, React 18, TypeScript, Tailwind CSS, Jest  
**개발 방식**: Test-Driven Development (TDD) - Red → Green → Refactor  
**아키텍처**: Atomic Design + Clean Architecture  

---

## 🎯 주요 기능

### 1. LPO 인바운드 매칭 시스템
- **LPO 번호 입력**: 수동 입력 방식
- **실시간 매칭**: 발주 수량 vs 수령 수량 비교
- **상태 분류**: MATCH, MISSING, EXCESS
- **시각적 피드백**: 색상별 상태 표시

### 2. 매칭 결과 표시
- **요약 정보**: LPO 번호, 각 상태별 개수
- **상세 목록**: 품목별 상세 정보 (품번, 품명, 수량, 차이)
- **상태별 색상 구분**:
  - ✅ MATCH: 녹색 배경
  - ❌ MISSING: 빨간색 배경  
  - ⚠️ EXCESS: 노란색 배경

---

## 🏗️ 아키텍처 설계

### 1. Atomic Design 구조
```
components/
├── atoms/           # 기본 UI 컴포넌트
│   ├── Button.tsx   # 재사용 가능한 버튼
│   └── Input.tsx    # 재사용 가능한 입력 필드
├── molecules/       # 분자 단위 컴포넌트
│   └── LPOScannerForm.tsx  # LPO 입력 폼
├── organisms/       # 유기체 단위 컴포넌트
│   └── LPOMatchingResult.tsx  # 매칭 결과 표시
└── LPOInboundMatch.tsx  # 메인 기능 컴포넌트
```

### 2. Clean Architecture
```
├── services/        # 비즈니스 로직
│   └── MatchingService.ts
├── repositories/    # 데이터 접근 계층
│   └── Repo.ts
├── hooks/           # 커스텀 훅
│   └── useLPOMatching.ts
└── pages/api/       # API 엔드포인트
    └── lpo-match.ts
```

---

## 🧪 TDD 개발 과정

### 1. Red 단계 - 실패하는 테스트 작성
```typescript
// __tests__/MatchingService.test.ts
describe('MatchingService', () => {
  it('shouldReturnMatchingStatusForLpoItems', async () => {
    // Arrange - Mock 데이터 설정
    mockRepo.getLpoItems = jest.fn().mockResolvedValue([
      { itemCode: 'A', itemName: 'Widget A', lpoQuantity: 10 },
      { itemCode: 'B', itemName: 'Widget B', lpoQuantity: 5 },
    ]);
    
    // Act - 서비스 호출
    const result = await MatchingService.matchLpo('LPO_TEST');
    
    // Assert - 결과 검증
    expect(result?.items).toHaveLength(2);
    expect(itemA.status).toBe('MATCH');
    expect(itemB.status).toBe('EXCESS');
  });
});
```

### 2. Green 단계 - 최소 구현
```typescript
// services/MatchingService.ts
export class MatchingService {
  static async matchLpo(lpoNo: string): Promise<MatchingResult | null> {
    const lpoItems = await Repo.getLpoItems(lpoNo);
    const inboundItems = await Repo.getInboundItems(lpoNo);
    
    if (!lpoItems || lpoItems.length === 0) {
      return null;
    }
    
    // 매칭 로직 구현
    const items = Array.from(allCodes).map(code => {
      const diff = inboundQty - lpoQty;
      const status = diff === 0 ? 'MATCH' : diff < 0 ? 'MISSING' : 'EXCESS';
      return { itemCode: code, status, /* ... */ };
    });
    
    return { lpoNo, items };
  }
}
```

### 3. Refactor 단계 - 코드 구조 개선
- **컴포넌트 분리**: Atomic Design 적용
- **로직 분리**: 커스텀 훅으로 상태 관리
- **타입 안전성**: TypeScript 인터페이스 정의
- **성능 최적화**: React.memo, useCallback 적용

---

## 🔧 기술적 해결 과정

### 1. Next.js 설정 문제 해결
**문제**: `jsxDEV` 함수 오류  
**원인**: JSX 변환 설정 충돌  
**해결책**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "jsx": "preserve"  // Next.js 자동 JSX 변환 사용
  }
}
```

### 2. Jest 테스트 환경 설정
**문제**: TypeScript + React 테스트 환경 구성  
**해결책**:
```javascript
// jest.config.js
const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};

module.exports = createJestConfig(customJestConfig);
```

### 3. 포트 충돌 해결
**문제**: 포트 3000 사용 중  
**해결책**: 
```powershell
# 프로세스 종료
taskkill /F /IM node.exe
# 캐시 삭제
Remove-Item -Recurse -Force .next
# 환경변수 설정 후 재시작
$env:NODE_ENV = "development"; npm run dev
```

---

## 📊 데이터 모델

### 1. 인터페이스 정의
```typescript
// 발주 아이템
interface LpoItem {
  itemCode: string;
  itemName: string;
  lpoQuantity: number;
}

// 수령 아이템
interface InboundItem {
  itemCode: string;
  receivedQuantity: number;
}

// 매칭 결과 아이템
interface MatchingItem {
  itemCode: string;
  itemName: string;
  lpoQuantity: number;
  inboundQuantity: number;
  difference: number;
  status: 'MATCH' | 'MISSING' | 'EXCESS';
}

// 매칭 결과
interface MatchingResult {
  lpoNo: string;
  items: MatchingItem[];
}
```

### 2. 상태 관리
```typescript
// useLPOMatching 훅
interface UseLPOMatchingReturn {
  result: MatchingResult | null;
  loading: boolean;
  error: string | null;
  queryLPO: (lpoNumber: string) => Promise<void>;
  reset: () => void;
}
```

---

## 🎨 UI/UX 설계

### 1. 컴포넌트 설계 원칙
- **재사용성**: atoms → molecules → organisms 계층 구조
- **접근성**: 적절한 ARIA 라벨, 키보드 네비게이션
- **반응형**: Tailwind CSS를 활용한 모바일 친화적 디자인
- **성능**: React.memo, useCallback을 통한 최적화

### 2. 사용자 플로우
1. **메인 페이지** → LPO 인바운드 매치 버튼 클릭
2. **입력 단계** → LPO 번호 입력 및 확인
3. **로딩 단계** → 데이터 조회 중 로딩 표시
4. **결과 표시** → 매칭 결과 카드 형태로 표시
5. **재검색** → 다시 확인 버튼으로 초기화

---

## 🧪 테스트 커버리지

### 1. 단위 테스트
- **MatchingService**: 비즈니스 로직 테스트
- **LPOScannerForm**: UI 컴포넌트 테스트
- **useLPOMatching**: 커스텀 훅 테스트

### 2. 통합 테스트
- **LPOInboundMatch**: 전체 기능 통합 테스트
- **API 엔드포인트**: `/api/lpo-match` 테스트

### 3. 테스트 시나리오
```typescript
// 주요 테스트 케이스
- shouldReturnMatchingStatusForLpoItems
- shouldReturn404IfLpoNotFound  
- shouldHandleInboundOnlyItemsAsExcess
- shouldHandlePartialReceiptAcrossMultipleLines
```

---

## 🚀 배포 및 실행

### 1. 개발 환경 실행
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 테스트 실행
npm test
```

### 2. 프로덕션 빌드
```bash
# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### 3. 접속 URL
- **개발 환경**: http://localhost:3000
- **네트워크 접속**: http://192.168.34.101:3000

---

## 📈 성능 최적화

### 1. 코드 분할
- **Dynamic Import**: 필요시에만 컴포넌트 로드
- **Lazy Loading**: 이미지 및 무거운 리소스 지연 로드

### 2. 메모이제이션
```typescript
// React.memo를 통한 컴포넌트 최적화
const Button: React.FC<ButtonProps> = React.memo(({ ... }) => {
  // 컴포넌트 로직
});

// useCallback을 통한 함수 메모이제이션
const queryLPO = useCallback(async (lpoNumber: string) => {
  // API 호출 로직
}, []);
```

### 3. 번들 최적화
- **Tree Shaking**: 사용하지 않는 코드 제거
- **Code Splitting**: 페이지별 번들 분리

---

## 🔒 보안 및 에러 처리

### 1. 입력 검증
```typescript
// LPO 번호 유효성 검사
if (!lpoNumber.trim()) {
  setError('LPO 번호를 입력해주세요.');
  return;
}
```

### 2. 에러 바운더리
- **API 에러**: 네트워크 오류 처리
- **데이터 검증**: 잘못된 데이터 형식 처리
- **사용자 피드백**: 명확한 에러 메시지 표시

### 3. 로깅 및 모니터링
```typescript
// 에러 로깅
console.error('Error fetching LPO data:', err);
```

---

## 🔄 향후 개선 계획

### 1. 기능 확장
- **QR/바코드 스캔**: 모바일 카메라 활용
- **실시간 알림**: WebSocket을 통한 실시간 업데이트
- **데이터 내보내기**: Excel/PDF 리포트 생성

### 2. 성능 개선
- **캐싱 전략**: Redis를 통한 데이터 캐싱
- **데이터베이스 최적화**: 인덱싱 및 쿼리 최적화
- **CDN 활용**: 정적 자원 전송 최적화

### 3. 사용자 경험
- **다크 모드**: 테마 전환 기능
- **다국어 지원**: i18n을 통한 국제화
- **접근성 개선**: 스크린 리더 지원 강화

---

## 📝 개발 가이드라인

### 1. 코드 스타일
- **TypeScript**: 엄격한 타입 체크
- **ESLint**: 코드 품질 관리
- **Prettier**: 일관된 코드 포맷팅

### 2. 커밋 규칙
```bash
# 구조적 변경
git commit -m "[STRUCT] Extract HS code validation into separate module"

# 기능 추가
git commit -m "[FEAT] Add FANR compliance auto-verification"

# 버그 수정
git commit -m "[FIX] Correct pressure calculation in Heat-Stow analysis"
```

### 3. 브랜치 전략
- **main**: 프로덕션 브랜치
- **develop**: 개발 브랜치
- **feature/**: 기능 개발 브랜치
- **hotfix/**: 긴급 수정 브랜치

---

## 🎯 결론

이 프로젝트는 TDD 방법론을 통해 체계적으로 개발된 LPO 인바운드 매칭 시스템입니다. 

**주요 성과**:
- ✅ TDD 사이클 완료 (Red → Green → Refactor)
- ✅ Atomic Design 아키텍처 적용
- ✅ TypeScript를 통한 타입 안전성 확보
- ✅ Jest를 통한 테스트 커버리지 확보
- ✅ Next.js 14 + React 18 최신 기술 스택 활용
- ✅ 반응형 UI/UX 구현

**기술적 가치**:
- 확장 가능한 컴포넌트 아키텍처
- 유지보수 가능한 코드 구조
- 테스트 가능한 비즈니스 로직
- 성능 최적화된 React 컴포넌트

이 문서는 프로젝트의 전체적인 개발 과정과 기술적 결정사항을 기록하여 향후 유지보수 및 확장 작업에 참고할 수 있도록 작성되었습니다.

---

**문서 작성일**: 2024년 12월  
**프로젝트 버전**: 1.0.0  
**개발 방식**: Test-Driven Development (TDD)  
**아키텍처**: Atomic Design + Clean Architecture 