const axios = require('axios');

async function sendNotification() {
  console.log('🕒 开始发送通知任务...');
  console.log('当前时间:', new Date().toLocaleString('zh-CN'));

  // 直接发送通知（默认使用成功状态的图片）
  await sendWecomNotification('周五啦，记得填写周报哦~', 'normal');
}

async function sendWecomNotification(message, type) {
  // 从环境变量读取配置
  const webhookUrl = process.env.WECOM_WEBHOOK_REPORT_URL;
  const picUrlNormal = process.env.WECOM_PIC_URL_NORMAL;

  if (!webhookUrl || !picUrlNormal) {
    console.error('❌ 缺少环境变量配置');
    return;
  }

  try {
    const response = await axios.post(webhookUrl, {
      msgtype: 'news',
      news: {
        articles: [{
          title: `${message}`,
          description: `通知时间UTC: ${new Date().toLocaleString('zh-CN')}`,
          url: 'https://mall-test.byd.com',
          picurl: picUrlNormal
        }]
      }
    });
    console.log('📨 通知发送成功', response.data);
  } catch (error) {
    console.error('通知发送失败:', {
      error: error.message,
      response: error.response?.data
    });
  }
}

// 执行发送
sendNotification().catch(console.error);
