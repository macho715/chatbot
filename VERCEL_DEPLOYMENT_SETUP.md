# 🚀 Vercel 자동 배포 설정 가이드

## 📋 설정 단계

### 1. Vercel 토큰 생성
1. [Vercel Dashboard](https://vercel.com/account/tokens) 접속
2. "Create Token" 클릭
3. 토큰 이름: `mosb-gate-agent-deploy`
4. 토큰 생성 후 복사

### 2. GitHub Secrets 설정
1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. 다음 Secrets 추가:

```
VERCEL_TOKEN = [Vercel에서 생성한 토큰]
VERCEL_ORG_ID = [Vercel 조직 ID]
VERCEL_PROJECT_ID = [Vercel 프로젝트 ID]
```

### 3. Vercel 프로젝트 정보 확인
```bash
# Vercel CLI로 프로젝트 정보 확인
vercel ls
vercel inspect mosb-gate-agent
```

## 🔄 자동 배포 트리거

### GitHub 푸시 시 자동 배포
- `master` 또는 `main` 브랜치에 푸시
- GitHub Actions 워크플로우 자동 실행
- Vercel 프로덕션 환경에 자동 배포

### 배포 URL
- **프로덕션**: https://mosb-gate-agent.vercel.app
- **프리뷰**: 각 PR마다 고유 URL 생성

## 📊 배포 상태 확인

### GitHub Actions
- Actions 탭에서 배포 진행 상황 확인
- 실패 시 로그 확인 가능

### Vercel Dashboard
- [Vercel Dashboard](https://vercel.com/dashboard)에서 배포 상태 확인
- 실시간 로그 및 성능 모니터링

## 🛠️ 문제 해결

### 배포 실패 시
1. GitHub Actions 로그 확인
2. Vercel 토큰 유효성 검증
3. 프로젝트 ID 및 조직 ID 확인
4. 로컬 빌드 테스트: `npm run build`

### 환경 변수 설정
```bash
# .env.local 파일에 필요한 환경 변수 추가
NEXT_PUBLIC_API_URL=https://mosb-gate-agent.vercel.app/api
```

## ✅ 완료 체크리스트

- [ ] Vercel 토큰 생성
- [ ] GitHub Secrets 설정
- [ ] 첫 번째 자동 배포 성공
- [ ] 팀원 접근 권한 확인
- [ ] 프로덕션 환경 테스트

## 📞 지원

문제 발생 시:
1. GitHub Issues 생성
2. Vercel Support 팀 문의
3. 프로젝트 관리자에게 연락 