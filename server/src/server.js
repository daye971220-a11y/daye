require('dotenv').config();

const createApp = require('./app');
const scheduler = require('./services/scheduler');

const PORT = process.env.PORT || 4000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT} 에서 실행 중`);
  scheduler.start();
});
