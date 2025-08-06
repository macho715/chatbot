# 🐳 MOSB Gate Agent - Docker 배포 가이드

## 📋 개요

이 가이드는 MOSB Gate Agent 프로젝트를 Docker 컨테이너로 배포하는 방법을 설명합니다.

## 🚀 빠른 시작

### 1. Docker 빌드

```bash
# 프로덕션 빌드
docker build -t mosb-gate-agent .

# 개발 환경 빌드
docker build --target builder -t mosb-gate-agent-dev .
```

### 2. Docker 실행

```bash
# 프로덕션 실행
docker run -p 3000:3000 mosb-gate-agent

# 개발 환경 실행
docker run -p 3000:3000 mosb-gate-agent-dev
```

### 3. Docker Compose 사용

```bash
# 프로덕션 서비스 실행
docker-compose up mosb-gate-agent-prod

# 개발 서비스 실행
docker-compose up mosb-gate-agent-dev

# 백그라운드 실행
docker-compose up -d mosb-gate-agent-prod
```

## 🔧 환경별 배포

### 로컬 개발 환경

```bash
# 개발 모드로 실행
docker-compose up mosb-gate-agent-dev

# 접속: http://localhost:3000
```

### 프로덕션 환경

```bash
# 프로덕션 빌드 및 실행
docker-compose up mosb-gate-agent-prod

# 접속: http://localhost:3000
```

### 커스텀 포트 사용

```bash
# 8080 포트로 실행
docker-compose up mosb-gate-agent-prod-alt

# 접속: http://localhost:8080
```

## 🏗️ 빌드 최적화

### 멀티 스테이지 빌드

Dockerfile은 두 단계로 구성됩니다:

1. **Builder Stage**: 의존성 설치 및 애플리케이션 빌드
2. **Runner Stage**: 프로덕션 실행을 위한 최소 환경

### 보안 설정

- 비루트 사용자 (`nextjs`) 사용
- 프로덕션 의존성만 설치
- 불필요한 파일 제외 (`.dockerignore`)

## 📊 모니터링

### 로그 확인

```bash
# 컨테이너 로그 확인
docker logs <container_id>

# 실시간 로그 확인
docker logs -f <container_id>
```

### 상태 확인

```bash
# 실행 중인 컨테이너 확인
docker ps

# 모든 컨테이너 확인
docker ps -a
```

## 🔄 업데이트

### 새 버전 배포

```bash
# 기존 컨테이너 중지
docker-compose down

# 새 이미지 빌드
docker-compose build

# 새 컨테이너 시작
docker-compose up -d
```

## 🐛 문제 해결

### 일반적인 문제들

1. **포트 충돌**
   ```bash
   # 다른 포트 사용
   docker run -p 8080:3000 mosb-gate-agent
   ```

2. **메모리 부족**
   ```bash
   # 메모리 제한 설정
   docker run -m 512m -p 3000:3000 mosb-gate-agent
   ```

3. **빌드 실패**
   ```bash
   # 캐시 없이 빌드
   docker build --no-cache -t mosb-gate-agent .
   ```

### 로그 확인

```bash
# 상세 로그 확인
docker logs <container_id> 2>&1

# 마지막 100줄 로그
docker logs --tail 100 <container_id>
```

## 📈 성능 최적화

### 이미지 크기 최적화

- 멀티 스테이지 빌드 사용
- 불필요한 파일 제외
- 프로덕션 의존성만 설치

### 실행 최적화

- Node.js 18 Alpine 사용
- 메모리 제한 설정
- CPU 제한 설정

## 🔒 보안 고려사항

1. **비루트 사용자**: `nextjs` 사용자로 실행
2. **최소 권한**: 필요한 파일만 복사
3. **보안 스캔**: 정기적인 보안 검사

## 📚 추가 리소스

- [Docker 공식 문서](https://docs.docker.com/)
- [Next.js Docker 가이드](https://nextjs.org/docs/deployment#docker-image)
- [Vercel 배포 가이드](https://vercel.com/docs/deployments)

---

**MOSB Gate Agent v2.0** - 물류 시스템 Docker 배포 가이드 