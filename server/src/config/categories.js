// 카테고리별 시드 키워드: 네이버 뉴스 검색 API는 카테고리 피드가 아니라 키워드 검색이라
// 각 카테고리를 대표하는 키워드 여러 개로 최신 기사를 긁어모으는 방식으로 흉내낸다.
module.exports = [
  {
    id: 'entertainment',
    label: '연예/연애',
    emoji: '💛',
    seedKeywords: ['연예', '열애', '결별', '이혼', '스캔들', '아이돌', '배우'],
  },
  {
    id: 'economy',
    label: '경제',
    emoji: '💰',
    seedKeywords: ['경제', '증시', '코스피', '부동산', '금리', '환율'],
  },
  {
    id: 'society',
    label: '정치/사회',
    emoji: '🏛️',
    seedKeywords: ['정치', '국회', '사회', '사건사고', '대통령실'],
  },
  {
    id: 'sports',
    label: '스포츠',
    emoji: '⚽',
    seedKeywords: ['스포츠', '야구', '축구', '올림픽', '선수'],
  },
];
