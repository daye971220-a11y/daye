// 키워드 리서치 결과를 엑셀(.xlsx)로 내보내기. 다예님이 참고로 보내준 이미지(네이버 건강
// 블로그 핵심 키워드 TOP100 스프레드시트)의 레이아웃을 최대한 그대로 재현한다:
// 제목 → 요약 통계 4칸 → 선정 기준 각주 → 헤더(남색 배경/흰 글씨) → 데이터(줄무늬 배경).
const ExcelJS = require('exceljs');

const NAVY = 'FF1F2A44';
const LIGHT_BLUE = 'FFE8F0FE';
const STAT_BG = 'FFEFF4FF';
const WHITE = 'FFFFFFFF';

const COLUMNS = [
  { header: '순위', key: 'rank', width: 8 },
  { header: '대표 키워드', key: 'keyword', width: 22 },
  { header: 'PC 검색량', key: 'pcQc', width: 14 },
  { header: '모바일 검색량', key: 'mobileQc', width: 14 },
  { header: '월간 총검색량', key: 'totalQc', width: 15 },
  { header: '모바일 비중', key: 'mobileRatio', width: 12 },
  { header: '유형', key: 'seasonType', width: 10 },
  { header: '발행 우선순위', key: 'priority', width: 14 },
  { header: '광고 경쟁도', key: 'compIdx', width: 12 },
  { header: '추천 제목', key: 'recommendedTitle', width: 50 },
];

function buildWorkbook(topicLabel, data) {
  const { rows, lastRunAt } = data;
  const wb = new ExcelJS.Workbook();
  wb.creator = '지금 뜨는 이슈 - 키워드 리서치';
  wb.created = new Date();

  const sheet = wb.addWorksheet(`${topicLabel} 키워드`, {
    views: [{ state: 'frozen', ySplit: 6 }],
  });
  sheet.columns = COLUMNS;

  const totalQcSum = rows.reduce((s, r) => s + r.totalQc, 0);
  const sortedTotal = [...rows].map((r) => r.totalQc).sort((a, b) => a - b);
  const median = sortedTotal.length
    ? sortedTotal[Math.floor(sortedTotal.length / 2)]
    : 0;
  const mobileWeightedAvg = totalQcSum
    ? (rows.reduce((s, r) => s + r.mobileQc, 0) / totalQcSum) * 100
    : 0;

  // 1행: 제목
  sheet.mergeCells(1, 1, 1, COLUMNS.length);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = `네이버 ${topicLabel} 블로그 핵심 키워드 TOP${rows.length}`;
  titleCell.font = { size: 16, bold: true };
  sheet.getRow(1).height = 26;

  // 2행: 요약 통계 4칸 (선정 키워드 / 월간 총검색량 합계 / 검색량 중앙값 / 모바일 검색 비중)
  const stats = [
    ['선정 키워드', rows.length],
    ['월간 총검색량 합계', totalQcSum],
    ['검색량 중앙값', median],
    ['모바일 검색 비중', `${mobileWeightedAvg.toFixed(1)}%`],
  ];
  const statColSpan = Math.max(2, Math.floor(COLUMNS.length / stats.length));
  stats.forEach(([label, value], i) => {
    const startCol = i * statColSpan + 1;
    const endCol = i === stats.length - 1 ? COLUMNS.length : startCol + statColSpan - 1;
    sheet.mergeCells(2, startCol, 2, endCol);
    sheet.mergeCells(3, startCol, 3, endCol);
    const labelCell = sheet.getCell(2, startCol);
    labelCell.value = label;
    labelCell.font = { size: 10, color: { argb: 'FF6B7280' } };
    labelCell.alignment = { horizontal: 'center' };
    labelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STAT_BG } };

    const valueCell = sheet.getCell(3, startCol);
    valueCell.value = typeof value === 'number' ? value : value;
    if (typeof value === 'number') valueCell.numFmt = '#,##0';
    valueCell.font = { size: 14, bold: true };
    valueCell.alignment = { horizontal: 'center' };
    valueCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: STAT_BG } };
  });
  sheet.getRow(2).height = 16;
  sheet.getRow(3).height = 22;

  // 4행: 선정 기준 각주
  sheet.mergeCells(4, 1, 4, COLUMNS.length);
  const noteCell = sheet.getCell(4, 1);
  noteCell.value =
    `선정 기준: 높은 월간 검색량 · 최근 급상승 여부(데이터랩) · 뉴스 헤드라인 빈도 종합 반영 · ` +
    `검색량은 네이버 검색광고 API 기준${lastRunAt ? ` (수집: ${new Date(lastRunAt).toLocaleString('ko-KR')})` : ''}`;
  noteCell.font = { size: 9, italic: true, color: { argb: 'FF6B7280' } };

  sheet.getRow(5).height = 6; // 여백

  // 6행: 헤더
  const headerRowIdx = 6;
  const headerRow = sheet.getRow(headerRowIdx);
  COLUMNS.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font = { bold: true, color: { argb: WHITE } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  headerRow.height = 22;

  // 7행부터: 데이터
  rows.forEach((r, i) => {
    const row = sheet.getRow(headerRowIdx + 1 + i);
    row.values = {
      rank: r.rank,
      keyword: r.keyword,
      pcQc: r.pcQc,
      mobileQc: r.mobileQc,
      totalQc: r.totalQc,
      mobileRatio: r.mobileRatio / 100,
      seasonType: r.seasonType,
      priority: r.priority,
      compIdx: r.compIdx || '-',
      recommendedTitle: r.recommendedTitle,
    };
    row.getCell('pcQc').numFmt = '#,##0';
    row.getCell('mobileQc').numFmt = '#,##0';
    row.getCell('totalQc').numFmt = '#,##0';
    row.getCell('mobileRatio').numFmt = '0.0%';
    row.getCell('rank').alignment = { horizontal: 'center' };
    row.getCell('seasonType').alignment = { horizontal: 'center' };
    row.getCell('priority').alignment = { horizontal: 'center' };
    row.getCell('compIdx').alignment = { horizontal: 'center' };

    if (i % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: LIGHT_BLUE } };
      });
    }
  });

  sheet.getColumn('rank').alignment = { horizontal: 'center' };

  return wb;
}

module.exports = { buildWorkbook };
