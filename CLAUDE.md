# 지금 뜨는 이슈 홈피드 사이트

## 이게 뭔가요
사용자(다예)는 블로거로, "지금 막 뜬 이슈"(예: 연예인 스캔들이 터진 지 5분 만에 여러 매체가 다루기 시작하는 순간)를 빠르게 캐치해서 글을 쓰면 조회수가 잘 나온다는 경험이 있음. 이걸 자동화하기 위해, 카테고리별(연예/연애, 경제, 정치/사회, 스포츠)로 네이버 뉴스를 주기적으로 수집하고 "갑자기 여러 기사가 몰리기 시작한 키워드"를 감지해 홈피드 카드로 보여주는 사이트를 만들었음.

**만약 사용자가 다음에 할 일을 잘 설명하지 못하거나 "어제 하던 거 이어서 해줘"라고만 말해도, 이 문서와 아래 "다음에 이어서 할 일" 섹션을 기준으로 상황을 파악하고 먼저 어떤 걸 하고 싶은지 확인한 뒤 진행할 것.**

## 구조
- `server/` — Node.js + Express 백엔드. `npm install` 후 `npm start`로 실행 (기본 포트 4000)
  - `src/services/naverClient.js` — 네이버 뉴스 검색 API 호출
  - `src/services/collector.js` — 카테고리별 시드 키워드로 뉴스 수집 → DB 저장 (요청 간 0.3초 간격 있음, 네이버 API 429 방지용)
  - `src/services/keywordExtractor.js` — 제목에서 키워드 후보 추출 (형태소 분석기 없는 러프한 방식, 알려진 한계 있음). 첫 생존 토큰을 "주어(entity)"로 보고, `EVENT_WORDS` 화이트리스트로 "인물+사건" 형태 라벨(예: "문근영 결혼")을 만듦
  - `src/services/trendEngine.js` — entity(주어) 기준으로 기사 묶어서 급상승 점수 계산. 이름 표기가 갈라진 경우(예: "야노"/"야노시호") 접두사+공통 단어 조건으로 병합. 기존 링크 겹침 기반 중복 제거(`SAME_STORY_OVERLAP`)는 2차 안전망으로 유지
  - `src/services/discordNotifier.js` — 뜨거운 이슈(기사 5건 이상)를 디스코드 웹훅으로 알림. `DISCORD_WEBHOOK_URL` 미설정 시 조용히 꺼짐
  - `src/services/scheduler.js` — `COLLECT_INTERVAL_MIN`(기본 10분)마다 수집+계산(+디스코드 알림) 자동 실행
  - `src/config/categories.js` — 카테고리/시드 키워드 목록 (여기서 추가/수정)
  - DB는 `better-sqlite3`가 아니라 Node 내장 **`node:sqlite`** 사용 중 — 처음 만들 때 이 컴퓨터에 Python/빌드 도구가 없어서 네이티브 컴파일이 안 됐기 때문. 다른 컴퓨터에서도 Node 22+ 면 문제없이 동작하지만, 혹시 `node:sqlite` 관련 에러가 나면 Node 버전을 먼저 확인할 것 (`node -v`, 22 이상 필요).
- `public/` — 순수 HTML/CSS/JS 프론트엔드. 카테고리 탭 + 트렌드 카드 UI, `/api/trends`를 폴링

## 새 컴퓨터(회사)에서 처음 시작할 때
```
git clone https://github.com/daye971220-a11y/daye.git
cd daye/server
npm install
```
`server/.env.example`을 복사해 `server/.env`로 만들고 네이버 Client ID/Secret을 채워넣기 (키는 사용자에게 직접 물어볼 것 — git에는 안 올라가 있음). 디스코드 알림을 쓰려면 `DISCORD_WEBHOOK_URL`도 채워넣기 (안 채워도 사이트는 정상 동작, 알림만 꺼짐). 그 다음 `npm start`.

## 다음에 이어서 할 일 / 알려진 이슈
1. **네이버 API 키 재발급 고려**: 기존 키가 대화 중 노출됐고 저장소가 Public이라, `developers.naver.com` 내 애플리케이션에서 키를 재발급하는 걸 권장했었음. 재발급했다면 `.env`도 새 키로 업데이트해야 함.
2. **키워드 추출/중복 제거는 entity(주어) 기준으로 개편 완료, 그래도 완벽하진 않음**: `keywordExtractor.js`의 `EVENT_WORDS`(사건어 화이트리스트)나 `STOPWORDS`(범용 명사 차단 목록)를 실사용 피드백 보고 계속 보강할 것. `trendEngine.js`의 이름 병합 로직(`mergeAliasBuckets`)도 마찬가지로 튜닝 여지 있음.
3. **트렌드 파라미터 튜닝 여지 있음**: `trendEngine.js`의 `MIN_ARTICLES`(최소 기사 수, 현재 3), `RECENT_WINDOW_MIN`(급상승 판단 구간, 현재 60분), `TOP_K`(카테고리별 카드 수, 현재 8) 등은 실제 사용 패턴을 보고 조정하는 게 자연스러움. `discordNotifier.js`의 `NOTIFY_MIN_ARTICLES`(현재 5), `RENOTIFY_ARTICLE_INCREASE`(현재 3)도 마찬가지.
4. **현재는 로컬(localhost)에서만 실행 중**: 다른 기기나 외부에서 접속하고 싶으면 배포(Vercel/Render 등)가 필요한데 아직 결정 안 됨. 사용자가 원하면 그때 방식을 상의해서 진행할 것.
5. **카테고리/시드 키워드 확장 가능**: 사용자가 새로운 관심 카테고리를 원하면 `categories.js`에 추가하면 됨. 영화/드라마/공연·전시/패션 카테고리 추가됨(다예님 기존 블로그 "무모한당케의 인생여행" 소재 기준).
6. **디스코드 알림 추가됨**: `DISCORD_WEBHOOK_URL` 설정하면 기사 5건 이상 몰린 이슈를 디스코드로 알림. 처음 뜰 때 1번 + 기사 수가 3건 이상 더 늘면 재알림. 알림이 너무 많거나 적으면 `discordNotifier.js`의 기준값 조정.
7. **경제 카테고리는 거시경제 뉴스가 아니라 "내가 받을 수 있는 혜택/돈" 위주로 재정의됨**: 지원금·환급금·청년정책 / 은행·적금·카드·통신비 혜택 / 가격 인상·수수료·제도 변경 / 소비자 할인·보상 4갈래로 시드 키워드 교체(증시/코스피/부동산 등 거시 뉴스는 의도적으로 제외). 네이버 검색 특성상 여전히 무관한 기사가 섞일 수 있어서(예: 스마트폰 판매 소식, 해외 비자 수수료 뉴스), 실사용하면서 `categories.js`의 economy `seedKeywords`를 계속 다듬을 것.

## 작업 후 GitHub에 반영하는 법
```
git add -A
git commit -m "설명"
git push
```
