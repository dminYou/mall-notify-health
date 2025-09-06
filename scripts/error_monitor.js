const axios = require('axios');

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
    await sendWecomNotification('电商域名无法访问', 'error');
  }
}

async function sendWecomNotification(message, type) {
  // 从环境变量读取敏感信息
  const webhookUrl = process.env.WECOM_WEBHOOK_URL;
  const picUrlNormal = process.env.WECOM_PIC_URL_NORMAL; // 正常图片
  const picUrlError = process.env.WECOM_PIC_URL_ERROR;   // 错误图片

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

monitor().catch(console.error);