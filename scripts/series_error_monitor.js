const axios = require('axios');
const { setTimeout } = require('timers/promises');

// 总循环次数和间隔时间（单位：毫秒）
const TOTAL_RUNS = 60;
const INTERVAL_MS = 60 * 1000; // 1分钟

async function main() {
  console.log(`🔄 开始循环监控任务，共执行 ${TOTAL_RUNS} 次，每次间隔 1 分钟`);

  for (let i = 1; i <= TOTAL_RUNS; i++) {
    console.log(`\n=== 第 ${i} 次执行 ===`);
    await monitor().catch(console.error);

    // 如果不是最后一次循环，则休眠
    if (i < TOTAL_RUNS) {
      console.log(`⏳ 等待 ${INTERVAL_MS / 1000} 秒后继续...`);
      await setTimeout(INTERVAL_MS);
    }
  }

  console.log('🎉 所有监控任务执行完成');
}

async function monitor() {
  console.log('🕒 开始执行定时检测任务...');
  console.log('当前时间:', new Date().toLocaleString('zh-CN'));

  try {
    const response = await axios.get('https://ammall.byd.com', {
      timeout: 10000,
      headers: { 'User-Agent': 'GitHub-Actions-Monitor/1.0' }
    });

    console.log('✅ 电商系统状态:', response.status);
    console.log('响应数据长度:', response.data.length);

    if (response.status !== 200) {
      await sendWecomNotification('电商系统异常', 'error');
    }

  } catch (error) {
    console.error('❌ 请求失败:', error.message);
    await sendWecomNotification('电商系统访问超时', 'error');
  }
}

async function sendWecomNotification(message, type) {
  const webhookUrl = process.env.WECOM_WEBHOOK_URL;
  const picUrlNormal = process.env.WECOM_PIC_URL_NORMAL;
  const picUrlError = process.env.WECOM_PIC_URL_ERROR;

  if (!webhookUrl || !picUrlNormal || !picUrlError) {
    console.error('❌ 缺少环境变量: WECOM_WEBHOOK_URL 或 WECOM_PIC_URL');
    return;
  }

  try {
    await axios.post(webhookUrl, {
      msgtype: 'news',
      news: {
        articles: [{
          title: `系统监控通知: ${message}`,
          description: `详情: ${message}\n时间: ${new Date().toLocaleString('zh-CN')}`,
          url: 'https://ammall.byd.com',
          picurl: type === 'error' ? picUrlError : picUrlNormal
        }]
      }
    });
    console.log('📨 通知发送成功');
  } catch (error) {
    console.error('通知发送失败:', error.response?.data || error.message);
  }
}

// 启动循环任务
main().catch(console.error);
