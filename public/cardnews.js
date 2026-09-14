// 감지된 이슈(트렌드)를 블로그/인스타에 올릴 수 있는 카드뉴스 이미지(PNG)로 그려주는 모듈.
// 스타일: 인스타 "정보성 콘텐츠" 카드뉴스 느낌 — 파스텔 단색 배경 + 마카체 굵은 제목 +
// 흰 체크리스트 박스 + 형광펜 하이라이트 강조. 외부 라이브러리 없이 Canvas 2D API만 사용
// (제목용 폰트만 구글 폰트 "Black Han Sans"를 CDN에서 불러옴 — index.html에 <link>로 로드).
// window.CardNews.generate(trend, categoryMeta) -> Promise<HTMLCanvasElement[]>
(function () {
  const WIDTH = 1080;
  const HEIGHT = 1350; // 인스타그램 세로형(4:5) 비율
  const PAD = 72;

  const HEADLINE_FONT = 'Black Han Sans';
  const HEADLINE_FALLBACK = `"${HEADLINE_FONT}", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif`;
  const BODY_FONT = '"Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

  const TEXT_COLOR = '#1a1a1a';
  const MUTED_COLOR = '#5b5b52';

  // 배경으로 쓸 파스텔 팔레트 (인스타 카드뉴스에서 흔한 톤)
  const PALETTE = ['#F2EF7A', '#BFDCEF', '#DCDFF2', '#F3EAD4'];
  // 팔레트별로 잘 보이는 형광펜 하이라이트 색 (배경과 부딕히지 않게 대비되는 톤)
  const HIGHLIGHT_FOR = {
    '#F2EF7A': '#FFFFFF',
    '#BFDCEF': '#FFE84D',
    '#DCDFF2': '#FFE84D',
    '#F3EAD4': '#FFE84D',
  };

  const HOOK_TEMPLATES = ['지금 이 얘기만 나옵니다', '벌써 다들 알고 있대요', '지금 딱 터진 이슈예요', '실시간으로 커지는 중'];
  const FALLBACK_HIGHLIGHT_TEMPLATES = ['기사가 계속 늘고 있어요', '지금이 딱 타이밍이에요', '아직 다들 잘 몰라요'];

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  function pickPalette(seed) {
    const h = hashString(seed);
    const base = h % PALETTE.length;
    // 표지/체크리스트/하이라이트 슬라이드가 서로 다른 색이 되도록 오프셋을 둠
    const at = (offset) => PALETTE[(base + offset) % PALETTE.length];
    return { cover: at(0), checklist: at(1), highlight: at(2) };
  }

  function pickFrom(list, seed) {
    return list[hashString(seed) % list.length];
  }

  function createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    return canvas;
  }

  function paintBackground(ctx, color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // 텍스트를 글자 단위로 줄바꿈 (형태소 분석 없이 러프하게 - 한글은 어절 단위보다 글자 단위 wrap이 안전)
  function wrapText(ctx, text, maxWidth) {
    const lines = [];
    let current = '';
    for (const ch of text) {
      const test = current + ch;
      if (current && ctx.measureText(test).width > maxWidth) {
        lines.push(current);
        current = ch;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function fitFontSize(ctx, text, maxWidth, maxLines, startSize, minSize, fontFamily, weight = 400) {
    let size = startSize;
    let lines;
    while (size > minSize) {
      ctx.font = `${weight} ${size}px ${fontFamily}`;
      lines = wrapText(ctx, text, maxWidth);
      if (lines.length <= maxLines) break;
      size -= 4;
    }
    ctx.font = `${weight} ${size}px ${fontFamily}`;
    return { size, lines: lines || wrapText(ctx, text, maxWidth) };
  }

  // 형광펜으로 밑줄 대신 배경을 쓱 칠한 느낌의 강조 텍스트. 한 줄씩 사각형을 그린 뒤 글자를 얹음.
  function drawHighlightLine(ctx, text, centerX, baselineY, opts = {}) {
    const { font, highlightColor = '#FFE84D', textColor = TEXT_COLOR, padX = 12, extraBottom = 10 } = opts;
    ctx.font = font;
    const width = ctx.measureText(text).width;
    const metrics = ctx.measureText(text);
    const ascent = metrics.actualBoundingBoxAscent || parseInt(font, 10) * 0.75 || 40;
    const descent = (metrics.actualBoundingBoxDescent || parseInt(font, 10) * 0.2 || 10) + extraBottom;
    const x = centerX - width / 2;
    ctx.fillStyle = highlightColor;
    ctx.fillRect(x - padX, baselineY - ascent, width + padX * 2, ascent + descent);
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(text, x, baselineY);
    return width;
  }

  function drawPill(ctx, text, x, y, opts = {}) {
    const {
      font = `700 28px ${BODY_FONT}`,
      textColor = TEXT_COLOR,
      bg = '#ffffff',
      border = TEXT_COLOR,
      paddingX = 26,
      paddingY = 14,
    } = opts;
    ctx.font = font;
    const textWidth = ctx.measureText(text).width;
    const w = textWidth + paddingX * 2;
    const h = paddingY * 2 + 28;
    roundRect(ctx, x, y, w, h, h / 2);
    ctx.fillStyle = bg;
    ctx.fill();
    if (border) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = border;
      ctx.stroke();
    }
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + paddingX, y + h / 2 + 2);
    return { width: w, height: h };
  }

  function drawFooter(ctx, pageLabel) {
    ctx.font = `700 24px ${BODY_FONT}`;
    ctx.fillStyle = MUTED_COLOR;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('#지금뜨는이슈', PAD, HEIGHT - 56);
    if (pageLabel) {
      ctx.textAlign = 'right';
      ctx.fillText(pageLabel, WIDTH - PAD, HEIGHT - 56);
    }
  }

  function formatRelative(isoString) {
    if (!isoString) return '';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
  }

  // ---- 슬라이드 1: 표지(후킹 문구) ----
  function drawCoverSlide(trend, categoryMeta, bgColor, highlightColor) {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');
    paintBackground(ctx, bgColor);

    drawPill(ctx, '🔥 지금 뜨는 이슈', PAD, 64);

    ctx.font = `700 28px ${BODY_FONT}`;
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${categoryMeta.emoji || ''} ${categoryMeta.label || ''}`.trim(), WIDTH - PAD, 64 + 30);

    const centerX = WIDTH / 2;
    const maxWidth = WIDTH - PAD * 2 - 40;
    const { size: keywordSize, lines: keywordLines } = fitFontSize(
      ctx,
      trend.keyword,
      maxWidth,
      2,
      92,
      52,
      HEADLINE_FALLBACK,
      900
    );
    const hook = pickFrom(HOOK_TEMPLATES, trend.keyword);
    ctx.font = `900 56px ${HEADLINE_FALLBACK}`;
    const hookLines = wrapText(ctx, hook, maxWidth);

    const keywordLineHeight = keywordSize * 1.2;
    const hookLineHeight = 56 * 1.25;
    const totalHeight = keywordLines.length * keywordLineHeight + hookLines.length * hookLineHeight + 24;

    let y = HEIGHT / 2 - totalHeight / 2 + keywordSize * 0.85;
    const keywordFont = `900 ${keywordSize}px ${HEADLINE_FALLBACK}`;
    keywordLines.forEach((line) => {
      drawHighlightLine(ctx, line, centerX, y, { font: keywordFont, highlightColor });
      y += keywordLineHeight;
    });

    y += 24;
    ctx.font = `900 56px ${HEADLINE_FALLBACK}`;
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    hookLines.forEach((line) => {
      ctx.fillText(line, centerX, y);
      y += hookLineHeight;
    });

    y += 56;
    ctx.font = `700 30px ${BODY_FONT}`;
    ctx.fillStyle = MUTED_COLOR;
    ctx.textAlign = 'center';
    ctx.fillText(
      `기사 ${trend.articleCount}건 몰림 · ${formatRelative(trend.firstSeenAt)} 처음 감지`,
      centerX,
      y
    );

    drawFooter(ctx, '1/4');
    return canvas;
  }

  // ---- 슬라이드 2: "무슨 일이야?" 체크리스트 ----
  function drawChecklistSlide(trend, bgColor) {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');
    paintBackground(ctx, bgColor);

    ctx.font = `900 68px ${HEADLINE_FALLBACK}`;
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('무슨 일이야?', PAD, 168);

    ctx.strokeStyle = TEXT_COLOR;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(PAD, 200);
    ctx.lineTo(PAD + 110, 200);
    ctx.stroke();

    const boxX = PAD;
    const boxY = 270;
    const boxW = WIDTH - PAD * 2;
    const innerPad = 44;
    const itemGap = 36;
    const lineH = 44;
    const titleMaxWidth = boxW - innerPad * 2 - 56;

    ctx.font = `700 34px ${BODY_FONT}`;
    const items = (trend.sampleTitles || []).slice(0, 3).map((title) => wrapText(ctx, title, titleMaxWidth));

    // contentH와 아래 그리기 루프가 정확히 같은 방식으로 높이를 누적해야
    // 항목이 박스 밖으로 삐져나오지 않는다 (rowTop 진행폭 = contentH 계산과 1:1 대응).
    let contentH = innerPad * 2;
    items.forEach((lines, idx) => {
      contentH += lines.length * lineH;
      if (idx < items.length - 1) contentH += itemGap;
    });

    roundRect(ctx, boxX, boxY, boxW, contentH, 28);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = TEXT_COLOR;
    ctx.stroke();

    let rowTop = boxY + innerPad;
    items.forEach((lines, idx) => {
      const baseline = rowTop + lineH * 0.75;
      ctx.font = `700 34px ${BODY_FONT}`;
      ctx.fillStyle = TEXT_COLOR;
      ctx.textAlign = 'left';
      ctx.fillText('✔', boxX + innerPad, baseline);

      lines.forEach((line, li) => {
        ctx.fillText(line, boxX + innerPad + 56, baseline + li * lineH);
      });
      rowTop += lines.length * lineH;

      if (idx < items.length - 1) {
        const dividerY = rowTop + itemGap / 2;
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(boxX + innerPad, dividerY);
        ctx.lineTo(boxX + boxW - innerPad, dividerY);
        ctx.stroke();
        rowTop += itemGap;
      }
    });

    drawFooter(ctx, '2/4');
    return canvas;
  }

  // ---- 슬라이드 3: 하이라이트 콜아웃 ----
  function drawHighlightSlide(trend, bgColor, highlightColor) {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');
    paintBackground(ctx, bgColor);

    const centerX = WIDTH / 2;
    const hasBlogCount = trend.blogCount !== null && trend.blogCount !== undefined;

    const line1 = hasBlogCount ? '블로그에는 아직' : '지금 이 순간에도';
    const line2 = hasBlogCount ? `${trend.blogCount}개뿐` : pickFrom(FALLBACK_HIGHLIGHT_TEMPLATES, trend.keyword);
    const subtext = hasBlogCount
      ? '지금 쓰면 블로그 소재로 딱이에요 ✍️'
      : `기사 ${trend.articleCount}건 · ${formatRelative(trend.latestArticleAt)} 최신 기사`;

    ctx.font = `900 64px ${HEADLINE_FALLBACK}`;
    const maxWidth = WIDTH - PAD * 2 - 40;
    const line1Wrapped = wrapText(ctx, line1, maxWidth);
    const line2Wrapped = wrapText(ctx, line2, maxWidth);
    const lineHeight = 64 * 1.3;
    const totalHeight = (line1Wrapped.length + line2Wrapped.length) * lineHeight;

    let y = HEIGHT / 2 - totalHeight / 2 + 64 * 0.85;
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    line1Wrapped.forEach((line) => {
      ctx.fillText(line, centerX, y);
      y += lineHeight;
    });

    const highlightFont = `900 64px ${HEADLINE_FALLBACK}`;
    line2Wrapped.forEach((line) => {
      drawHighlightLine(ctx, line, centerX, y, { font: highlightFont, highlightColor });
      y += lineHeight;
    });

    y += 56;
    ctx.font = `700 30px ${BODY_FONT}`;
    ctx.fillStyle = MUTED_COLOR;
    ctx.textAlign = 'center';
    ctx.fillText(subtext, centerX, y);

    drawFooter(ctx, '3/4');
    return canvas;
  }

  // ---- 슬라이드 4: 마무리 CTA ----
  function drawClosingSlide(trend, bgColor, highlightColor) {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');
    paintBackground(ctx, bgColor);

    const centerX = WIDTH / 2;
    ctx.font = `900 68px ${HEADLINE_FALLBACK}`;
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    let y = HEIGHT / 2 - 80;
    ctx.fillText('저장해두고', centerX, y);
    y += 68 * 1.3;
    drawHighlightLine(ctx, '놓치지 마세요 👀', centerX, y, {
      font: `900 68px ${HEADLINE_FALLBACK}`,
      highlightColor,
    });

    y += 90;
    ctx.font = `700 28px ${BODY_FONT}`;
    ctx.fillStyle = MUTED_COLOR;
    ctx.textAlign = 'center';
    ctx.fillText(
      `최초 감지 ${formatRelative(trend.firstSeenAt)} · 최신기사 ${formatRelative(trend.latestArticleAt)}`,
      centerX,
      y
    );

    drawFooter(ctx, '4/4');
    return canvas;
  }

  // 캔버스 렌더링 전에 커스텀 폰트가 실제로 로드됐는지 확인 (실패해도 폴백 폰트로 계속 진행)
  function ensureFontReady() {
    if (!document.fonts) return Promise.resolve();
    const timeout = new Promise((resolve) => setTimeout(resolve, 2500));
    const load = document.fonts
      .load(`900 100px "${HEADLINE_FONT}"`)
      .then(() => document.fonts.ready)
      .catch(() => {});
    return Promise.race([load, timeout]);
  }

  async function generate(trend, categoryMeta) {
    await ensureFontReady();

    const { cover, checklist, highlight } = pickPalette(trend.keyword);
    const meta = categoryMeta || {};

    return [
      drawCoverSlide(trend, meta, cover, HIGHLIGHT_FOR[cover]),
      drawChecklistSlide(trend, checklist),
      drawHighlightSlide(trend, highlight, HIGHLIGHT_FOR[highlight]),
      drawClosingSlide(trend, cover, HIGHLIGHT_FOR[cover]),
    ];
  }

  window.CardNews = { generate, WIDTH, HEIGHT };
})();
