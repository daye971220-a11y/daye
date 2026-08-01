const cron = require('node-cron');
const { collectAll } = require('./collector');
const { computeAll } = require('./trendEngine');

async function runCycle() {
  const startedAt = Date.now();
  try {
    const collected = await collectAll();
    const totalCollected = Object.values(collected).reduce((sum, n) => sum + n, 0);

    const { summary: computed } = await computeAll();
    const totalTrends = Object.values(computed).reduce((sum, n) => sum + n, 0);

    const tookSec = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log(
      `[scheduler] ${new Date().toISOString()} - 새 기사 ${totalCollected}건 수집, 트렌드 ${totalTrends}건 계산 (${tookSec}s)`
    );
  } catch (err) {
    console.error('[scheduler] 수집/계산 사이클 실패:', err.message);
  }
}

function start() {
  const intervalMin = Number(process.env.COLLECT_INTERVAL_MIN) || 10;

  // 부팅 시 1회 즉시 실행
  runCycle();

  const cronExpr = `*/${intervalMin} * * * *`;
  cron.schedule(cronExpr, runCycle);
  console.log(`[scheduler] ${intervalMin}분마다 뉴스 수집 예약됨`);
}

module.exports = { start };
