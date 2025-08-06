# 🐳 Docker Desktop 설정 가이드

## ⚠️ 현재 상황
Docker Desktop이 실행되지 않아 Docker 빌드가 실패했습니다.

## 🔧 해결 방법

### 1. Docker Desktop 수동 시작
```bash
# Windows 시작 메뉴에서 "Docker Desktop" 검색 후 실행
# 또는 다음 경로에서 직접 실행:
"C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### 2. Docker Desktop 상태 확인
```bash
# Docker Desktop이 실행된 후
docker --version
docker ps
```

### 3. 대안: Docker 없이 빌드 테스트
```bash
# 로컬 빌드 테스트
npm run build

# 프로덕션 서버 시작
npm start
```

## 🚀 Docker 빌드 명령어 (Docker Desktop 실행 후)

### 기본 빌드
```bash
# 프로덕션 빌드
docker build -t mosb-gate-agent .

# 개발 환경 빌드
docker build --target builder -t mosb-gate-agent-dev .
```

### Docker Compose 실행
```bash
# 프로덕션 서비스
docker-compose up mosb-gate-agent-prod

# 개발 서비스
docker-compose up mosb-gate-agent-dev

# 백그라운드 실행
docker-compose up -d mosb-gate-agent-prod
```

### 빌드 확인
```bash
# 이미지 목록 확인
docker images

# 컨테이너 실행
docker run -p 3000:3000 mosb-gate-agent
```

## 🔍 문제 해결

### Docker Desktop이 설치되지 않은 경우
1. [Docker Desktop 다운로드](https://www.docker.com/products/docker-desktop/)
2. 설치 후 재부팅
3. Docker Desktop 실행

### 권한 문제
```bash
# 관리자 권한으로 PowerShell 실행
# 또는 Docker Desktop 설정에서 권한 확인
```

### 포트 충돌
```bash
# 다른 포트 사용
docker run -p 8080:3000 mosb-gate-agent
```

## 📊 빌드 성능 최적화

### 캐시 사용
```bash
# 캐시 활용 빌드
docker build --cache-from mosb-gate-agent -t mosb-gate-agent .
```

### 멀티 플랫폼 빌드
```bash
# Linux/Windows 호환 빌드
docker buildx build --platform linux/amd64,linux/arm64 -t mosb-gate-agent .
```

## 🎯 다음 단계

1. **Docker Desktop 실행**
2. **빌드 테스트**: `docker build -t mosb-gate-agent .`
3. **실행 테스트**: `docker run -p 3000:3000 mosb-gate-agent`
4. **Vercel 배포**: GitHub 저장소 연결

---

**MOSB Gate Agent v2.0** - Docker 설정 가이드 