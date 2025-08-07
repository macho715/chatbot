# 🔐 GitHub Secrets 설정 상세 가이드

## 📋 설정 단계

### 1단계: GitHub 저장소 접속
1. 브라우저에서 [https://github.com/macho715/chatbot](https://github.com/macho715/chatbot) 접속
2. 저장소 메인 페이지 확인

### 2단계: Settings 페이지 이동
1. 저장소 상단 탭에서 **Settings** 클릭
2. 왼쪽 사이드바에서 **Security** 섹션 확인

### 3단계: Secrets and variables 접속
1. **Secrets and variables** 메뉴 클릭
2. **Actions** 탭 선택
3. **New repository secret** 버튼 클릭

### 4단계: Vercel 토큰 생성
1. [Vercel Dashboard](https://vercel.com/account/tokens) 새 탭에서 접속
2. **Create Token** 버튼 클릭
3. 토큰 이름 입력: `mosb-gate-agent-deploy`
4. **Create** 클릭
5. 생성된 토큰 복사 (한 번만 표시됨)

### 5단계: GitHub Secrets 추가

#### Secret 1: VERCEL_TOKEN
```
Name: VERCEL_TOKEN
Value: [Vercel에서 생성한 토큰]
```

#### Secret 2: VERCEL_ORG_ID
```
Name: VERCEL_ORG_ID
Value: team_gBpNdnhc7Wg4R5nECdGVmYfj
```

#### Secret 3: VERCEL_PROJECT_ID
```
Name: VERCEL_PROJECT_ID
Value: prj_mwuNrRA0mj0q7q0zPde9EnyBNOWE
```

## ✅ 설정 완료 확인

### Secrets 목록 확인
- GitHub 저장소 → Settings → Secrets and variables → Actions
- 다음 3개 Secret이 표시되어야 함:
  - ✅ VERCEL_TOKEN
  - ✅ VERCEL_ORG_ID
  - ✅ VERCEL_PROJECT_ID

## 🚀 자동 배포 테스트

### 테스트 커밋 및 푸시
```bash
# 새로운 변경사항 생성
echo "# GitHub Secrets 설정 완료" >> README.md

# Git에 추가 및 커밋
git add README.md
git commit -m "🔐 GitHub Secrets 설정 완료 - 자동 배포 테스트"

# GitHub에 푸시
git push origin master
```

### 배포 확인
1. **GitHub Actions** 탭에서 워크플로우 실행 확인
2. **Vercel Dashboard**에서 배포 상태 확인
3. **배포 URL**: `https://mosb-gate-agent-chatgpt-v2.vercel.app`

## 🛠️ 문제 해결

### Secrets 설정 실패 시
1. **토큰 유효성 확인**: Vercel Dashboard에서 토큰 재생성
2. **권한 확인**: GitHub 저장소 관리자 권한 필요
3. **브라우저 캐시**: 브라우저 새로고침 또는 캐시 삭제

### 배포 실패 시
1. **GitHub Actions 로그** 확인
2. **Secrets 값 정확성** 검증
3. **Vercel 프로젝트 연결** 상태 확인

## 📊 설정 완료 체크리스트

- [ ] Vercel 토큰 생성
- [ ] GitHub 저장소 Settings 접속
- [ ] Secrets and variables → Actions 접속
- [ ] VERCEL_TOKEN Secret 추가
- [ ] VERCEL_ORG_ID Secret 추가
- [ ] VERCEL_PROJECT_ID Secret 추가
- [ ] Secrets 목록 확인
- [ ] 테스트 커밋 및 푸시
- [ ] GitHub Actions 워크플로우 실행 확인
- [ ] Vercel 배포 성공 확인

## 📞 지원

문제 발생 시:
1. GitHub Issues 생성
2. Vercel Support 팀 문의
3. 프로젝트 관리자에게 연락 