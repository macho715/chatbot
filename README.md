# 🚚 MOSB Gate Agent ChatGPT v2.0

**Samsung C&T Logistics | ADNOC·DSV Partnership**

> MOSB (Musaffah Storage & Bonded) Gate Entry System - AI-Powered Logistics Management Platform

## 📋 프로젝트 개요

MOSB Gate Agent는 UAE Abu Dhabi의 MOSB 물류 센터를 위한 AI 기반 출입 관리 시스템입니다. ChatGPT 기술을 활용하여 운전자와 물류 담당자들이 효율적으로 출입 신청, 위치 조회, 상태 확인을 할 수 있도록 지원합니다.

### 🎯 주요 기능

#### 🚚 MOSB Entry System
- **Gate Entry Application**: 출입 신청서 제출 및 관리
- **Document Upload**: 운전면허증, 차량등록증, 보험증명서 등 필수 서류 업로드
- **Real-time Status**: 신청 상태 실시간 확인
- **Approval Workflow**: 승인 프로세스 자동화

#### 📍 LPO Location Finder
- **QR Code Scanner**: LPO QR 코드 스캔으로 위치 조회
- **Manual Search**: LPO 번호로 수동 검색
- **Warehouse Mapping**: 창고 위치 및 연락처 정보 제공
- **Contact Information**: 담당자 연락처 및 운영 시간 안내

#### 🤖 AI Chat Assistant
- **Natural Language Processing**: 자연어 명령어 처리
- **Command Recognition**: `mosb entry`, `lpo find`, `status check` 등 명령어 인식
- **Context Awareness**: 대화 맥락 이해 및 적절한 응답
- **Multi-language Support**: 한국어/영어 지원

## 🛠️ 기술 스택

### Frontend
- **Next.js 12.3.4**: React 기반 프레임워크
- **React 17.0.2**: UI 컴포넌트 라이브러리
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 스타일링
- **QR Code Libraries**: `@yudiel/react-qr-scanner`, `qrcode.react`

### Backend
- **Next.js API Routes**: 서버리스 API
- **TypeScript**: 백엔드 타입 안전성
- **File Upload**: FormData 처리
- **Data Validation**: 클라이언트/서버 검증

### Development Tools
- **Jest**: 테스트 프레임워크
- **React Testing Library**: 컴포넌트 테스트
- **ESLint**: 코드 품질 관리
- **Prettier**: 코드 포맷팅

## 🚀 설치 및 실행

### 필수 요구사항
- Node.js 16.x 이상
- npm 8.x 이상
- Git

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

### 4. 브라우저에서 확인
```
http://localhost:3000
```

## 📱 사용법

### 메인 대시보드
1. **홈페이지 접속**: `http://localhost:3000`
2. **MOSB Entry System**: 우측 상단 버튼 클릭
3. **AI Chat Assistant**: 하단 채팅 인터페이스 사용

### MOSB Entry System 사용법

#### 🚚 Gate Entry Application
1. **신청서 작성**: 운전자 정보 및 차량 정보 입력
2. **서류 업로드**: 필수 서류 파일 선택
3. **제출**: 신청서 제출 및 확인
4. **상태 확인**: Application ID로 상태 조회

#### 📍 LPO Location Finder
1. **QR 스캔**: LPO QR 코드 스캔
2. **수동 검색**: LPO 번호 직접 입력
3. **위치 확인**: 창고 위치 및 연락처 정보 확인

#### 📋 Application Status
1. **Application ID 입력**: 신청서 ID 입력
2. **상태 조회**: 실시간 상태 확인
3. **상태 가이드**: 각 상태별 의미 확인

### AI Chat Assistant 명령어

#### 기본 명령어
```
mosb entry - MOSB 출입 신청 시작
mosb status [id] - 신청 상태 확인
lpo find [number] - LPO 위치 조회
lpo scan - LPO QR 코드 스캔
help - 도움말 표시
```

#### 고급 명령어
```
weather check - 기상 조건 확인
port status - 항구 상태 확인
document upload - 서류 업로드
contact support - 지원팀 연락
```

## 🏗️ 프로젝트 구조

```
mosb-gate-agent-chatgpt-v2/
├── components/
│   ├── organisms/
│   │   ├── ChatBox.tsx          # 메인 채팅 인터페이스
│   │   ├── MOSBEntryBot.tsx     # MOSB Entry Bot
│   │   ├── LPOFinder.tsx        # LPO 위치 조회
│   │   └── ...
│   ├── molecules/
│   │   ├── Button.tsx           # 재사용 버튼 컴포넌트
│   │   ├── Input.tsx            # 입력 필드 컴포넌트
│   │   └── ...
│   └── atoms/
├── pages/
│   ├── index.tsx                # 메인 대시보드
│   ├── mosb-entry.tsx           # MOSB Entry System
│   ├── _app.tsx                 # 앱 래퍼
│   └── api/                     # API 라우트
│       ├── mosb/
│       │   └── applications.ts  # MOSB 신청서 API
│       └── lpo/
│           └── location/        # LPO 위치 API
├── services/
│   └── MOSBEntryService.ts      # MOSB Entry 서비스
├── types/
│   └── mosb.ts                  # TypeScript 타입 정의
├── __tests__/                   # 테스트 파일
├── public/                      # 정적 파일
└── package.json
```

## 🧪 테스트

### 테스트 실행
```bash
# 전체 테스트 실행
npm test

# 테스트 커버리지 확인
npm run test:coverage

# 특정 테스트 파일 실행
npm test -- MOSBEntry.test.tsx
```

### 테스트 구조
- **Unit Tests**: 개별 컴포넌트 테스트
- **Integration Tests**: API 통합 테스트
- **E2E Tests**: 전체 워크플로우 테스트

## 🔧 개발 가이드

### 코드 스타일
- **TypeScript**: 모든 파일에 타입 정의
- **ESLint**: 코드 품질 검사
- **Prettier**: 코드 포맷팅
- **React Hooks**: 함수형 컴포넌트 사용

### 커밋 규칙
```
[FEAT] 새로운 기능 추가
[FIX] 버그 수정
[REFACTOR] 코드 리팩토링
[DOCS] 문서 업데이트
[TEST] 테스트 추가/수정
```

### 브랜치 전략
- `master`: 프로덕션 브랜치
- `develop`: 개발 브랜치
- `feature/*`: 기능 개발 브랜치
- `hotfix/*`: 긴급 수정 브랜치

## 🚀 배포

### Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### Docker 배포
```bash
# Docker 이미지 빌드
docker build -t mosb-gate-agent .

# 컨테이너 실행
docker run -p 3000:3000 mosb-gate-agent
```

## 📊 성능 모니터링

### 핵심 지표
- **페이지 로드 시간**: < 3초
- **API 응답 시간**: < 1초
- **테스트 커버리지**: > 80%
- **에러율**: < 1%

### 모니터링 도구
- **Vercel Analytics**: 성능 모니터링
- **Sentry**: 에러 추적
- **Google Analytics**: 사용자 행동 분석

## 🔒 보안

### 데이터 보안
- **PII 보호**: 개인정보 암호화
- **파일 업로드**: 안전한 파일 검증
- **API 보안**: 인증 및 권한 관리
- **HTTPS**: 모든 통신 암호화

### 규정 준수
- **UAE 데이터 보호법**: 현지 규정 준수
- **GDPR**: 유럽 데이터 보호 규정
- **FANR**: UAE 연방 규정 준수
- **MOIAT**: 산업무역부 규정 준수

## 🤝 기여 가이드

### 기여 방법
1. **Fork**: 저장소 포크
2. **Branch**: 기능 브랜치 생성
3. **Develop**: 기능 개발
4. **Test**: 테스트 작성 및 실행
5. **Pull Request**: PR 생성

### 코드 리뷰
- **TypeScript**: 타입 안전성 확인
- **테스트**: 테스트 커버리지 확인
- **성능**: 성능 영향 분석
- **보안**: 보안 취약점 검사

## 📞 지원

### 연락처
- **📧 Email**: logistics@samsungct.com
- **📱 WhatsApp**: +971-XX-XXX-XXXX
- **🕐 운영시간**: 08:00-17:00 (Sun-Thu)

### 문서
- **API 문서**: `/api/docs`
- **사용자 가이드**: `/docs/user-guide`
- **개발자 가이드**: `/docs/developer-guide`

## 📄 라이선스

© 2024 Samsung C&T Logistics. All rights reserved.

---

**🚀 MOSB Gate Agent v2.0 - AI-Powered Logistics Management Platform** # GitHub Secrets 설정 완료 - 자동 배포 테스트
