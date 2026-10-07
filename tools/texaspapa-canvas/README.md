# 텍사스파파 캔버스 도구 (브랜드 가이드 준수판 만들 때 쓴 스크립트)

브랜드 이미지·폰트 파일은 공개 저장소라 여기 없음. 다시 돌리려면 회사컴 `1. 텍파_브랜드가이드_디자인가이드` 폴더에서 로고/사진/폰트를 꺼내 스크립트가 기대하는 폴더 구조(아래)로 두고 경로를 맞출 것. 보통은 Claude에게 "캔버스 읽어서 렌더 검수해줘"라고 하면 이 스크립트를 참고해 다시 만들어 씀.

- `convert.js` — 원본 캔버스 79장 → 가이드 준수판 일괄 변환 (서체, 색 매핑, 로고 색/국문 로고/잘린 캐릭터/투명도·회전/글자로 쓴 로고). blob 주소 매핑 포함
- `fixes.js` — 렌더 검수 후 손으로 고친 16장 (중복 로고, 캐릭터 크기, 겹침, 사진 위 글씨 가독성, 아치 배경)
- 렌더 검수: `build.js`(.dc.html → 정적 HTML, `/_blob/` → 로컬 파일) + `combine.js`(여러 장을 한 페이지에) + `sheets.sh`(헤드리스 Chrome으로 6장씩 0.5배 스크린샷) + `measure.js`(서체 교체 전후 줄 수·넘침 자동 비교)
  - 로컬 에셋 폴더 기준: `fonts/`(Pretendard·WantedSans woff2), `photos/`(crepe_strawberry/nutella/table.jpg), `cutouts/`(cutout_strawberry/oreo_1416.png), `logos/`(원본 남색·흰색 로고 PNG), `logos2/`(#0A33B5 로고 + 캐릭터 단독 PNG)
  - Edge는 헤드리스 출력이 안 잡혀서 Chrome 사용 (`--headless=new --screenshot`, 한 장에 약 10초)
  - claude.ai 캔버스 자체는 내장 브라우저에서 로그인이 필요해 직접 열 수 없었음 → 이 로컬 렌더로 검수함
