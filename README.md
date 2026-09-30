# K-BigData Service Portal

한국폴리텍대학 서울강서캠퍼스 빅데이터소프트웨어공학과에서 운영하는 웹서비스를 한 곳에서 찾을 수 있는 정적 포털입니다. 포털은 인증이나 학생 데이터를 직접 다루지 않으며, 각 서비스로 이동하는 통합 진입점 역할을 합니다.

- 운영 URL: <https://portal.k-bigdata.kr/>
- 구현 방식: GitHub Pages, Vanilla HTML/CSS/JavaScript
- 배포 브랜치/경로: `main` 브랜치의 저장소 루트

## 등록 서비스

| 카테고리 | 서비스 | URL |
| --- | --- | --- |
| 취업 · 진로 | 취업 준비 점검 | <https://ready.k-bigdata.kr/> |
| 취업 · 진로 | 입사지원 현황 | <https://apply.k-bigdata.kr/> |
| 취업 · 진로 | 졸업생 네트워크 | <https://alumni.k-bigdata.kr/> |
| 학과 생활 | 프로젝트실 예약 | <https://room.k-bigdata.kr/> |
| 학과 생활 | 학과 요청 · 신고 | <https://help.k-bigdata.kr/> |

## 디렉터리 구조

```text
/
├── index.html          # 페이지 구조와 Hero 일러스트
├── CNAME               # GitHub Pages 사용자 지정 도메인
├── favicon.svg
├── css/
│   └── style.css       # 디자인 시스템과 반응형 스타일
└── js/
    ├── services.js     # 카테고리 및 서비스 데이터
    └── app.js          # 카드 자동 그룹화·정렬·렌더링
```

## 서비스 추가·수정

서비스 카드는 HTML에 직접 작성하지 않습니다. `js/services.js`의 `services` 배열에서 데이터만 관리합니다.

### 새 서비스 추가

1. `js/services.js`의 `services` 배열에 객체 하나를 추가합니다.
2. `category`는 `career` 또는 `campus`처럼 `categories`에 등록된 키를 사용합니다.
3. `icon`은 현재 제공되는 `clipboard`, `send`, `users`, `calendar`, `wrench` 중 하나를 지정합니다. 새 아이콘이 필요하면 `js/app.js`의 `icons` 객체에 같은 키의 SVG를 추가합니다.
4. `order`로 카테고리 안의 표시 순서를 정합니다.
5. 커밋 후 배포 화면에서 카드와 링크를 확인합니다.

```js
{
  id: "project",
  name: "학생 프로젝트 관리",
  englishName: "Student Projects",
  category: "campus",
  description: "서비스의 전체 설명",
  shortDescription: "카드에 표시할 한 줄 설명",
  url: "https://example.k-bigdata.kr/",
  icon: "clipboard",
  accent: "blue",
  tags: ["프로젝트", "협업"],
  featured: false,
  order: 6
}
```

기존 서비스를 수정할 때도 같은 객체의 이름, 설명, URL, 태그 또는 순서만 변경하면 됩니다. 렌더러가 카테고리별로 자동 그룹화하고 `order` 순서대로 표시합니다.

## GitHub Pages 배포

1. 저장소의 **Settings → Pages**로 이동합니다.
2. **Build and deployment**의 Source를 **Deploy from a branch**로 선택합니다.
3. Branch를 **main**, 폴더를 **/(root)**로 선택하고 저장합니다.
4. 배포가 끝나면 `https://portal.k-bigdata.kr/`에서 확인합니다.

별도 빌드 과정이나 패키지 설치는 필요하지 않습니다. 정적 파일을 GitHub Pages가 그대로 제공합니다.

## CNAME과 도메인 운영

루트 `CNAME` 파일은 아래 한 줄만 포함합니다.

```text
portal.k-bigdata.kr
```

DNS 제공자에서 `portal` 호스트의 CNAME 레코드가 `hyeopgeon-lee.github.io`를 가리키도록 설정합니다. GitHub Pages 설정의 **Custom domain**에도 `portal.k-bigdata.kr`을 입력하고 DNS 검사가 완료되면 **Enforce HTTPS**를 활성화합니다.

`CNAME` 파일은 브랜치 배포 때 유지되어야 합니다. 다른 배포 도구가 이 파일을 삭제하거나 덮어쓰지 않는지 확인하세요.
