/**
 * 케넨홈 공구 "문자알림 신청" 구글 폼 자동 생성 스크립트 (달소유님 네이버폼 구성 그대로)
 * 사용법: script.google.com → 새 프로젝트 → 이 코드 전체 붙여넣기 → createAlarmForm 실행
 *         (처음 실행할 때 권한 허용 창이 뜨면 본인 계정으로 허용)
 * 실행이 끝나면 [실행 로그]에 응답용 짧은 링크(프로필 링크에 걸기)와 편집용 링크가 나와요.
 * 응답은 폼 [응답] 탭 → "Sheets에 연결"을 누르면 시트로 정리돼요.
 */

// ── 품목이 바뀌면 여기만 고치면 돼요 ──
var PRODUCTS = [
  '도노도노 베이비룸',
  '도노도노 바닥매트',
  '도노도노 기저귀갈이대',
  '도노도노 범보의자',
  '도노도노 하이체어',
  '하베브릭스 모빌',
  '하베브릭스 아기체육관',
];

function createAlarmForm() {
  var form = FormApp.create('🛎️문자알림 원하시는 분들만 요청해주세요 :)');
  form.setDescription('공구 오픈 당일에 구매 링크를 문자로 보내드려요.');
  form.setCollectEmail(false);
  form.setLimitOneResponsePerUser(false);   // 구글 로그인 없이도 신청할 수 있게
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);
  form.setConfirmationMessage('알림 신청 완료! 공구 오픈 당일에 문자로 링크 보내드릴게요 🙌');

  // 1. 알림신청 공구 선택(복수선택)
  form.addCheckboxItem().setTitle('알림신청 공구 선택(복수선택)')
    .setChoiceValues(PRODUCTS)
    .setRequired(true);

  // 2. 성함
  form.addTextItem().setTitle('성함')
    .setHelpText('이름을 입력해주세요.')
    .setRequired(true);

  // 3. 연락처(알림문자발송)
  form.addTextItem().setTitle('연락처(알림문자발송)')
    .setHelpText('연락처를 입력해주세요. (-없이 번호만 입력)')
    .setValidation(FormApp.createTextValidation()
      .requireTextMatchesPattern('^01[016789][0-9]{7,8}$')
      .setHelpText('-없이 숫자만 입력해주세요 (예: 01012345678)').build())
    .setRequired(true);

  // 4. 개인정보 수집 및 이용 동의
  form.addMultipleChoiceItem().setTitle('개인정보 수집 및 이용 동의')
    .setHelpText(
      '· 수집 항목: 성함, 연락처\n' +
      '· 수집 목적: 공구 오픈 알림 문자 발송\n' +
      '· 보유 기간: 알림 문자 발송 후 즉시 파기\n' +
      '· 동의를 거부하실 수 있으나, 이 경우 알림 문자를 받으실 수 없어요.'
    )
    .setChoiceValues(['동의합니다'])
    .setRequired(true);

  Logger.log('응답용 링크: ' + form.getPublishedUrl());
  Logger.log('짧은 링크 (프로필 링크에 걸기): ' + form.shortenFormUrl(form.getPublishedUrl()));
  Logger.log('편집용 링크: ' + form.getEditUrl());
}
