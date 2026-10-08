/**
 * "나한테 맞는 블로그 주제 찾기" 구글 폼 자동 생성 스크립트
 * 사용법: script.google.com → 새 프로젝트 → 이 코드 전체 붙여넣기 → createBlogTopicForm 실행
 * 실행이 끝나면 [실행 로그]에 응답용 링크와 편집용 링크가 나와요.
 */
function createBlogTopicForm() {
  var form = FormApp.create('나한테 맞는 블로그 주제 찾기 🌱');
  form.setDescription(
    '안내문을 읽고 작성해 주세요. 정답은 없어요!\n' +
    '주제를 못 정해도 괜찮고, 솔직할수록 나한테 맞는 추천을 받을 수 있어요.\n' +
    '답변은 다예만 봐요. (10~15분)\n\n' +
    '⏰ 10월 11일(일) 밤 12시까지 제출 부탁해요!'
  );
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);
  form.setAllowResponseEdits(true);
  form.setProgressBar(true);
  form.setConfirmationMessage('제출 완료! 다예가 확인하고 개인톡으로 추천 보내줄게요 🙌');

  // ── 섹션 1. 기본 정보 ──
  form.addTextItem().setTitle('이름').setRequired(true);
  form.addMultipleChoiceItem().setTitle('지금 네이버 블로그 상태는?')
    .setChoiceValues(['아직 없어요', '있지만 거의 안 써요', '가끔 쓰고 있어요', '꾸준히 쓰고 있어요'])
    .setRequired(true);
  form.addTextItem().setTitle('블로그 주소 (있다면)').setRequired(false);

  // ── 섹션 2. 블로그로 얻고 싶은 것 ──
  form.addPageBreakItem().setTitle('블로그로 얻고 싶은 것');
  form.addMultipleChoiceItem().setTitle('블로그를 어느 정도로 해볼 생각인가요?')
    .setChoiceValues(['체험단용으로 가볍게만 해볼래요', '꾸준히 제대로 해보고 싶어요', '아직 잘 모르겠어요'])
    .setRequired(true);
  form.addMultipleChoiceItem().setTitle('가장 얻고 싶은 것 하나만 골라주세요')
    .setChoiceValues([
      '협찬·체험단으로 여러 가지를 경험해보고 싶어요',
      '생활비(외식비, 미용비 등)를 줄이고 싶어요',
      '현금 부수입을 만들고 싶어요',
      '아직 잘 모르겠어요'
    ])
    .setRequired(true);
  form.addCheckboxItem().setTitle('그 밖에 얻고 싶은 것이 있다면 모두')
    .setChoiceValues(['협찬·체험단', '생활비 절약', '판매 수수료', '광고 수익(애드포스트)', '원고료', '기록·취미'])
    .showOtherOption(true)
    .setRequired(false);
  form.addCheckboxItem().setTitle('받아보고 싶은 협찬·체험은?')
    .setChoiceValues(['식사·카페', '숙소·여행', '전시·공연·체험', '화장품·뷰티', '미용실·네일·피부관리',
      '생활용품·가전', '식품', '옷·잡화', '운동·헬스', '잘 모르겠어요'])
    .showOtherOption(true)
    .setRequired(false);
  form.addParagraphTextItem().setTitle('"이렇게 되면 좋겠다" 하는 모습이 있다면 적어주세요')
    .setHelpText('예) "한 달 외식비를 절반으로", "여행 갈 때 숙소를 협찬받고 싶어요", "용돈 정도 부수입"')
    .setRequired(false);

  // ── 섹션 3. 방문·사진·작업 ──
  form.addPageBreakItem().setTitle('방문·사진·작업, 어디까지 괜찮나요?');
  form.addMultipleChoiceItem().setTitle('체험단으로 가게나 숙소에 직접 방문하는 건?')
    .setChoiceValues(['자주 가능해요 (주 1회 이상)', '가끔 가능해요 (월 1~2회)', '거의 어려워요', '방문하는 건 싫어요'])
    .setRequired(true);
  form.addMultipleChoiceItem().setTitle('집에서 제품을 써보고 사진 찍고 후기 쓰는 건?')
    .setChoiceValues(['괜찮아요', '가끔은 괜찮아요', '사진 찍는 게 부담돼요', '후기 쓰는 것 자체가 싫어요'])
    .setRequired(true);
  form.addMultipleChoiceItem().setTitle('자료를 찾아서 정보 글로 정리하는 건? (뉴스, 공식 홈페이지, 가격 등)')
    .setChoiceValues(['재밌어요', '괜찮아요', '부담돼요', '해봐야 알 것 같아요'])
    .setRequired(true);
  form.addMultipleChoiceItem().setTitle('평소 사진 습관은?')
    .setChoiceValues(['어디 가면 이미 많이 찍어요', '가끔 찍어요', '거의 안 찍어요'])
    .setRequired(true);
  form.addMultipleChoiceItem().setTitle('블로그에 내 얼굴이 나오는 건?')
    .setChoiceValues(['괜찮아요', '일부만 (뒷모습·손 등)', '절대 안 돼요'])
    .setRequired(true);
  form.addMultipleChoiceItem().setTitle('빨리 써야 하는 글은? (예: 예능 방송 직후, 소식 나온 당일)')
    .setChoiceValues(['괜찮아요, 저녁에 시간 돼요', '가끔은 가능해요', '어려워요, 내 속도대로 쓰고 싶어요'])
    .setRequired(true);

  // ── 섹션 4. 관심사와 생활 ──
  form.addPageBreakItem().setTitle('관심사와 생활');
  form.addCheckboxItem().setTitle('요즘 돈이나 시간을 가장 많이 쓰는 곳은?')
    .setChoiceValues(['여행', '맛집·카페', '전시·공연·팝업', '화장품·뷰티', '옷·쇼핑',
      '다이소·코스트코·이케아 등 생활용품', '자취·살림·인테리어', '운동·다이어트',
      '드라마·예능·연예', '재테크·혜택·짠테크', '반려동물', '자기계발·공부'])
    .showOtherOption(true)
    .setRequired(true);
  form.addTextItem().setTitle('친구들이 나한테 자주 물어보는 것이 있나요?')
    .setHelpText('예) "거기 카페 어디야?", "이 크림 뭐 써?"')
    .setRequired(false);
  form.addParagraphTextItem().setTitle('최근 3개월 안에 해본 것 중 남들에게 알려주고 싶었던 것 3가지')
    .setHelpText('사소해도 괜찮아요. 여기서 첫 글 소재를 찾을 거예요.')
    .setRequired(true);
  form.addCheckboxItem().setTitle('가까운 시일 안에 예정된 것이 있다면')
    .setHelpText('적고 싶은 만큼만 체크해주세요.')
    .setChoiceValues(['여행', '이사·자취 시작', '이직·퇴사', '결혼 준비', '큰 지출 (가전, 차 등)', '없음'])
    .setRequired(false);

  // ── 섹션 5. 쓸 수 있는 시간 ──
  form.addPageBreakItem().setTitle('쓸 수 있는 시간');
  form.addMultipleChoiceItem().setTitle('일주일에 현실적으로 쓸 수 있는 글 개수는?')
    .setChoiceValues(['1~2개', '3~4개', '5~6개', '매일 1개 이상'])
    .setRequired(true);
  form.addCheckboxItem().setTitle('주로 글 쓸 수 있는 시간대는?')
    .setChoiceValues(['출퇴근길', '점심시간', '평일 저녁', '주말', '일정하지 않아요'])
    .setRequired(true);
  form.addMultipleChoiceItem().setTitle('글 하나에 쓸 수 있는 시간은?')
    .setChoiceValues(['30분 이내', '1시간 정도', '2시간 이상도 괜찮아요'])
    .setRequired(true);
  form.addMultipleChoiceItem().setTitle('글쓰기에 AI(챗GPT 등)를 써볼 생각이 있나요?')
    .setChoiceValues(['이미 잘 써요', '써보고 싶어요', '잘 모르겠어요', '안 쓰고 싶어요'])
    .setRequired(false);

  // ── 섹션 6. 주제 결정 상태 (분기) ──
  form.addPageBreakItem().setTitle('주제, 어디까지 정했나요?');
  var statusItem = form.addMultipleChoiceItem().setTitle('안내문을 읽고 난 지금, 주제는?').setRequired(true);

  // 6A. 결정함
  var secA = form.addPageBreakItem().setTitle('주제를 결정한 분');
  form.addTextItem().setTitle('정한 주제').setHelpText('예) 여행·외출, 리빙').setRequired(true);
  form.addMultipleChoiceItem().setTitle('어느 쪽 블로그인가요?')
    .setChoiceValues(['경험·리뷰 블로그', '정보 글 + 광고 수익', '둘 다 (블로그 2개)', '잘 모르겠어요'])
    .setRequired(true);
  form.addParagraphTextItem().setTitle('이 주제를 고른 이유').setRequired(true);
  form.addParagraphTextItem().setTitle('걱정되는 점이 있다면').setRequired(false);

  // 6B. 후보만 있음
  var secB = form.addPageBreakItem().setTitle('후보만 있는 분');
  form.addTextItem().setTitle('후보 주제를 모두 적어주세요 (1~3개)').setRequired(true);
  form.addParagraphTextItem().setTitle('각 후보가 끌리는 이유').setRequired(true);
  form.addParagraphTextItem().setTitle('무엇 때문에 하나를 못 고르고 있나요?')
    .setHelpText('예) "둘 다 좋아서", "A는 좋은데 돈이 안 될 것 같아서", "쓸 거리가 금방 떨어질까봐"')
    .setRequired(true);

  // 6C. 아직 미정 (주제는 묻지 않음)
  var secC = form.addPageBreakItem().setTitle('아직 미정인 분')
    .setHelpText('주제는 묻지 않아요. 고민되는 것만 편하게 적어주세요.');
  form.addCheckboxItem().setTitle('주제를 못 정한 이유에 가까운 것을 모두')
    .setChoiceValues(['딱히 관심 있는 분야가 없어요', '관심사가 너무 많아요', '내 생활이 평범해서 쓸 게 없는 것 같아요',
      '돈이 되는 주제인지 모르겠어요', '내가 꾸준히 할 수 있을지 모르겠어요', '사생활이 드러나는 게 걱정돼요',
      '안내문을 봐도 차이가 잘 안 느껴져요'])
    .showOtherOption(true)
    .setRequired(false);
  form.addParagraphTextItem().setTitle('주제를 못 정한 이유를 편하게 적어주세요').setRequired(true);
  form.addParagraphTextItem().setTitle('블로그로 정말 원하는 건 무엇인가요?')
    .setHelpText('주제가 아니라 "어떤 상태가 되면 좋겠는지"를 적어주세요. 예) "주말마다 어디든 공짜로 가보고 싶어요", "회사 말고 다른 수입이 조금이라도 있었으면"')
    .setRequired(true);
  form.addParagraphTextItem().setTitle('다예에게 물어보고 싶은 것').setRequired(false);

  // ── 섹션 7. 마무리 ──
  var secEnd = form.addPageBreakItem().setTitle('마무리');
  form.addParagraphTextItem().setTitle('안내문에서 어렵거나 더 알고 싶었던 부분').setRequired(false);
  form.addParagraphTextItem().setTitle('그 밖에 하고 싶은 말').setRequired(false);

  // 분기 연결: 결정함→6A, 후보→6B, 미정→6C / 6A·6B가 끝나면 마무리로
  statusItem.setChoices([
    statusItem.createChoice('결정했어요', secA),
    statusItem.createChoice('후보만 있어요', secB),
    statusItem.createChoice('아직 미정이에요', secC)
  ]);
  secB.setGoToPage(secEnd); // 6A 다음 → 마무리
  secC.setGoToPage(secEnd); // 6B 다음 → 마무리

  Logger.log('응답용 링크(지인에게 보낼 것): ' + form.getPublishedUrl());
  Logger.log('편집용 링크(다예용): ' + form.getEditUrl());
}

/**
 * 2026-10-08 수정: 겹치거나 덜 중요한 질문 정리 (같은 폼·같은 링크 유지)
 */
function updateBlogTopicForm() {
  var form = FormApp.openById('1Ca30kVm9sPKk3Rvk4FRLNzt9N2ZH91ggFD9TJqGcuRA');
  var removeTitles = [
    '그 밖에 얻고 싶은 것이 있다면 모두',
    '"이렇게 되면 좋겠다" 하는 모습이 있다면 적어주세요',
    '평소 사진 습관은?',
    '친구들이 나한테 자주 물어보는 것이 있나요?',
    '주로 글 쓸 수 있는 시간대는?',
    '글 하나에 쓸 수 있는 시간은?',
    '글쓰기에 AI(챗GPT 등)를 써볼 생각이 있나요?',
    '어느 쪽 블로그인가요?',
    '그 밖에 하고 싶은 말'
  ];
  var removed = [];
  form.getItems().forEach(function (item) {
    var t = item.getTitle();
    if (removeTitles.indexOf(t) !== -1) {
      form.deleteItem(item);
      removed.push(t);
    } else if (t === '최근 3개월 안에 해본 것 중 남들에게 알려주고 싶었던 것 3가지') {
      item.asParagraphTextItem()
        .setTitle('최근 한 달 동안 다녀온 곳이나 산 것 중 생각나는 것 (1개 이상)')
        .setHelpText('사소해도 괜찮아요. 여기서 첫 글 소재를 찾을 거예요.')
        .setRequired(false);
    } else if (t === '안내문에서 어렵거나 더 알고 싶었던 부분') {
      item.asParagraphTextItem().setTitle('궁금한 점이나 하고 싶은 말');
    }
  });
  Logger.log('삭제 ' + removed.length + '개: ' + removed.join(' / '));
  Logger.log('남은 질문 수(섹션 제외): ' + form.getItems().filter(function (i) {
    return i.getType() !== FormApp.ItemType.PAGE_BREAK;
  }).length);
}
