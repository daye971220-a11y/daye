/**
 * 케넨홈 육아용품 특가전 "알람 신청" 구글 폼 자동 생성 스크립트
 * 사용법: script.google.com → 새 프로젝트 → 이 코드 전체 붙여넣기 → createAlarmForm 실행
 *         (처음 실행할 때 권한 허용 창이 뜨면 본인 계정으로 허용)
 * 실행이 끝나면 [실행 로그]에 응답용 링크(프로필·스토리에 걸 링크)와 편집용 링크가 나와요.
 * 응답은 폼 [응답] 탭 → "Sheets에 연결"을 누르면 시트로 정리돼요.
 */

// ── 여기만 바꾸면 돼요 ──
var OPEN_DATE = '10월 20일';            // 일괄 오픈일 (게시물 기준. 프로필 소개에는 10/22라고 적혀 있어서 확인 필요)
var DURATION = '딱 3일간';
var ACCOUNT = '@kennen.home';
var PRODUCTS = [                        // 공개된 공구 (새 공구가 공개되면 여기에 한 줄 추가 → updateAlarmFormProducts 실행)
  '하베브릭스 아기체육관 + 양방향 모빌',
  '도노도노 트롤리 기저귀갈이대 세트',
  '도노도노 튼튼 밀림방지 베이비룸 + 한판 매트',
  '도노맘마존 4in1 러닝타워 폴딩 원목 하이체어',
];
var BABYROOM_SIZES = [
  '특대형 (216×143)', '슈퍼특대형 (253×143)', '자이언트 (290×180)',
  '슈퍼특대형 PLUS (253×216)', '자이언트 PLUS (290×216)', '아직 모르겠어요',
];

function createAlarmForm() {
  var form = FormApp.create('🔔 케넨홈 육아용품 특가전 알람 신청');
  form.setDescription(
    OPEN_DATE + ' 일괄 오픈, ' + DURATION + ' 진행해요!\n' +
    '알람 신청해주시면 오픈 당일에 공구 링크를 인스타 DM으로 보내드려요.\n\n' +
    '✔ ' + ACCOUNT + ' 팔로우를 해두셔야 DM이 요청함에 묻히지 않아요.\n' +
    '✔ 1분이면 끝나요!'
  );
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);   // 구글 로그인 없이도 신청할 수 있게
  form.setAllowResponseEdits(false);
  form.setProgressBar(false);
  form.setShowLinkToRespondAgain(false);
  form.setConfirmationMessage(
    '알람 신청 완료! 🙌\n' + OPEN_DATE + ' 오픈 당일에 DM으로 링크 보내드릴게요.\n' +
    'DM이 안 보이면 [메시지 요청함]도 꼭 확인해주세요 💌'
  );

  // 1. 꼭 필요한 것
  form.addTextItem().setTitle('인스타그램 아이디')
    .setHelpText('DM으로 링크를 보내드려요. @ 없이 정확하게 적어주세요 (예: kennen.home)')
    .setValidation(FormApp.createTextValidation()
      .requireTextMatchesPattern('^@?[A-Za-z0-9._]{1,30}$')
      .setHelpText('영문·숫자·마침표(.)·밑줄(_)만 쓸 수 있어요').build())
    .setRequired(true);

  form.addCheckboxItem().setTitle('알람 받고 싶은 공구를 모두 골라주세요')
    .setChoiceValues(PRODUCTS.concat(['앞으로 공개될 공구도 전부 받을래요']))
    .setRequired(true);

  // 2. 공구 준비에 도움 되는 것 (선택)
  form.addMultipleChoiceItem().setTitle('지금 어떤 시기세요?')
    .setChoiceValues(['임신 중이에요', '출산 후 0~6개월', '출산 후 7~12개월', '돌 지났어요', '선물하려고요'])
    .setRequired(false);

  form.addMultipleChoiceItem().setTitle('베이비룸 생각 있으시면, 어떤 사이즈가 맞을 것 같아요?')
    .setHelpText('수량 준비에 참고할게요. 베이비룸 + 한판 매트 세트 기준 (cm)')
    .setChoiceValues(BABYROOM_SIZES)
    .setRequired(false);

  form.addParagraphTextItem().setTitle('궁금한 점이나 공구로 만나고 싶은 육아템이 있다면 적어주세요')
    .setRequired(false);

  // 3. 동의
  form.addCheckboxItem().setTitle('개인정보 수집·이용 동의 (필수)')
    .setHelpText(
      '· 수집 항목: 인스타그램 아이디, 시기·사이즈 응답\n' +
      '· 수집 목적: 공구 오픈 알림 DM 발송, 공구 수량 준비\n' +
      '· 보유 기간: 이번 특가전 종료 후 30일 이내 파기\n' +
      '· 동의하지 않으실 수 있지만, 이 경우 알람 DM을 보내드릴 수 없어요.'
    )
    .setChoiceValues(['위 내용을 확인했고 동의해요'])
    .setRequired(true);

  Logger.log('응답용 링크 (프로필·스토리에 걸기): ' + form.getPublishedUrl());
  Logger.log('짧은 링크: ' + form.shortenFormUrl(form.getPublishedUrl()));
  Logger.log('편집용 링크: ' + form.getEditUrl());
}

/**
 * 새 공구가 공개되면 위 PRODUCTS에 한 줄 추가한 뒤 이 함수를 실행해요.
 * FORM_ID에는 편집용 링크의 /d/ 와 /edit 사이 글자를 붙여넣기.
 */
var FORM_ID = '';
function updateAlarmFormProducts() {
  var form = FormApp.openById(FORM_ID);
  var item = form.getItems(FormApp.ItemType.CHECKBOX).filter(function (it) {
    return it.getTitle() === '알람 받고 싶은 공구를 모두 골라주세요';
  })[0];
  item.asCheckboxItem().setChoiceValues(PRODUCTS.concat(['앞으로 공개될 공구도 전부 받을래요']));
  Logger.log('공구 목록 업데이트 완료: ' + PRODUCTS.length + '개');
}
