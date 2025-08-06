# 🚀 MOSB Gate Agent v2.0 - 빠른 시작 가이드

## 📋 프로젝트 개요

**MOSB Gate Agent v2.0**은 물류 현장의 출입 관리를 위한 챗봇 애플리케이션입니다.

## ⚡ 빠른 시작

### 1. **프로젝트 클론**
```bash
git clone https://github.com/macho715/chatbot.git
cd chatbot
```

### 2. **의존성 설치**
```bash
npm install
```

### 3. **개발 서버 실행**
```bash
npm run dev
```

### 4. **프로덕션 빌드 및 실행**
```bash
npm run build
npm start
```

## 🌐 접속 방법

**로컬 접속**: `http://localhost:3000`

## 🔧 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (포트 3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 실행 |
| `npm test` | 테스트 실행 |
| `npm run test:watch` | 테스트 감시 모드 |
| `npm run test:coverage` | 테스트 커버리지 확인 |

## 🐳 Docker 사용 (선택사항)

### Docker 빌드
```bash
docker build -t mosb-gate-agent .
```

### Docker 실행
```bash
docker run -p 3000:3000 mosb-gate-agent
```

### Docker Compose 사용
```bash
docker-compose up mosb-gate-agent-prod
```

## 🧪 테스트 실행

### 전체 테스트
```bash
npm test
```

### 특정 테스트 파일
```bash
npm test -- --testPathPattern=ChatBox
```

### 커버리지 확인
```bash
npm run test:coverage
```

## 📱 주요 기능

### 🔄 Gate Pass 조회
- 출입 허가증 조회 및 관리

### 🚚 차량 ETA 등록
- 차량 도착 예정 시간 등록

### 📤 문서 제출 (PPE / MSDS)
- 안전 장비 및 자료 제출

### 🧾 출입이력 보기
- 과거 출입 기록 조회

### 📢 공지사항 확인
- 현장 공지사항 확인

### 🟢 LPO 인바운드 매치
- 물류 처리 주문 매칭

### 📱 QR 코드 생성
- QR 코드 생성 및 스캔

### 📋 스캔 히스토리
- 스캔 기록 관리

### 🚀 배치 스캔
- 대량 스캔 처리

## 🔍 문제 해결

### 포트 충돌 시
```bash
# 다른 포트 사용
npm run dev -- -p 3001
```

### 빌드 오류 시
```bash
# 캐시 클리어
npm run build -- --no-cache
```

### 의존성 문제 시
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

## 📊 성능 최적화

### 빌드 최적화
- SWC 컴파일러 사용
- 번들 크기 최적화 (76.3 kB)
- 이미지 최적화

### 테스트 최적화
- Jest 병렬 실행
- 테스트 커버리지 70% 달성
- CI/CD 자동화

## 🚀 배포 옵션

### 1. **Vercel 배포 (권장)**
- GitHub 저장소 연결
- 자동 배포 설정
- SSL 인증서 자동 적용

### 2. **Netlify 배포**
- 정적 사이트 빌드
- CDN 자동 설정

### 3. **Docker 배포**
- 컨테이너화된 배포
- 클라우드 VM 지원

## 📞 지원

**GitHub 저장소**: [https://github.com/macho715/chatbot](https://github.com/macho715/chatbot)  
**문서**: `PROJECT_COMPLETION_REPORT.md`  
**테스트 결과**: `TEST_EXECUTION_SUMMARY.md`

---

**MOSB Gate Agent v2.0** - 빠르고 안정적인 물류 관리 솔루션! 🚀 