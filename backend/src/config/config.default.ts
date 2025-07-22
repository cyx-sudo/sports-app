import { MidwayConfig } from '@midwayjs/core';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1752288351042_6707',
  koa: {
    port: 7001,
  },
  cors: {
    origin: 'http://localhost:5173', // 前端开发服务器地址
    credentials: true,
  },
} as MidwayConfig;
