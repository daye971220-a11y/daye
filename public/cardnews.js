// 감지된 이슈(트렌드)를 블로그/인스타에 올릴 수 있는 카드뉴스 이미지(PNG)로 그려주는 모듈.
// 외부 라이브러리 없이 Canvas 2D API만 사용. window.CardNews.generate(trend, categoryMeta) -> HTMLCanvasElement[]
(function () {
  const WIDTH = 1080;
  const HEIGHT = 1350; // 인스타그램 세로형(4:5) 비율
  const FONT_FAMILY = '"Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
  const PAD = 64;

  const COLORS = {
    bgTop: '#1c1c1f',
    bgBottom: '#2b2a2e',
    accent: '#ff9a56',
    accentSoft: 'rgba(255, 154, 86, 0.16)',
    text: '#f5f5f3',
    muted: '#b7b5b2',
    divider: 'rgba(255, 255, 255, 0.1)',
  };

  function createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    return canvas;
  }

  function paintBackground(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    grad.addColorStop(0, COLORS.bgTop);
    grad.addColorStop(1, COLORS.bgBottom);
    ctx.fillStyle = grad;
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

  function fitFontSize(ctx, text, maxWidth, maxLines, startSize, minSize) {
    let size = startSize;
    let lines;
    while (size > minSize) {
      ctx.font = `800 ${size}px ${FONT_FAMILY}`;
      lines = wrapText(ctx, text, maxWidth);
      if (lines.length <= maxLines) break;
      size -= 4;
    }
    ctx.font = `800 ${size}px ${FONT_FAMILY}`;
    return { size, lines: lines || wrapText(ctx, text, maxWidth) };
  }

  function drawPill(ctx, text, x, y, opts = {}) {
    const {
      font = `600 30px ${FONT_FAMILY}`,
      textColor = COLORS.accent,
      bg = COLORS.accentSoft,
      paddingX = 28,
      paddingY = 16,
    } = opts;
    ctx.font = font;
    const textWidth = ctx.measureText(text).width;
    const w = textWidth + paddingX * 2;
    const h = paddingY * 2 + 30;
    roundRect(ctx, x, y, w, h, h / 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + paddingX, y + h / 2 + 2);
    return { width: w, height: h };
  }

  function drawFooter(ctx, pageLabel) {
    ctx.font = `500 24px ${FONT_FAMILY}`;
    ctx.fillStyle = COLORS.muted;
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

  function drawCoverSlide(trend, categoryMeta) {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');
    paintBackground(ctx);

    drawPill(ctx, '🔥 지금 뜨는 이슈', PAD, 72);

    ctx.font = `600 30px ${FONT_FAMILY}`;
    ctx.fillStyle = COLORS.muted;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${categoryMeta.emoji || ''} ${categoryMeta.label || ''}`.trim(), WIDTH - PAD, 72 + 31);

    const maxWidth = WIDTH - PAD * 2;
    const { size, lines } = fitFontSize(ctx, trend.keyword, maxWidth, 3, 56);
    const lineHeight = size * 1.25;
    const totalHeight = lineHeight * lines.length;
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    let y = HEIGHT / 2 - totalHeight / 2 + size * 0.8;
    for (const line of lines) {
      ctx.fillText(line, PAD, y);
      y += lineHeight;
    }

    let bx = PAD;
    const by = y + 40;
    const badge1 = drawPill(ctx, `📈 기사 ${trend.articleCount}건 몰림`, bx, by, {
      font: `700 28px ${FONT_FAMILY}`,
      textColor: '#1c1c1f',
      bg: COLORS.accent,
    });
    bx += badge1.width + 16;
    if (trend.blogCount !== null && trend.blogCount !== undefined) {
      drawPill(ctx, `✍️ 블로그 ${trend.blogCount}개뿐`, bx, by, {
        font: `600 26px ${FONT_FAMILY}`,
        textColor: COLORS.muted,
        bg: 'rgba(255,255,255,0.08)',
      });
    }

    ctx.font = `500 26px ${FONT_FAMILY}`;
    ctx.fillStyle = COLORS.muted;
    ctx.textAlign = 'left';
    ctx.fillText(`${formatRelative(trend.firstSeenAt)} 처음 감지`, PAD, by + 90);

    drawFooter(ctx, null);
    return canvas;
  }

  function drawContentSlide(titles, pageLabel) {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');
    paintBackground(ctx);

    ctx.font = `800 52px ${FONT_FAMILY}`;
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('무슨 일이야?', PAD, 140);

    ctx.strokeStyle = COLORS.accent;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(PAD, 168);
    ctx.lineTo(PAD + 96, 168);
    ctx.stroke();

    let y = 260;
    const numberColW = 56;
    const maxWidth = WIDTH - PAD * 2 - numberColW;
    titles.forEach((title, idx) => {
      ctx.font = `700 30px ${FONT_FAMILY}`;
      ctx.fillStyle = COLORS.accent;
      ctx.textAlign = 'left';
      ctx.fillText(`${idx + 1}`, PAD, y);

      ctx.font = `500 36px ${FONT_FAMILY}`;
      ctx.fillStyle = COLORS.text;
      const lines = wrapText(ctx, title, maxWidth);
      let ly = y;
      lines.forEach((line) => {
        ctx.fillText(line, PAD + numberColW, ly);
        ly += 48;
      });
      y = ly + 48;

      if (idx < titles.length - 1) {
        ctx.strokeStyle = COLORS.divider;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(PAD, y - 24);
        ctx.lineTo(WIDTH - PAD, y - 24);
        ctx.stroke();
      }
    });

    drawFooter(ctx, pageLabel);
    return canvas;
  }

  function drawOutroSlide(trend) {
    const canvas = createCanvas();
    const ctx = canvas.getContext('2d');
    paintBackground(ctx);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `800 60px ${FONT_FAMILY}`;
    ctx.fillStyle = COLORS.text;
    ctx.fillText('더 자세한 이야기는', WIDTH / 2, HEIGHT / 2 - 60);
    ctx.fillStyle = COLORS.accent;
    ctx.fillText('블로그에서 👀', WIDTH / 2, HEIGHT / 2 + 20);

    ctx.font = `500 28px ${FONT_FAMILY}`;
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(
      `최초 감지 ${formatRelative(trend.firstSeenAt)} · 최신기사 ${formatRelative(trend.latestArticleAt)}`,
      WIDTH / 2,
      HEIGHT / 2 + 100
    );

    ctx.textAlign = 'left';
    drawFooter(ctx, null);
    return canvas;
  }

  function chunk(arr, size) {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  }

  function generate(trend, categoryMeta) {
    const slides = [drawCoverSlide(trend, categoryMeta || {})];

    const titleChunks = chunk(trend.sampleTitles || [], 3);
    const total = titleChunks.length + 2; // 표지 + 내용 슬라이드들 + 마무리
    titleChunks.forEach((titles, idx) => {
      slides.push(drawContentSlide(titles, `${idx + 2}/${total}`));
    });

    slides.push(drawOutroSlide(trend));
    return slides;
  }

  window.CardNews = { generate, WIDTH, HEIGHT };
})();
