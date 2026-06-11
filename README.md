# CaseBoard

CaseBoard는 범죄 수사 보드 스타일의 UI를 활용한 그래프 기반 프로젝트 관리 웹 서비스입니다. 사용자는 프로젝트 보드를 만들고, 작업(Task), 버그(Bug), 사람(Person), 일정(Event)을 단서 카드처럼 배치한 뒤 관계선을 연결해 프로젝트 요소 사이의 흐름과 의존 관계를 시각적으로 관리할 수 있습니다.

## 주요 기능

- 회원가입 / 로그인 / 로그아웃
- 로그인 사용자만 접근 가능한 보호된 보드, 마이페이지
- 사용자별 프로젝트 보드 생성, 목록 조회, 검색, 삭제
- 노드 생성, 수정, 삭제
- Task, Bug, Person, Event 타입별 색상 구분
- React Flow 기반 드래그 앤 드롭 위치 이동 및 저장
- 노드 간 관계선 생성, 선택 삭제, 시각화
- 자동 분석: 전체 단서 수, 관계선 수, 미연결 단서, 핵심 단서, 의심 관계 제안
- 빈 보드 안내 UI
- 노드 상세 편집 패널
- 마이페이지 총 보드 수, 총 노드 수, 총 관계 수, 최근 보드 조회
- 한국어 / 영어 다국어 지원
- loading, error, not-found UI
- favicon, Open Graph, sitemap.xml, robots.txt 제공

## 페이지 구성

- `/ko`, `/en`: 메인 페이지
- `/ko/login`, `/en/login`: 로그인
- `/ko/signup`, `/en/signup`: 회원가입
- `/ko/boards`, `/en/boards`: 보드 목록, 검색, 생성, 삭제
- `/ko/boards/[id]`, `/en/boards/[id]`: 그래프 보드 상세 편집
- `/ko/mypage`, `/en/mypage`: 사용자 통계 및 최근 보드

## 기술 스택

- Next.js 16 App Router
- TypeScript
- Prisma
- PostgreSQL
- Auth.js / NextAuth Credentials
- Tailwind CSS
- React Flow
- next-intl
- Docker Compose

## 로컬 실행

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npx prisma generate
npx prisma migrate dev
npm run dev
```

브라우저에서 `http://localhost:3000/ko`로 접속합니다.

## 환경 변수

```bash
DATABASE_URL="postgresql://caseboard:caseboard@localhost:5435/caseboard?schema=public"
AUTH_SECRET="replace-with-a-long-random-development-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

이 프로젝트의 PostgreSQL은 기본적으로 호스트 `5435` 포트를 사용합니다. 다른 PostgreSQL이 `5432`를 사용 중이어도 충돌하지 않도록 `docker-compose.yml`에서 `5435:5432`로 매핑합니다.

## 데이터베이스

주요 모델은 다음과 같습니다.

- `User`: 사용자 계정
- `Board`: 사용자별 프로젝트 보드
- `CaseNode`: 보드 위 노드
- `CaseEdge`: 노드 간 관계선

보드, 노드, 관계선은 Prisma를 통해 실제 PostgreSQL DB에 저장됩니다. 노드 위치 저장은 Route Handler를 통해 처리하고, 보드/노드/관계선 생성 및 수정/삭제는 Server Action을 사용합니다.

## 검증 명령

```bash
npm run lint
npx tsc --noEmit --pretty false
npm run build
```

참고: `npm run build`는 Next.js 16 Turbopack 빌드를 사용합니다. 일부 제한된 샌드박스 환경에서는 Turbopack 내부 프로세스 권한 때문에 실패할 수 있으므로, 로컬 터미널 또는 배포 환경에서 확인하는 것을 권장합니다.

## 제출 체크 포인트

- Next.js 16.x + App Router + TypeScript
- 한국어 / 영어 다국어 지원
- Prisma + PostgreSQL 실제 DB 연동
- 사용자 동작 기반 Create / Update / Delete
- 로그인 인증 및 보호된 페이지
- Server Action 및 Route Handler 사용
- 로그인 / 회원가입 제외 서비스 화면 3개 이상
- 로딩 / 에러 / 404 UI
- `next/image` 이미지 최적화
- 메타데이터, favicon, Open Graph, sitemap.xml, robots.txt
